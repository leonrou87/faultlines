import { getStory, getStories } from "@/lib/stories";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShareMenu from "@/components/ShareMenu";
import LeanCoverage from "@/components/LeanCoverage";
import ReadingProgress from "@/components/ReadingProgress";
import SplitVote from "@/components/SplitVote";

export const revalidate = 120;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const s = await getStory(id);
  if (!s) return { title: "Story not found" };
  const desc = s.has_split
    ? `How the left and right each frame it. ${s.neutral_body.slice(0, 150)}`
    : s.neutral_body.slice(0, 170);
  return {
    title: s.neutral_title,
    description: desc,
    openGraph: { title: s.neutral_title, description: desc, type: "article" },
    twitter: { card: "summary_large_image", title: s.neutral_title, description: desc },
  };
}

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await getStory(id);
  if (!s) notFound();

  // Related stories so a visitor who arrived from a shared link has somewhere to go next.
  const all = await getStories().catch(() => []);
  const pool = all.filter((x) => x.id !== s.id);
  const sameTopic = pool.filter((x) => x.topic === s.topic);
  const more = [...new Map([...sameTopic, ...pool.filter((x) => x.has_split), ...pool].map((x) => [x.id, x])).values()].slice(0, 6);

  const ld = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: s.neutral_title,
    description: s.neutral_body.slice(0, 200),
    ...(s.image_url ? { image: [s.image_url] } : {}),
    ...(s.published_at ? { datePublished: s.published_at, dateModified: s.published_at } : {}),
    articleSection: s.topic,
    author: { "@type": "Organization", name: "Fault Lines" },
    publisher: { "@type": "Organization", name: "Fault Lines" },
    mainEntityOfPage: `https://faultlines.kytepush.com/s/${s.id}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <ReadingProgress />
      <header className="app">
        <div className="topline" />
        <div className="bar"><a href="/" className="wordmark">Fault<span className="seam" />Lines</a></div>
      </header>
      <article className="modal-inner" style={{ maxWidth: 680, margin: "0 auto", padding: "26px 20px 90px" }}>
        <div className="kicker">{s.topic}{s.has_split && <span className="ksplit">Split</span>}{s.published_at && <span className="muted">{new Date(s.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>}</div>
        <h2 style={{ fontFamily: "var(--display)", fontWeight: 900, fontSize: 32, lineHeight: 1.1, margin: "0 0 14px", letterSpacing: "-.5px" }}>{s.neutral_title}</h2>
        {s.image_url && /* eslint-disable-next-line @next/next/no-img-element */ <img src={s.image_url} alt="" referrerPolicy="no-referrer" style={{ width: "100%", borderRadius: 8, marginBottom: 16, aspectRatio: "16/9", objectFit: "cover" }} />}
        <p className="lede" style={{ whiteSpace: "pre-line" }}>{s.neutral_body}</p>

        <div className="coverage"><div className="lab">Across the spectrum</div><LeanCoverage coverage={s.coverage} /></div>

        {s.has_split && (
          <>
            <SplitVote s={s} />
            {(s.agree_points.length > 0 || s.split_points.length > 0) && (
              <div className="cols">
                <div className="col"><h6>What both sides accept</h6><ul>{s.agree_points.map((p, i) => <li key={i}>{p}</li>)}</ul></div>
                <div className="col"><h6>Where they diverge</h6><ul>{s.split_points.map((p, i) => <li key={i}>{p}</li>)}</ul></div>
              </div>
            )}
          </>
        )}

        <div className="fl-foot">
          {s.has_split && s.tension_score != null && <span>Divergence {s.tension_score}/100</span>}
          <ShareMenu title={s.neutral_title} path={`/s/${s.id}`} />
        </div>

        {more.length > 0 && (
          <section className="more-sec">
            <h3 className="more-h">More fault lines</h3>
            <div className="more-grid">
              {more.map((m) => (
                <a key={m.id} href={`/s/${m.id}`} className="more-card">
                  <div className="more-media">
                    {m.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.image_url} alt="" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="tile-fallback" data-topic={m.topic}><span className="tf-mark">Fault<i className="seam" />Lines</span></div>
                    )}
                    {m.has_split && <span className="more-split">Split</span>}
                  </div>
                  <div className="more-cbody"><span className="more-topic">{m.topic}</span><h4>{m.neutral_title}</h4></div>
                </a>
              ))}
            </div>
          </section>
        )}

        <p style={{ marginTop: 26 }}><a href="/" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 700 }}>← Back to Fault Lines</a></p>
      </article>
    </>
  );
}
