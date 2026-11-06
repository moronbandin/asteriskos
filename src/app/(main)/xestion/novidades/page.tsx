import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { groups, news, subjects } from "@/lib/schema";
import { SCHOOL_YEAR } from "@/lib/config";
import { createNews, deleteNews, togglePin } from "@/lib/admin-actions";
import { shortDate } from "@/lib/format";

export default async function Novidades() {
  const gs = await db.select({ g: groups, s: subjects }).from(groups)
    .innerJoin(subjects, eq(groups.subjectId, subjects.id))
    .where(eq(groups.schoolYear, SCHOOL_YEAR)).orderBy(asc(subjects.order));
  const list = await db.select().from(news).orderBy(desc(news.createdAt)).limit(100);
  return (
    <div className="stack" style={{ gap: 20 }}>
      <details className="adder" open>
        <summary>Publicar unha novidade</summary>
        <form action={createNews} className="inner form-grid">
          <label className="f full">Título<input type="text" name="title" required placeholder="Control de lectura da Aulularia" /></label>
          <label className="f full">Texto
            <textarea name="body" required placeholder={"Podes usar **grosa**, *cursiva* e ligazóns [así](https://…)."} />
          </label>
          <label className="f">Para quen
            <select name="groupId"><option value="">Todo o departamento</option>{gs.map(({ g, s }) => <option key={g.id} value={g.id}>{s.name}</option>)}</select>
          </label>
          <label className="f">Etiqueta (opcional)<input type="text" name="tag" placeholder="Para ler, Viaxe, Exame…" /></label>
          <label className="f">Ligazón (opcional)<input type="url" name="link" placeholder="https://…" /></label>
          <label className="checkline"><input type="checkbox" name="pinned" /> Fixar arriba</label>
          <div><button className="btn accent">Publicar</button></div>
        </form>
      </details>

      {list.length === 0 ? <div className="empty">Aínda non hai novidades.</div> : (
        <div className="card" style={{ paddingBlock: 6 }}>
          <div className="list">
            {list.map((n) => {
              const g = gs.find((x) => x.g.id === n.groupId);
              return (
                <div key={n.id} className="item" style={{ gridTemplateColumns: "minmax(0,1fr) auto" }}>
                  <div className="min0">
                    <div className="t">{n.title}</div>
                    <div className="d">{shortDate(n.createdAt)}, {g ? g.s.name : "todo o departamento"}{n.pinned ? ", fixada" : ""}</div>
                  </div>
                  <div className="actions">
                    <form action={togglePin.bind(null, n.id, !n.pinned)}><button className="btn sm line">{n.pinned ? "Soltar" : "Fixar"}</button></form>
                    <form action={deleteNews.bind(null, n.id)}><button className="btn sm danger">Borrar</button></form>
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
