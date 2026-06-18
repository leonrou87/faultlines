import type { Source } from "@/lib/stories";

// Server-renderable source-coverage-by-lean bar.
export default function LeanCoverage({ sources }: { sources: Source[] }) {
  let l = 0, c = 0, r = 0;
  for (const s of sources) { if (s.lean === "left") l++; else if (s.lean === "right") r++; else c++; }
  const t = l + c + r || 1;
  const pct = (n: number) => `${(100 * n) / t}%`;
  return (
    <div className="leanbar full">
      <div className="lb-track">
        <i className="lb-l" style={{ width: pct(l) }} />
        <i className="lb-c" style={{ width: pct(c) }} />
        <i className="lb-r" style={{ width: pct(r) }} />
      </div>
      <div className="lb-counts"><span className="ll">{l} left</span><span>{c} center</span><span className="rr">{r} right</span></div>
    </div>
  );
}
