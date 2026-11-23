/* Placeholder artwork until real product photos arrive. */
type View = "side" | "other-side" | "top" | "sole" | "heel" | "detail";

export const photoViews: { view: View; label: string }[] = [
  { view: "side", label: "Side view" },
  { view: "other-side", label: "Inner side view" },
  { view: "top", label: "Top view" },
  { view: "sole", label: "Outsole" },
  { view: "heel", label: "Heel" },
  { view: "detail", label: "Upper detail" },
];

function Shoe() {
  return (
    <g>
      {/* sole */}
      <path
        d="M18 128c0-8 6-14 14-14h196c22 0 40 6 46 16l2 4c2 4-1 8-6 8H30c-7 0-12-6-12-14z"
        fill="#ffffff"
        stroke="#111"
        strokeWidth="2"
      />
      <path d="M22 138h250" stroke="#d4f05a" strokeWidth="4" />
      {/* upper */}
      <path
        d="M30 114c4-26 12-48 28-60 10-8 26-10 36-4l20 14c10 8 22 10 34 10h20c28 0 60 16 82 34 10 8 18 4 6-2l-10 8H30z"
        fill="#111"
      />
      <path
        d="M96 56l52 30M112 50l40 26M128 46l30 22"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M150 98c30-4 66 2 96 12"
        stroke="#d4f05a"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
}

export function ShoeArt({ view }: { view: View }) {
  let transform = "";
  switch (view) {
    case "other-side":
      transform = "translate(300 0) scale(-1 1)";
      break;
    case "top":
      transform = "rotate(-8 150 100)";
      break;
    case "sole":
      transform = "translate(0 200) scale(1 -1)";
      break;
    case "heel":
      transform = "translate(-40 -20) scale(1.25)";
      break;
    case "detail":
      transform = "translate(-160 -60) scale(1.9)";
      break;
  }
  return (
    <svg viewBox="0 0 300 180" role="img" aria-hidden="true">
      <g transform={transform}>
        <Shoe />
      </g>
    </svg>
  );
}
