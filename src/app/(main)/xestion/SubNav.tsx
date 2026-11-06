"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  ["/xestion", "Resumo"], ["/xestion/deberes", "Deberes"], ["/xestion/recursos", "Materiais"],
  ["/xestion/novidades", "Novidades"], ["/xestion/alumnado", "Alumnado"], ["/xestion/contidos", "Materias e unidades"],
  ["/xestion/biblioteca", "Biblioteca"], ["/xestion/saidas", "Saídas"],
] as const;

export function SubNav() {
  const path = usePathname();
  return (
    <nav className="subnav" aria-label="Xestión">
      {ITEMS.map(([href, label]) => <Link key={href} href={href} aria-current={path === href ? "page" : undefined}>{label}</Link>)}
    </nav>
  );
}
