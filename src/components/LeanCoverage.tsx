import type { Coverage } from "@/lib/stories";

// Server-renderable coverage-by-lean bar (anonymized — shows the spectrum, never outlets).
export default function LeanCoverage({ coverage }: { coverage: Coverage }) {
  const { l, c, r } = coverage;
  const t = l + c + r || 1;
  const pct = (n: number) => `${(100 * n) / t}%`;
  return (
    <div className="leanbar full">
      <div className="lb-track">
        <i className="lb-l" style={{ width: pct(l) }} />
        <i className="lb-c" style={{ width: pct(c) }} />
        <i className="lb-r" style={{ width: pct(r) }} />
      </div>
      <div className="lb-counts"><span className="ll">Left</span><span>Center</span><span className="rr">Right</span></div>
    </div>
  );
}
