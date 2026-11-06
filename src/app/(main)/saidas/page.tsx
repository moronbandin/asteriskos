import Link from "next/link";
import { asc } from "drizzle-orm";
import { requireMe } from "@/lib/session";
import { db } from "@/lib/db";
import { events } from "@/lib/schema";
import { md } from "@/lib/grammar";

export const metadata = { title: "Viaxe e saídas" };

export default async function Saidas() {
  const me = await requireMe();
  const all = await db.select().from(events).orderBy(asc(events.order), asc(events.id));
  const trips = all.filter((e) => e.kind === "viaxe");
  const out = all.filter((e) => e.kind === "saida");
  const bodies = new Map(await Promise.all(all.map(async (e) => [e.id, await md(e.body)] as const)));
  return (
    <div className="stack" style={{ gap: 32 }}>
      <div className="row between" style={{ alignItems: "flex-end" }}>
        <div className="big-hello"><span className="eyebrow">Fóra da aula</span><h1>Viaxe e saídas</h1></div>
        {me.role === "profesor" && <Link href="/xestion/saidas" className="btn sm accent">Xestionar</Link>}
      </div>
      {trips.map((e) => (
        <section key={e.id} className="hero c-sun" style={{ gap: 14 }}>
          <span className="small" style={{ fontWeight: 700 }}>Viaxe de estudos{e.when ? `, ${e.when}` : ""}</span>
          <h1>{e.title}</h1>
          {e.audience && <span className="pill" style={{ alignSelf: "flex-start", background: "var(--card)", color: "var(--ink)" }}>{e.audience}</span>}
          <div className="prose" style={{ color: "var(--ink)" }} dangerouslySetInnerHTML={{ __html: bodies.get(e.id) || "" }} />
        </section>
      ))}
      <section className="stack-sm">
        <h2>Saídas deste curso</h2>
        {out.length === 0 ? <div className="empty">Aínda non hai saídas programadas.</div> : (
          <div className="grid">
            {out.map((e) => (
              <article key={e.id} className="card stack-sm">
                <span className="eyebrow">{e.when || "Data por confirmar"}</span>
                <h3>{e.title}</h3>
                {e.audience && <span className="pill line" style={{ alignSelf: "flex-start" }}>{e.audience}</span>}
                <div className="small prose" dangerouslySetInnerHTML={{ __html: bodies.get(e.id) || "" }} />
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
