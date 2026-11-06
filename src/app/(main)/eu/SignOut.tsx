"use client";

import { signOut } from "next-auth/react";

export function SignOut() {
  return <button className="btn line" onClick={() => signOut({ callbackUrl: "/entrar" })}>Saír</button>;
}
