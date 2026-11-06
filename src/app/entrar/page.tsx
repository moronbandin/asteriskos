import { redirect } from "next/navigation";
import { getMe } from "@/lib/session";
import { SCHOOL_DOMAIN, SITE } from "@/lib/config";
import { SignInButton, LocalSignIn } from "./SignInButton";
import { Star } from "@/components/icons";

const ERRORS: Record<string, string> = {
  "sen-alta": "Esta conta aínda non está dada de alta. Pídelle ao profesor que te engada, ou proba coa outra conta se tes dúas.",
  baixa: "Esta conta está de baixa. Se pensas que é un erro, fala co profesor.",
  conta: "Non puidemos comprobar a túa conta de Google. Téntao outra vez.",
  AccessDenied: "Esta conta non ten acceso.",
};

export default async function Entrar({ searchParams }: { searchParams: Promise<{ erro?: string; error?: string }> }) {
  if (await getMe()) redirect("/");
  const sp = await searchParams;
  const err = ERRORS[sp.erro || sp.error || ""];
  return (
    <main className="login">
      <div className="box">
        <span className="mark" aria-hidden="true"><Star size={84} /></span>
        <div className="stack-sm">
          <span className="eyebrow">{SITE.school ? `${SITE.tagline}, ${SITE.school}` : SITE.tagline}</span>
          <h1>{SITE.name.toLowerCase()}</h1>
        </div>
        <p className="muted">Os materiais, os deberes e as novidades de Latín e Grego, nun só sitio.</p>
        {err && <div className="alert" role="alert">{err}</div>}
        <SignInButton />
        {process.env.NODE_ENV === "development" && <LocalSignIn />}
        <p className="note">Só poden entrar as contas que o profesor deu de alta{SCHOOL_DOMAIN ? <>. Usa a do centro, <b>@{SCHOOL_DOMAIN}</b>, se a tes</> : ""}.</p>
      </div>
    </main>
  );
}
