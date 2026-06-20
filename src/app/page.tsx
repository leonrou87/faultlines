import { getStories } from "@/lib/stories";
import Feed from "@/components/Feed";
import Dateline from "@/components/Dateline";
import EditionsMenu from "@/components/EditionsMenu";

export const revalidate = 60;

export default async function Home() {
  const stories = await getStories();
  return (
    <>
      <header className="app">
        <div className="topline" />
        <div className="bar">
          <a href="/" className="wordmark">Fault<span className="seam" />Lines</a>
          <div className="mast-actions">
            <EditionsMenu current="national" />
            <Dateline />
          </div>
        </div>
      </header>
      <Feed initial={stories} />
      <footer className="app">
        <div>We don&apos;t tell you what to think — we show you where the country splits, and why.</div>
        <div style={{ marginTop: 8 }}>
          <strong style={{ color: "var(--ink-dim)" }}>Editions:</strong> <a href="/city/seattle">Seattle</a> · <a href="/city/sf">San Francisco</a>
        </div>
        <div style={{ marginTop: 8 }}>
          <a href="/about">Methodology</a> · <a href="/privacy">Privacy</a>
        </div>
      </footer>
    </>
  );
}
