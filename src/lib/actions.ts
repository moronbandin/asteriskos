"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "./db";
import { assignmentDone, assignments, favorites, posts, threads } from "./schema";
import { requireMe } from "./session";
import { myGroups } from "./queries";

export async function toggleFavorite(resourceId: number) {
  const me = await requireMe();
  const where = and(eq(favorites.userId, me.id), eq(favorites.resourceId, resourceId));
  const [has] = await db.select().from(favorites).where(where);
  if (has) await db.delete(favorites).where(where);
  else await db.insert(favorites).values({ userId: me.id, resourceId });
  revalidatePath("/", "layout");
  return !has;
}

export async function toggleDone(assignmentId: number) {
  const me = await requireMe();
  const [a] = await db.select().from(assignments).where(eq(assignments.id, assignmentId));
  if (!a) return false;
  const mine = (await myGroups(me)).some((g) => g.group.id === a.groupId);
  if (!mine) return false;
  const where = and(eq(assignmentDone.userId, me.id), eq(assignmentDone.assignmentId, assignmentId));
  const [has] = await db.select().from(assignmentDone).where(where);
  if (has) await db.delete(assignmentDone).where(where);
  else await db.insert(assignmentDone).values({ userId: me.id, assignmentId });
  revalidatePath("/", "layout");
  return !has;
}

export async function reply(threadId: number, formData: FormData) {
  const me = await requireMe();
  const body = String(formData.get("body") || "").trim().slice(0, 4000);
  if (!body) return;
  const [t] = await db.select().from(threads).where(eq(threads.id, threadId));
  if (!t || t.closed) return;
  const mine = (await myGroups(me)).some((g) => g.group.id === t.groupId);
  if (!mine) return;
  await db.insert(posts).values({ threadId, userId: me.id, body });
  revalidatePath(`/foros/${threadId}`);
}
