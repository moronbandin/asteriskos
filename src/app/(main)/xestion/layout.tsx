import { requireProfe } from "@/lib/session";
import { SubNav } from "./SubNav";

export const metadata = { title: "Xestión" };

export default async function XestionLayout({ children }: { children: React.ReactNode }) {
  await requireProfe();
  return (
    <div className="stack" style={{ gap: 24 }}>
      <div className="big-hello"><span className="eyebrow">Só para o profesorado</span><h1>Xestión</h1></div>
      <SubNav />
      {children}
    </div>
  );
}
