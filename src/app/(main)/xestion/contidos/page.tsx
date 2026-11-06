import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { groups, subjects, units } from "@/lib/schema";
import { SCHOOL_YEAR } from "@/lib/config";
import { createGroup, createSubject, createUnit, setUnitStatus } from "@/lib/admin-actions";

const STATUSES = [["proxima", "Próxima"], ["agora", "Agora"], ["vista", "Vista"]] as const;
const COLORS = [["blue", "Azul"], ["pink", "Rosa"], ["mint", "Verde"], ["lilac", "Lila"], ["sun", "Amarelo"]] as const;

export default async function Contidos() {
  const subs = await db.select().from(subjects).orderBy(asc(subjects.order));
  const us = await db.select().from(units).orderBy(asc(units.number));
  const gs = await db.select().from(groups).where(eq(groups.schoolYear, SCHOOL_YEAR));

  return (
    <div className="stack" style={{ gap: 24 }}>
      <details className="adder">
        <summary>Engadir unha unidade</summary>
        <form action={createUnit} className="inner form-grid">
          <label className="f">Materia<select name="subjectId">{subs.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.level})</option>)}</select></label>
          <label className="f">Número<input type="number" name="number" min={1} placeholder="Seguinte" /></label>
          <label className="f full">Título<input type="text" name="title" required placeholder="A terceira declinación" /></label>
          <label className="f full">Resumo (opcional)<textarea name="summary" placeholder="Que imos aprender nesta unidade" /></label>
          <div><button className="btn accent">Engadir</button></div>
        </form>
      </details>

      {subs.map((s) => {
        const su = us.filter((u) => u.subjectId === s.id);
        const hasGroup = gs.some((g) => g.subjectId === s.id);
        return (
          <section key={s.id} className={`card stack-sm c-${s.color}`}>
            <div className="row between">
              <div className="row" style={{ gap: 8 }}><h2>{s.name}</h2><span className="pill">{s.level}</span></div>
              {!hasGroup && <form action={createGroup.bind(null, s.id)}><button className="btn sm ghost">Crear o grupo de {SCHOOL_YEAR}</button></form>}
            </div>
            {su.length === 0 ? <p className="small muted">Sen unidades.</p> : (
              <div className="list">
                {su.map((u) => (
                  <div key={u.id} className="item" style={{ gridTemplateColumns: "44px minmax(0,1fr)" }}>
                    <span className="kind"><b style={{ fontFamily: "var(--f-display)" }}>{u.number}</b></span>
                    <div className="row between" style={{ gap: 8 }}>
                      <b className="min0">{u.title}</b>
                      <div className="row" style={{ gap: 4 }}>
                        {STATUSES.map(([k, l]) => (
                          <form key={k} action={setUnitStatus.bind(null, u.id, k)}>
                            <button className={`pill ${u.status === k ? "" : "line"}`} style={{ border: 0, cursor: "pointer" }}>{l}</button>
                          </form>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}

      <details className="adder">
        <summary>Engadir unha materia nova</summary>
        <form action={createSubject} className="inner form-grid">
          <label className="f">Nome<input type="text" name="name" required placeholder="Grego I" /></label>
          <label className="f">Curso<input type="text" name="level" required placeholder="1.º BAC" /></label>
          <label className="f">Cor<select name="color">{COLORS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
          <div><button className="btn accent">Crear</button></div>
        </form>
        <p className="inner small muted" style={{ paddingTop: 0 }}>Créase tamén o seu grupo para {SCHOOL_YEAR}.</p>
      </details>
    </div>
  );
}
