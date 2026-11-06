import { and, asc, desc, eq, inArray, isNull, or } from "drizzle-orm";
import { db } from "./db";
import {
  assignments, assignmentDone, enrollments, favorites, groups, news, resources, subjects, units,
} from "./schema";
import { SCHOOL_YEAR } from "./config";
import type { Me } from "./session";

export type Subject = typeof subjects.$inferSelect;
export type Group = typeof groups.$inferSelect;
export type Resource = typeof resources.$inferSelect;
export type Unit = typeof units.$inferSelect;

/** Grupos deste curso. O profesor ve todos; o alumnado, os seus. */
export async function myGroups(me: Me) {
  const base = db
    .select({ group: groups, subject: subjects })
    .from(groups)
    .innerJoin(subjects, eq(groups.subjectId, subjects.id));
  if (me.role === "profesor") {
    return base.where(eq(groups.schoolYear, SCHOOL_YEAR)).orderBy(asc(subjects.order));
  }
  return base
    .innerJoin(enrollments, eq(enrollments.groupId, groups.id))
    .where(and(eq(groups.schoolYear, SCHOOL_YEAR), eq(enrollments.userId, me.id)))
    .orderBy(asc(subjects.order));
}

/** Todo o histórico de grupos dunha persoa (anos anteriores incluídos). */
export async function groupHistory(userId: number) {
  return db
    .select({ group: groups, subject: subjects })
    .from(enrollments)
    .innerJoin(groups, eq(enrollments.groupId, groups.id))
    .innerJoin(subjects, eq(groups.subjectId, subjects.id))
    .where(eq(enrollments.userId, userId))
    .orderBy(asc(groups.schoolYear), asc(subjects.order));
}

export async function mySubjects(me: Me): Promise<Subject[]> {
  if (me.role === "profesor") return db.select().from(subjects).orderBy(asc(subjects.order));
  const rows = await myGroups(me);
  const seen = new Map<number, Subject>();
  rows.forEach((r) => seen.set(r.subject.id, r.subject));
  return [...seen.values()];
}

export async function canSeeSubject(me: Me, subjectId: number) {
  if (me.role === "profesor") return true;
  return (await mySubjects(me)).some((s) => s.id === subjectId);
}

/** Deberes dos meus grupos, cos que xa marquei como feitos. */
export async function myAssignments(me: Me) {
  const gs = await myGroups(me);
  const ids = gs.map((g) => g.group.id);
  if (!ids.length) return [];
  const rows = await db
    .select({ a: assignments, group: groups, subject: subjects, resource: resources })
    .from(assignments)
    .innerJoin(groups, eq(assignments.groupId, groups.id))
    .innerJoin(subjects, eq(groups.subjectId, subjects.id))
    .leftJoin(resources, eq(assignments.resourceId, resources.id))
    .where(inArray(assignments.groupId, ids))
    .orderBy(asc(assignments.dueDate), desc(assignments.createdAt));
  const done = await db.select().from(assignmentDone).where(eq(assignmentDone.userId, me.id));
  const doneSet = new Set(done.map((d) => d.assignmentId));
  return rows.map((r) => ({ ...r, done: doneSet.has(r.a.id) }));
}

/** Novidades para todo o departamento e para os meus grupos. */
export async function myNews(me: Me, limit = 20) {
  const ids = (await myGroups(me)).map((g) => g.group.id);
  const where = me.role === "profesor"
    ? undefined
    : ids.length ? or(isNull(news.groupId), inArray(news.groupId, ids)) : isNull(news.groupId);
  return db
    .select({ n: news, group: groups })
    .from(news)
    .leftJoin(groups, eq(news.groupId, groups.id))
    .where(where)
    .orderBy(desc(news.pinned), desc(news.createdAt))
    .limit(limit);
}

export async function myFavoriteIds(me: Me) {
  const rows = await db.select({ id: favorites.resourceId }).from(favorites).where(eq(favorites.userId, me.id));
  return new Set(rows.map((r) => r.id));
}

export async function myFavorites(me: Me) {
  return db
    .select({ r: resources, subject: subjects, unit: units })
    .from(favorites)
    .innerJoin(resources, eq(favorites.resourceId, resources.id))
    .leftJoin(subjects, eq(resources.subjectId, subjects.id))
    .leftJoin(units, eq(resources.unitId, units.id))
    .where(eq(favorites.userId, me.id))
    .orderBy(desc(favorites.createdAt));
}
