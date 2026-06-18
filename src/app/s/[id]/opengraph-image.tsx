import { ImageResponse } from "next/og";
import { getStory } from "@/lib/stories";

export const alt = "Fault Lines";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await getStory(id);
  const title = s?.neutral_title || "Fault Lines";
  const split = !!s?.has_split;
  const topic = (s?.topic || "news").toUpperCase();

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#0f1113", color: "#e9ebed", padding: "64px 70px", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", height: 6, width: "100%", marginBottom: 44 }}>
          <div style={{ flex: 1, background: "#6f8db5" }} />
          <div style={{ flex: 1, background: "#b8923f" }} />
          <div style={{ flex: 1, background: "#bd6a60" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", fontSize: 30, fontWeight: 800, letterSpacing: -1 }}>
          Fault<span style={{ color: "#b8923f", margin: "0 4px" }}>/</span>Lines
          <span style={{ fontSize: 18, color: "#717880", marginLeft: 18, letterSpacing: 2, fontWeight: 700 }}>{split ? `${topic} · THE SPLIT` : topic}</span>
        </div>
        <div style={{ display: "flex", fontSize: 62, fontWeight: 800, lineHeight: 1.08, letterSpacing: -1.5, marginTop: 28, flex: 1 }}>{title}</div>
        {split ? (
          <div style={{ display: "flex", gap: 14, marginTop: 10 }}>
            <div style={{ display: "flex", flex: 1, background: "#15233a", borderLeft: "5px solid #6f8db5", padding: "16px 20px", fontSize: 24, color: "#9bb4d6", fontWeight: 700 }}>How the LEFT frames it</div>
            <div style={{ display: "flex", flex: 1, background: "#341916", borderLeft: "5px solid #bd6a60", padding: "16px 20px", fontSize: 24, color: "#e0a59e", fontWeight: 700 }}>How the RIGHT frames it</div>
          </div>
        ) : null}
        <div style={{ display: "flex", fontSize: 22, color: "#717880", marginTop: 30, letterSpacing: 1 }}>faultlines.kytepush.com{s ? ` · ${s.sources.length} sources` : ""}</div>
      </div>
    ),
    { ...size },
  );
}
