import { cache } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { authOptions } from "./auth";
import { db } from "./db";
import { users } from "./schema";

export type Me = typeof users.$inferSelect;

// Le a persoa desde a base de datos en cada petición:
// se o profesor a dá de baixa, deixa de entrar ao momento.
export const getMe = cache(async (): Promise<Me | null> => {
  const s = await getServerSession(authOptions);
  const email = s?.user?.email?.toLowerCase();
  if (!email) return null;
  const [u] = await db.select().from(users).where(eq(users.email, email));
  if (!u || !u.active) return null;
  return u;
});

export async function requireMe(): Promise<Me> {
  const me = await getMe();
  if (!me) redirect("/entrar");
  return me;
}

export async function requireProfe(): Promise<Me> {
  const me = await requireMe();
  if (me.role !== "profesor") redirect("/");
  return me;
}
