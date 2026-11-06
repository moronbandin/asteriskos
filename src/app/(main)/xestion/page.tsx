import Link from "next/link";
import { count, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { assignments, news, resources, users } from "@/lib/schema";

export default async function Resumo() {
  const [[a], [b], [r], [d], [nw]] = await Promise.all([
    db.select({ n: count() }).from(users).where(eq(users.active, true)),
    db.select({ n: count() }).from(users).where(eq(users.active, false)),
    db.select({ n: count() }).from(resources),
    db.select({ n: count() }).from(assignments),
    db.select({ n: count() }).from(news),
  ]);
  const cards = [
    ["/xestion/deberes", "Poñer deberes", "Elixe un ou varios grupos e aparecerá no inicio de cada alumno."],
    ["/xestion/recursos", "Subir un material", "PDF, ligazón, vídeo ou punto da gramática, nunha unidade."],
    ["/xestion/novidades", "Publicar unha novidade", "Para todo o departamento ou só para un grupo."],
    ["/xestion/alumnado", "Dar de alta alumnado", "Pega a lista e escolle o grupo."],
  ];
  return (
    <div className="stack" style={{ gap: 28 }}>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))" }}>
        <div className="card stat"><b>{a.n}</b><span className="small muted">contas activas</span></div>
        <div className="card stat"><b>{b.n}</b><span className="small muted">de baixa</span></div>
        <div className="card stat"><b>{r.n}</b><span className="small muted">materiais</span></div>
        <div className="card stat"><b>{d.n}</b><span className="small muted">deberes</span></div>
        <div className="card stat"><b>{nw.n}</b><span className="small muted">novidades</span></div>
      </div>
      <div className="grid">
        {cards.map(([href, t, d]) => (
          <Link key={href} href={href} className="card hover stack-sm"><h3>{t}</h3><p className="small muted">{d}</p><span style={{ color: "var(--accent)", fontWeight: 700 }}>Ir →</span></Link>
        ))}
      </div>
      <div className="card stack-sm">
        <h3>A gramática edítase como ficheiros</h3>
        <p className="small muted prose">Cada punto da gramática é un ficheiro de texto no cartafol <span className="mono">content/gramatica</span> do proxecto. Ao gardar un cambio e publicalo, actualízase na web.</p>
      </div>
    </div>
  );
}
