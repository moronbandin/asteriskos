import { initials } from "@/lib/format";

export function Avatar({ name, image, size }: { name: string; image?: string | null; size?: "lg" }) {
  return (
    <span className={`avatar ${size ?? ""}`} aria-hidden="true">
      {image ? <img src={image} alt="" referrerPolicy="no-referrer" /> : initials(name)}
    </span>
  );
}
