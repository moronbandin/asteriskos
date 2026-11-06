"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "./db";
import {
  assignmentDone, assignments, enrollments, events, favorites, groups, links, news, posts,
  resources, subjects, threads, units, users, type ResourceKind,
} from "./schema";
import { requireProfe } from "./session";
import { SCHOOL_DOMAIN, SCHOOL_YEAR } from "./config";

const s = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const n = (f: FormData, k: string) => {
  const v = Number(f.get(k));
  return Number.isFinite(v) && v > 0 ? v : null;
};
const done = () => revalidatePath("/", "layout");

function normEmail(raw: string) {
  const e = raw.trim().toLowerCase();
  if (!e) return "";
  if (e.includes("@")) return e;
  return SCHOOL_DOMAIN ? `${e}@${SCHOOL_DOMAIN}` : "";
}

/* ── Alumnado ────────────────────────────────────────── */

async function upsertStudent(name: string, email: string, groupId: number | null) {
  const [u] = await db
    .insert(users)
    .values({ name, email, role: "alumno", active: true })
    .onConflictDoUpdate({ target: users.email, set: { name, active: true } })
    .returning();
  if (groupId) {
    await db.insert(enrollments).values({ userId: u.id, groupId }).onConflictDoNothing();
  }
  return u;
}

export async function addStudent(f: FormData) {
  await requireProfe();
  const name = s(f, "name");
  const email = normEmail(s(f, "email"));
  if (!name || !email) return;
  await upsertStudent(name, email, n(f, "groupId"));
  done();
}

/** Unha persoa por liña:  Nome Apelidos; correo  (o correo pode ir sen @dominio) */
export async function bulkAddStudents(f: FormData) {
  await requireProfe();
  const groupId = n(f, "groupId");
  const lines = s(f, "list").split("\n").map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    const [name, mail] = line.split(/[;\t]/).map((x) => x.trim());
    const email = normEmail(mail || "");
    if (name && email) await upsertStudent(name, email, groupId);
  }
  done();
}

export async function setActive(userId: number, active: boolean) {
  await requireProfe();
  await db.update(users).set({ active }).where(and(eq(users.id, userId), eq(users.role, "alumno")));
  done();
}

export async function setEnrollment(userId: number, groupId: number, on: boolean) {
  await requireProfe();
  const where = and(eq(enrollments.userId, userId), eq(enrollments.groupId, groupId));
  if (on) await db.insert(enrollments).values({ userId, groupId }).onConflictDoNothing();
  else await db.delete(enrollments).where(where);
  done();
}

/* ── Materias, grupos e unidades ─────────────────────── */

export async function createSubject(f: FormData) {
  await requireProfe();
  const name = s(f, "name");
  const level = s(f, "level");
  if (!name || !level) return;
  const slug = (name + "-" + level)
    .toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const [sub] = await db.insert(subjects).values({ name, level, slug, color: s(f, "color") || "blue", order: 50 }).returning();
  await db.insert(groups).values({ subjectId: sub.id, name, schoolYear: SCHOOL_YEAR });
  done();
}

export async function createGroup(subjectId: number) {
  await requireProfe();
  const [sub] = await db.select().from(subjects).where(eq(subjects.id, subjectId));
  if (!sub) return;
  const exists = await db.select().from(groups)
    .where(and(eq(groups.subjectId, subjectId), eq(groups.schoolYear, SCHOOL_YEAR)));
  if (!exists.length) await db.insert(groups).values({ subjectId, name: sub.name, schoolYear: SCHOOL_YEAR });
  done();
}

export async function createUnit(f: FormData) {
  await requireProfe();
  const subjectId = n(f, "subjectId");
  const title = s(f, "title");
  if (!subjectId || !title) return;
  const existing = await db.select().from(units).where(eq(units.subjectId, subjectId));
  const number = n(f, "number") ?? existing.length + 1;
  await db.insert(units).values({ subjectId, title, number, summary: s(f, "summary") || null });
  done();
}

export async function setUnitStatus(unitId: number, status: "proxima" | "agora" | "vista") {
  await requireProfe();
  await db.update(units).set({ status }).where(eq(units.id, unitId));
  done();
}

/* ── Recursos ────────────────────────────────────────── */

export async function createResource(f: FormData) {
  await requireProfe();
  const title = s(f, "title");
  const kind = s(f, "kind") as ResourceKind;
  if (!title || !kind) return;
  const unitId = n(f, "unitId");
  let subjectId = n(f, "subjectId");
  if (unitId && !subjectId) {
    const [u] = await db.select().from(units).where(eq(units.id, unitId));
    subjectId = u?.subjectId ?? null;
  }
  await db.insert(resources).values({
    title, kind, subjectId, unitId,
    description: s(f, "description") || null,
    url: s(f, "url") || null,
    grammarSlug: s(f, "grammarSlug") || null,
  });
  done();
}

export async function toggleResourceVisible(id: number, visible: boolean) {
  await requireProfe();
  await db.update(resources).set({ visible }).where(eq(resources.id, id));
  done();
}

export async function deleteResource(id: number) {
  await requireProfe();
  await db.delete(favorites).where(eq(favorites.resourceId, id));
  await db.update(assignments).set({ resourceId: null }).where(eq(assignments.resourceId, id));
  await db.delete(resources).where(eq(resources.id, id));
  done();
}

/* ── Deberes ─────────────────────────────────────────── */

export async function createAssignment(f: FormData) {
  await requireProfe();
  const title = s(f, "title");
  const groupIds = f.getAll("groupId").map(Number).filter((x) => x > 0);
  if (!title || !groupIds.length) return;
  for (const groupId of groupIds) {
    await db.insert(assignments).values({
      groupId, title,
      description: s(f, "description") || null,
      dueDate: s(f, "dueDate") || null,
      resourceId: n(f, "resourceId"),
    });
  }
  done();
}

export async function deleteAssignment(id: number) {
  await requireProfe();
  await db.delete(assignmentDone).where(eq(assignmentDone.assignmentId, id));
  await db.delete(assignments).where(eq(assignments.id, id));
  done();
}

/* ── Novidades ───────────────────────────────────────── */

export async function createNews(f: FormData) {
  await requireProfe();
  const title = s(f, "title");
  const body = s(f, "body");
  if (!title || !body) return;
  await db.insert(news).values({
    title, body,
    tag: s(f, "tag") || null,
    link: s(f, "link") || null,
    groupId: n(f, "groupId"),
    pinned: f.get("pinned") === "on",
  });
  done();
}

export async function togglePin(id: number, pinned: boolean) {
  await requireProfe();
  await db.update(news).set({ pinned }).where(eq(news.id, id));
  done();
}

export async function deleteNews(id: number) {
  await requireProfe();
  await db.delete(news).where(eq(news.id, id));
  done();
}

/* ── Foros ───────────────────────────────────────────── */

export async function createThread(f: FormData) {
  await requireProfe();
  const title = s(f, "title");
  const groupId = n(f, "groupId");
  if (!title || !groupId) return;
  await db.insert(threads).values({ title, groupId, prompt: s(f, "prompt") || null });
  done();
}

export async function setPostHidden(postId: number, hidden: boolean) {
  await requireProfe();
  await db.update(posts).set({ hidden }).where(eq(posts.id, postId));
  done();
}

export async function setThreadClosed(threadId: number, closed: boolean) {
  await requireProfe();
  await db.update(threads).set({ closed }).where(eq(threads.id, threadId));
  done();
}

/* ── Biblioteca e saídas ─────────────────────────────── */

export async function createLink(f: FormData) {
  await requireProfe();
  const title = s(f, "title");
  const url = s(f, "url");
  const category = s(f, "category");
  if (!title || !url || !category) return;
  await db.insert(links).values({ title, url, category, description: s(f, "description") || null });
  done();
}

export async function deleteLink(id: number) {
  await requireProfe();
  await db.delete(links).where(eq(links.id, id));
  done();
}

export async function createEvent(f: FormData) {
  await requireProfe();
  const title = s(f, "title");
  if (!title) return;
  await db.insert(events).values({
    title,
    kind: s(f, "kind") === "viaxe" ? "viaxe" : "saida",
    when: s(f, "when") || null,
    audience: s(f, "audience") || null,
    body: s(f, "body") || null,
  });
  done();
}

export async function deleteEvent(id: number) {
  await requireProfe();
  await db.delete(events).where(eq(events.id, id));
  done();
}
