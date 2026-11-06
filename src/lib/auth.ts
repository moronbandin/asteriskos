import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { users } from "./schema";
import { ADMIN_EMAILS } from "./config";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      // Sempre pregunta que conta usar: hai quen ten a do centro e o Gmail
      authorization: { params: { prompt: "select_account" } },
    }),
    // Entrada de proba SÓ no ordenador (npm run dev): escribes un correo e entras sen Google.
    // En Vercel non existe. Segue a mesma regra: ou é profesor ou ten que estar dado de alta.
    ...(process.env.NODE_ENV === "development"
      ? [CredentialsProvider({
          id: "local",
          name: "Proba local",
          credentials: { email: { label: "Correo", type: "email" } },
          async authorize(c) {
            const email = String(c?.email || "").trim().toLowerCase();
            return email ? { id: email, email, name: email.split("@")[0] } : null;
          },
        })]
      : []),
  ],
  pages: { signIn: "/entrar", error: "/entrar" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  callbacks: {
    async signIn({ user, profile }) {
      const email = user.email?.toLowerCase();
      const verified = (profile as { email_verified?: boolean } | undefined)?.email_verified;
      if (!email || verified === false) return "/entrar?erro=conta";

      // Profesorado: entra sempre e créase se non existe
      if (ADMIN_EMAILS.includes(email)) {
        await db
          .insert(users)
          .values({ email, name: user.name || email, role: "profesor", image: user.image })
          .onConflictDoUpdate({ target: users.email, set: { role: "profesor", active: true, image: user.image } });
        return true;
      }

      // Alumnado: calquera conta de Google (do centro ou Gmail), pero só se o profesor a deu de alta
      const [u] = await db.select().from(users).where(eq(users.email, email));
      if (!u) return "/entrar?erro=sen-alta";
      if (!u.active) return "/entrar?erro=baixa";
      if (user.image && u.image !== user.image) {
        await db.update(users).set({ image: user.image }).where(eq(users.id, u.id));
      }
      return true;
    },
  },
};
