import { getIssue, getPolls, CITIES } from "@/lib/city";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PollWidget from "@/components/Poll";
import ShareMenu from "@/components/ShareMenu";

export const revalidate = 120;

export async function generateMetadata({ params }: { params: Promise<{ slug: string; issue: string }> }): Promise<Metadata> {
  const { issue } = await params;
  const data = await getIssue(issue);
  if (!data) return { title: "Issue not found" };
  return { title: data.title, description: data.dek, openGraph: { title: data.title, description: data.dek }, twitter: { card: "summary_large_image", title: data.title, description: data.dek } };
}

export default async function IssuePage({ params }: { params: Promise<{ slug: string; issue: string }> }) {
  const { slug, issue } = await params;
  const city = CITIES[slug];
  const data = await getIssue(issue);
  if (!city || !data) notFound();
  const polls = await getPolls(issue);
  const paras = (data.body || "").split(/\n\n+/);

  return (
    <>
      <header className="app">
        <div className="topline" style={{ background: city.accent }} />
        <div className="bar"><a href="/" className="wordmark">Fault<span className="seam" />Lines</a><span className="dateline" style={{ marginLeft: "auto" }}>{city.name.toUpperCase()} · ISSUES</span></div>
      </header>

      <article className="doc" style={{ maxWidth: 700 }}>
        <div className="kicker" style={{ color: city.accent }}>{city.name} · The Issue</div>
        <h1 style={{ fontSize: 34, lineHeight: 1.08, letterSpacing: "-.6px", margin: "4px 0 10px" }}>{data.title}</h1>
        {data.dek && <p style={{ fontSize: 18, color: "var(--ink-dim)", fontStyle: "italic", margin: "0 0 22px" }}>{data.dek}</p>}

        {paras.map((p, i) => {
          // weave a poll in after the 2nd and 4th paragraph
          const pollIdx = i === 1 ? 0 : i === 3 ? 1 : -1;
          return (
            <div key={i}>
              <p style={{ fontFamily: "var(--serif)", fontSize: 16.5, lineHeight: 1.75, color: "var(--ink)", margin: "0 0 18px" }}>{p}</p>
              {pollIdx >= 0 && polls[pollIdx] && <PollWidget poll={polls[pollIdx]} />}
            </div>
          );
        })}

        {polls.slice(2).map((p) => <PollWidget key={p.id} poll={p} />)}

        {data.questions.length > 0 && (
          <div className="qbox">
            <h3 style={{ color: city.accent }}>Questions worth fighting over</h3>
            <ul>{data.questions.map((q, i) => <li key={i}>{q}</li>)}</ul>
          </div>
        )}

        <div className="fl-foot" style={{ marginTop: 24 }}>
          <ShareMenu title={data.title} path={`/city/${slug}/issue/${issue}`} />
        </div>
        <p style={{ marginTop: 26 }}><a href={`/city/${slug}`} style={{ color: city.accent, textDecoration: "none", fontWeight: 700 }}>← Back to {city.name}</a></p>
      </article>
    </>
  );
}
