import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { links } from "@/lib/schema";
import { createLink, deleteLink } from "@/lib/admin-actions";

export default async function BibliotecaAdmin() {
  const list = await db.select().from(links).orderBy(asc(links.category), asc(links.title));
  const cats = [...new Set(list.map((l) => l.category))];
  return (
    <div className="stack" style={{ gap: 20 }}>
      <details className="adder" open>
        <summary>Engadir unha ligazón</summary>
        <form action={createLink} className="inner form-grid">
          <label className="f">Categoría<input type="text" name="category" required list="cats" placeholder="Dicionarios" />
            <datalist id="cats">{cats.map((c) => <option key={c} value={c} />)}</datalist>
          </label>
          <label className="f">Título<input type="text" name="title" required /></label>
          <label className="f full">Enderezo<input type="url" name="url" required placeholder="https://…" /></label>
          <label className="f full">Descrición (opcional)<input type="text" name="description" /></label>
          <div><button className="btn accent">Engadir</button></div>
        </form>
      </details>
      <div className="card" style={{ paddingBlock: 6 }}>
        <div className="list">
          {list.map((l) => (
            <div key={l.id} className="item" style={{ gridTemplateColumns: "minmax(0,1fr) auto" }}>
              <div className="min0"><div className="t">{l.title}</div><div className="d">{l.category}, {l.url}</div></div>
              <form action={deleteLink.bind(null, l.id)}><button className="btn sm danger">Borrar</button></form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
