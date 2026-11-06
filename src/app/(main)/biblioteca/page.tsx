import { asc } from "drizzle-orm";
import { requireMe } from "@/lib/session";
import { db } from "@/lib/db";
import { links } from "@/lib/schema";
import { Icon } from "@/components/icons";
import Link from "next/link";

export const metadata = { title: "Biblioteca" };

export default async function Biblioteca() {
  const me = await requireMe();
  const all = await db.select().from(links).orderBy(asc(links.order), asc(links.title));
  const cats = [...new Set(all.map((l) => l.category))];
  return (
    <div className="stack" style={{ gap: 32 }}>
      <div className="row between" style={{ alignItems: "flex-end" }}>
        <div className="big-hello"><span className="eyebrow">Biblioteca</span><h1>Para buscar e ler máis.</h1></div>
        {me.role === "profesor" && <Link href="/xestion/biblioteca" className="btn sm accent">Engadir ligazón</Link>}
      </div>
      {cats.length === 0 && <div className="empty">Aínda non hai ligazóns.</div>}
      {cats.map((c) => (
        <section key={c} className="stack-sm">
          <h2>{c}</h2>
          <div className="grid">
            {all.filter((l) => l.category === c).map((l) => (
              <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer" className="card hover row" style={{ flexWrap: "nowrap", alignItems: "flex-start", gap: 14 }}>
                <span className="kind"><Icon.ligazon /></span>
                <span className="min0"><b style={{ display: "block" }}>{l.title}</b>{l.description && <span className="small muted">{l.description}</span>}</span>
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
