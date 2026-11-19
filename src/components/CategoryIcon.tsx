import { iconSvg } from "../lib/categoryIcons";

export function CategoryIcon({ id, size = 18 }: { id: string; size?: number }) {
  // The SVG text comes from fixed constants in categoryIcons.ts, not from user input.
  return <span className="cat-icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconSvg(id, size) }} />;
}
