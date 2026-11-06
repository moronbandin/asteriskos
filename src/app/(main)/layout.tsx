import Link from "next/link";
import { requireMe } from "@/lib/session";
import { TopNav, BottomNav } from "@/components/Nav";
import { Avatar } from "@/components/Avatar";
import { Star } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const me = await requireMe();
  return (
    <>
      <header className="topbar">
        <div className="wrap inner">
          <Link href="/" className="logo" aria-label="Asteriskos, inicio"><Star />asteriskos</Link>
          <TopNav profe={me.role === "profesor"} />
          <div className="me">
            <Link href="/eu" aria-label="O meu espazo"><Avatar name={me.name} image={me.image} /></Link>
          </div>
        </div>
      </header>
      <main className="page wrap">{children}</main>
      <BottomNav />
    </>
  );
}
