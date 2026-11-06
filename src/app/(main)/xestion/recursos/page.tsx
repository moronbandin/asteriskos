import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { RESOURCE_KINDS, resources, subjects, units } from "@/lib/schema";
import { listGrammar } from "@/lib/grammar";
import { createResource, deleteResource, toggleResourceVisible } from "@/lib/admin-actions";
import { Icon } from "@/components/icons";

export default async function Recursos({ searchParams }: { searchParams: Promise<{ materia?: string }> }) {
  const sp = await searchParams;
  const subs = await db.select().from(subjects).orderBy(asc(subjects.order));
  const us = await db.select().from(units).orderBy(asc(units.number));
  const gram = await listGrammar();
  const filter = Number(sp.materia) || null;
  const rs = await db.select().from(resources)
    .where(filter ? eq(resources.subjectId, filter) : undefined)
    .orderBy(desc(resources.createdAt)).limit(200);

  return (
    <div className="stack" style={{ gap: 20 }}>
      <details className="adder" open>
        <summary>Engadir un material</summary>
        <form action={createResource} className="inner form-grid">
          <label className="f">Tipo
            <select name="kind">{Object.entries(RESOURCE_KINDS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          </label>
          <label className="f">Unidade
            <select name="unitId">
              <option value="">Para toda a materia</option>
              {subs.map((s) => (
                <optgroup key={s.id} label={`${s.name} (${s.level})`}>
                  {us.filter((u) => u.subjectId === s.id).map((u) => <option key={u.id} value={u.id}>{u.number}. {u.title}</option>)}
                </optgroup>
              ))}
            </select>
          </label>
          <label className="f">Materia (se é para toda a materia)
            <select name="subjectId"><option value="">Da unidade</option>{subs.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.level})</option>)}</select>
          </label>
          <label className="f full">Título<input type="text" name="title" required placeholder="Ficha de exercicios 3A" /></label>
          <label className="f full">Descrición curta (opcional)<input type="text" name="description" placeholder="Declinar e recoñecer formas" /></label>
          <label className="f full">Ligazón
            <input type="url" name="url" placeholder="https://drive.google.com/…  ou YouTube, unha web…" />
            <span className="small muted" style={{ fontWeight: 400 }}>Para un PDF do Drive: Compartir → «Calquera persoa coa ligazón» → Copiar ligazón.</span>
          </label>
          <label className="f">Ou un punto da gramática
            <select name="grammarSlug"><option value="">Ningún</option>{gram.map((g) => <option key={g.slug} value={g.slug}>{g.title}</option>)}</select>
          </label>
          <div><button className="btn accent">Engadir</button></div>
        </form>
      </details>

      <nav className="chips" aria-label="Filtrar por materia">
        <a href="/xestion/recursos" aria-current={!filter ? "true" : undefined}>Todos</a>
        {subs.map((s) => <a key={s.id} href={`/xestion/recursos?materia=${s.id}`} aria-current={filter === s.id ? "true" : undefined}>{s.name}</a>)}
      </nav>

      {rs.length === 0 ? <div className="empty">Aínda non hai materiais.</div> : (
        <div className="card" style={{ paddingBlock: 6 }}>
          <div className="list">
            {rs.map((r) => {
              const s = subs.find((x) => x.id === r.subjectId);
              const u = us.find((x) => x.id === r.unitId);
              const I = Icon[r.kind] ?? Icon.ligazon;
              return (
                <div key={r.id} className={`item ${s ? "c-" + s.color : ""}`}>
                  <span className="kind"><I /></span>
                  <div className="min0">
                    <div className="t">{r.title} {!r.visible && <span className="pill line">Oculto</span>}</div>
                    <div className="d">{RESOURCE_KINDS[r.kind]}{s ? `, ${s.name}` : ""}{u ? `, unidade ${u.number}` : ""}</div>
                  </div>
                  <div className="actions">
                    <form action={toggleResourceVisible.bind(null, r.id, !r.visible)}><button className="btn sm line">{r.visible ? "Ocultar" : "Mostrar"}</button></form>
                    <form action={deleteResource.bind(null, r.id)}><button className="btn sm danger">Borrar</button></form>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
