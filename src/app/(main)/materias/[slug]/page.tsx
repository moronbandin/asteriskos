import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { requireMe } from "@/lib/session";
import { canSeeSubject, myFavoriteIds } from "@/lib/queries";
import { db } from "@/lib/db";
import { resources, subjects, units } from "@/lib/schema";
import { ResourceItem } from "@/components/ResourceItem";

const STATUS = { agora: "Agora", vista: "Vista", proxima: "Próxima" } as const;

export default async function Materia({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const me = await requireMe();
  const [s] = await db.select().from(subjects).where(eq(subjects.slug, slug));
  if (!s || !(await canSeeSubject(me, s.id))) notFound();
  const profe = me.role === "profesor";
  const [us, general, favs] = await Promise.all([
    db.select().from(units).where(eq(units.subjectId, s.id)).orderBy(asc(units.number)),
    db.select().from(resources)
      .where(and(eq(resources.subjectId, s.id), isNull(resources.unitId), ...(profe ? [] : [eq(resources.visible, true)])))
      .orderBy(desc(resources.createdAt)),
    myFavoriteIds(me),
  ]);

  return (
    <div className={`stack c-${s.color}`} style={{ gap: 28 }}>
      <Link href="/materias" className="small muted" style={{ fontWeight: 600 }}>← Materias</Link>
      <div className="hero">
        <span className="small" style={{ fontWeight: 700 }}>{s.level}</span>
        <h1>{s.name}</h1>
        {s.description && <p style={{ color: "var(--ink)", opacity: .8, maxWidth: "60ch" }}>{s.description}</p>}
      </div>

      <div className="split">
        <section className="stack-sm">
          <div className="row between"><h2>Unidades</h2>{profe && <Link href="/xestion/contidos" className="btn sm ghost">Xestionar</Link>}</div>
          {us.length === 0 && <div className="empty">Aínda non hai unidades.</div>}
          <div className="stack-sm">
            {us.map((u) => (
              <Link key={u.id} href={`/materias/${s.slug}/${u.number}`} className="card tight hover row" style={{ flexWrap: "nowrap", gap: 14 }}>
                <span className="kind" style={u.status === "agora" ? { background: "var(--c-fg)", color: "var(--card)" } : undefined}>
                  <b style={{ fontFamily: "var(--f-display)", fontSize: 19 }}>{u.number}</b>
                </span>
                <span className="min0" style={{ flex: 1 }}>
                  <b style={{ display: "block", lineHeight: 1.3 }}>{u.title}</b>
                  {u.summary && <span className="small muted">{u.summary}</span>}
                </span>
                <span className={`pill ${u.status === "agora" ? "" : "line"}`}>{STATUS[u.status]}</span>
              </Link>
            ))}
          </div>
        </section>

        <aside className="stack-sm">
          <h2>Para toda a materia</h2>
          {general.length === 0 ? <p className="muted small">Aquí irán os materiais xerais: programación, criterios, libros de lectura…</p> : (
            <div className="card" style={{ paddingBlock: 6 }}>
              <div className="list">{general.map((r) => <ResourceItem key={r.id} r={r} fav={favs.has(r.id)} color={s.color} />)}</div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
