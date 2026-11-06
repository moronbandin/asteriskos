import Link from "next/link";
import { RESOURCE_KINDS } from "@/lib/schema";
import type { Resource } from "@/lib/queries";
import { Icon } from "./icons";
import { FavButton } from "./FavButton";

export function resourceHref(r: Resource) {
  if (r.grammarSlug) return `/gramatica/${r.grammarSlug}`;
  return r.url || "#";
}

export function ResourceItem({ r, fav, color, extra }: { r: Resource; fav: boolean; color?: string; extra?: React.ReactNode }) {
  const I = Icon[r.kind] ?? Icon.ligazon;
  const href = resourceHref(r);
  const internal = href.startsWith("/");
  const label = RESOURCE_KINDS[r.kind] ?? r.kind;
  const content = (
    <>
      <div className="t">{r.title}{!r.visible && <span className="pill line" style={{ marginLeft: 8 }}>Oculto</span>}</div>
      <div className="d">{label}{r.description ? `. ${r.description}` : ""}</div>
    </>
  );
  return (
    <div className={`item ${color ? "c-" + color : ""}`}>
      <span className="kind" aria-hidden="true"><I /></span>
      <div className="min0">
        {href === "#" ? content : internal ? <Link href={href}>{content}</Link> : <a href={href} target="_blank" rel="noopener noreferrer">{content}</a>}
      </div>
      <div className="actions">
        {extra}
        <FavButton id={r.id} on={fav} />
      </div>
    </div>
  );
}
