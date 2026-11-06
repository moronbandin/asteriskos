"use client";

import { useOptimistic, useTransition } from "react";
import { toggleDone } from "@/lib/actions";
import { Icon } from "./icons";

export function DoneButton({ id, on }: { id: number; on: boolean }) {
  const [state, setState] = useOptimistic(on);
  const [, start] = useTransition();
  return (
    <button
      type="button"
      className={`check ${state ? "on" : ""}`}
      aria-pressed={state}
      aria-label={state ? "Marcar como pendente" : "Marcar como feito"}
      onClick={() => start(async () => { setState(!state); await toggleDone(id); })}
    >
      {state && <Icon.check />}
    </button>
  );
}
