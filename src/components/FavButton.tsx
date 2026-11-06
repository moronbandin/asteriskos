"use client";

import { useOptimistic, useTransition } from "react";
import { toggleFavorite } from "@/lib/actions";
import { Icon } from "./icons";

export function FavButton({ id, on }: { id: number; on: boolean }) {
  const [state, setState] = useOptimistic(on);
  const [, start] = useTransition();
  return (
    <button
      type="button"
      className={`iconbtn ${state ? "on" : ""}`}
      aria-pressed={state}
      aria-label={state ? "Quitar de favoritos" : "Gardar en favoritos"}
      title={state ? "Quitar de favoritos" : "Gardar en favoritos"}
      onClick={() => start(async () => { setState(!state); await toggleFavorite(id); })}
    >
      {state ? <Icon.heartFill /> : <Icon.heart />}
    </button>
  );
}
