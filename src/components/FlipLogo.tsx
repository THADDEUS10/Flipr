import { HAND_FILL, HAND_LINES, LETTERS } from "../lib/pdfLogo";

/** The FLIP logo from the Figma design (hand + wordmark). Colours follow the theme. */
export function FlipLogo({ height = 40 }: { height?: number }) {
  return (
    <svg className="flip-logo" viewBox="-2 -2 106 44" height={height} width={(height * 106) / 44} role="img" aria-label="Flip">
      <g>
        {HAND_FILL.map((d, i) => <path key={i} d={d} className="logo-ink logo-outline" strokeWidth={2} strokeLinejoin="round" />)}
        <path d={HAND_LINES} className="logo-line" fill="none" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g transform="translate(33 8)">
        {LETTERS.map((d, i) => <path key={i} d={d} className="logo-ink" fillRule="evenodd" />)}
      </g>
    </svg>
  );
}
