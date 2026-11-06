import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { events } from "@/lib/schema";
import { createEvent, deleteEvent } from "@/lib/admin-actions";

export default async function SaidasAdmin() {
  const list = await db.select().from(events).orderBy(asc(events.order), asc(events.id));
  return (
    <div className="stack" style={{ gap: 20 }}>
      <details className="adder" open>
        <summary>Engadir unha viaxe ou saída</summary>
        <form action={createEvent} className="inner form-grid">
          <label className="f">Tipo<select name="kind"><option value="saida">Saída</option><option value="viaxe">Viaxe de estudos</option></select></label>
          <label className="f">Nome<input type="text" name="title" required placeholder="Lugo romano" /></label>
          <label className="f">Cando<input type="text" name="when" placeholder="12 de decembro" /></label>
          <label className="f">Para quen<input type="text" name="audience" placeholder="4.º ESO" /></label>
          <label className="f full">Información<textarea name="body" placeholder={"Horario, que levar, autorización…\nPodes usar listas con - ao comezo da liña."} /></label>
          <div><button className="btn accent">Engadir</button></div>
        </form>
      </details>
      <div className="card" style={{ paddingBlock: 6 }}>
        <div className="list">
          {list.map((e) => (
            <div key={e.id} className="item" style={{ gridTemplateColumns: "minmax(0,1fr) auto" }}>
              <div className="min0"><div className="t">{e.title}</div><div className="d">{e.kind === "viaxe" ? "Viaxe" : "Saída"}{e.when ? `, ${e.when}` : ""}</div></div>
              <form action={deleteEvent.bind(null, e.id)}><button className="btn sm danger">Borrar</button></form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
