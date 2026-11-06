import type { SVGProps } from "react";

const base = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
type P = SVGProps<SVGSVGElement>;

export const Icon = {
  home: (p: P) => <svg {...base} {...p}><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" /></svg>,
  folder: (p: P) => <svg {...base} {...p}><path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>,
  book: (p: P) => <svg {...base} {...p}><path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H20v16H5.5A1.5 1.5 0 0 0 4 20.5z" /><path d="M4 20.5A1.5 1.5 0 0 0 5.5 22H20" /></svg>,
  chat: (p: P) => <svg {...base} {...p}><path d="M4 5h16v11H9l-5 4z" /></svg>,
  user: (p: P) => <svg {...base} {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>,
  heart: (p: P) => <svg {...base} {...p}><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>,
  heartFill: (p: P) => <svg {...base} {...p} fill="currentColor"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>,
  check: (p: P) => <svg {...base} strokeWidth={3} {...p}><path d="m5 12 5 5 9-10" /></svg>,
  arrow: (p: P) => <svg {...base} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>,
  out: (p: P) => <svg {...base} {...p}><path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6" /></svg>,
  // tipos de recurso
  apuntamentos: (p: P) => <svg {...base} {...p}><path d="M5 3h10l4 4v14H5z" /><path d="M9 11h6M9 15h4" /></svg>,
  ficha: (p: P) => <svg {...base} {...p}><path d="M5 3h14v18H5z" /><path d="m9 9 1.5 1.5L14 7M9 15h6" /></svg>,
  ampliacion: (p: P) => <svg {...base} {...p}><path d="M12 3 14.6 8.6 20.5 9.3 16 13.4 17.3 19.5 12 16.5 6.7 19.5 8 13.4 3.5 9.3 9.4 8.6z" /></svg>,
  texto: (p: P) => <svg {...base} {...p}><path d="M3 5c3-1 6-1 9 1 3-2 6-2 9-1v14c-3-1-6-1-9 1-3-2-6-2-9-1z" /><path d="M12 6v14" /></svg>,
  video: (p: P) => <svg {...base} {...p}><rect x="3" y="5" width="18" height="14" rx="4" /><path d="m10 9 5 3-5 3z" /></svg>,
  cuestionario: (p: P) => <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5v.01" /></svg>,
  ligazon: (p: P) => <svg {...base} {...p}><path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1" /></svg>,
  more: (p: P) => <svg {...base} {...p}><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></svg>,
};

export function Star({ size = 22 }: { size?: number }) {
  // o asterisco (ἀστερίσκος) dos filólogos alexandrinos
  return (
    <svg className="star" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="3.2" strokeLinecap="round">
        <path d="M12 2.5v19" /><path d="M3.8 7.25l16.4 9.5" /><path d="M3.8 16.75l16.4-9.5" />
      </g>
    </svg>
  );
}
