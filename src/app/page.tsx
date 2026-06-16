import { getStories } from "@/lib/stories";
import Feed from "@/components/Feed";

export const revalidate = 60;

export default async function Home() {
  const stories = await getStories();
  return (
    <>
      <header className="app">
        <div className="bar">
          <a href="/" className="wordmark">Fault<span className="seam" />Lines</a>
          <span className="tagline">where the country splits</span>
        </div>
      </header>
      <Feed initial={stories} />
      <footer className="app">
        <div>We don&apos;t tell you what to think — we show you where the country splits, and why.</div>
        <div style={{ marginTop: 8 }}>
          <a href="/about">Methodology</a> · <a href="/privacy">Privacy</a>
        </div>
      </footer>
    </>
  );
}
