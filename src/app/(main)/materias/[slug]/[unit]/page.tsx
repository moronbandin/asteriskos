import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { requireMe } from "@/lib/session";
import { canSeeSubject, myFavoriteIds } from "@/lib/queries";
import { db } from "@/lib/db";
import { RESOURCE_KINDS, resources, subjects, units, type ResourceKind } from "@/lib/schema";
import { ResourceItem } from "@/components/ResourceItem";
import { md } from "@/lib/grammar";

export default async function Unidade({ params, searchParams }: {
  params: Promise<{ slug: string; unit: string }>;
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { slug, unit } = await params;
  const { tipo } = await searchParams;
  const me = await requireMe();
  const [s] = await db.select().from(subjects).where(eq(subjects.slug, slug));
  if (!s || !(await canSeeSubject(me, s.id))) notFound();
  const [u] = await db.select().from(units).where(and(eq(units.subjectId, s.id), eq(units.number, Number(unit))));
  if (!u) notFound();
  const profe = me.role === "profesor";

  const all = await db.select().from(resources)
    .where(and(eq(resources.unitId, u.id), ...(profe ? [] : [eq(resources.visible, true)])))
    .orderBy(asc(resources.createdAt));
  const favs = await myFavoriteIds(me);
  const kinds = (Object.keys(RESOURCE_KINDS) as ResourceKind[]).filter((k) => all.some((r) => r.kind === k));
  const shown = tipo && kinds.includes(tipo as ResourceKind) ? all.filter((r) => r.kind === tipo) : all;
  const summary = await md(u.summary);
  const base = `/materias/${s.slug}/${u.number}`;

  return (
    <div className={`stack c-${s.color}`} style={{ gap: 24 }}>
      <Link href={`/materias/${s.slug}`} className="small muted" style={{ fontWeight: 600 }}>← {s.name}</Link>
      <div className="hero">
        <span className="small" style={{ fontWeight: 700 }}>{s.name}, unidade {u.number}</span>
        <h1>{u.title}</h1>
        {summary && <div style={{ color: "var(--ink)", opacity: .8 }} dangerouslySetInnerHTML={{ __html: summary }} />}
      </div>

      {kinds.length > 1 && (
        <nav className="chips" aria-label="Filtrar por tipo">
          <Link href={base} aria-current={!tipo ? "true" : undefined}>Todo</Link>
          {kinds.map((k) => <Link key={k} href={`${base}?tipo=${k}`} aria-current={tipo === k ? "true" : undefined}>{RESOURCE_KINDS[k]}</Link>)}
        </nav>
      )}

      {shown.length === 0 ? <div className="empty">Aínda non hai materiais nesta unidade.{profe && <> <Link href="/xestion/recursos" style={{ color: "var(--accent)" }}>Engadir</Link></>}</div> : (
        <div className="card" style={{ paddingBlock: 6 }}>
          <div className="list">{shown.map((r) => <ResourceItem key={r.id} r={r} fav={favs.has(r.id)} color={s.color} />)}</div>
        </div>
      )}
      <p className="tiny muted">Toca o corazón para gardar un material no teu espazo.</p>
    </div>
  );
}
