"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icons";

const TOP = [
  ["/", "Inicio"], ["/materias", "Materias"], ["/gramatica", "Gramática"], ["/biblioteca", "Biblioteca"],
  ["/foros", "Foros"], ["/saidas", "Viaxe e saídas"],
] as const;

const BOTTOM = [
  ["/", "Inicio", Icon.home], ["/materias", "Materias", Icon.folder], ["/gramatica", "Gramática", Icon.book],
  ["/foros", "Foros", Icon.chat], ["/eu", "Eu", Icon.user],
] as const;

function isOn(path: string, href: string) {
  return href === "/" ? path === "/" : path === href || path.startsWith(href + "/");
}

export function TopNav({ profe }: { profe: boolean }) {
  const path = usePathname();
  const items = profe ? [...TOP, ["/xestion", "Xestión"] as const] : TOP;
  return (
    <nav className="topnav" aria-label="Seccións">
      {items.map(([href, label]) => (
        <Link key={href} href={href} aria-current={isOn(path, href) ? "page" : undefined}>{label}</Link>
      ))}
    </nav>
  );
}

export function BottomNav() {
  const path = usePathname();
  const onEu = ["/eu", "/biblioteca", "/saidas", "/xestion"].some((h) => isOn(path, h));
  return (
    <nav className="bottomnav" aria-label="Seccións">
      {BOTTOM.map(([href, label, I]) => {
        const on = href === "/eu" ? onEu : isOn(path, href);
        return (
          <Link key={href} href={href} aria-current={on ? "page" : undefined}>
            <I />{label}
          </Link>
        );
      })}
    </nav>
  );
}
