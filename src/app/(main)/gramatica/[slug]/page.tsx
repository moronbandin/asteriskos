import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { requireMe } from "@/lib/session";
import { getGrammar } from "@/lib/grammar";
import { db } from "@/lib/db";
import { resources } from "@/lib/schema";
import { myFavoriteIds } from "@/lib/queries";
import { FavButton } from "@/components/FavButton";
import { GrammarToc } from "../Toc";
import { PROJECTS } from "@/lib/config";

export default async function GramaticaPunto({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const me = await requireMe();
  const page = await getGrammar(slug);
  if (!page) notFound();
  // recurso asociado (para poder gardalo en favoritos)
  const [res] = await db.select().from(resources).where(and(eq(resources.grammarSlug, slug), eq(resources.kind, "apuntamentos")));
  const favs = res ? await myFavoriteIds(me) : new Set<number>();
  return (
    <div className="gram">
      <GrammarToc current={slug} />
      <article className="stack" style={{ gap: 20, minWidth: 0 }}>
        <div className="row between" style={{ alignItems: "flex-start", flexWrap: "nowrap" }}>
          <div className="big-hello"><span className="eyebrow">{page.section}</span><h1>{page.title}</h1></div>
          {res && <FavButton id={res.id} on={favs.has(res.id)} />}
        </div>
        {page.used.length > 0 && (
          <div className="row" style={{ gap: 6 }}><span className="small muted">Vémolo en</span>{page.used.map((u) => <span key={u} className="pill line">{u}</span>)}</div>
        )}
        <div className="prose tablewrap" dangerouslySetInnerHTML={{ __html: page.html }} />
        <div className="row">
          <a href={PROJECTS.palaestra} target="_blank" rel="noopener noreferrer" className="btn accent">Practicar en Palaestra</a>
        </div>
      </article>
    </div>
  );
}
