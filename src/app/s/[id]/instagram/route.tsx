import { ImageResponse } from "next/og";
import { getStory } from "@/lib/stories";

// 1080x1080 Instagram-ready card for a story (download from the Share menu).
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await getStory(id);
  const title = s?.neutral_title || "Fault Lines";
  const split = !!s?.has_split;
  const topic = (s?.topic || "news").toUpperCase();
  const left = s?.left_summary || "";
  const right = s?.right_summary || "";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#0f1113", color: "#e9ebed", padding: 72, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", height: 8, width: "100%" }}>
          <div style={{ flex: 1, background: "#6f8db5" }} />
          <div style={{ flex: 1, background: "#b8923f" }} />
          <div style={{ flex: 1, background: "#bd6a60" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", marginTop: 40, fontSize: 38, fontWeight: 800, letterSpacing: -1 }}>
          Fault<span style={{ color: "#b8923f", margin: "0 5px" }}>/</span>Lines
          <span style={{ fontSize: 22, color: "#717880", marginLeft: 22, letterSpacing: 3, fontWeight: 700 }}>{topic}</span>
        </div>
        <div style={{ display: "flex", fontSize: 68, fontWeight: 800, lineHeight: 1.08, letterSpacing: -1.5, marginTop: 40 }}>{title}</div>
        <div style={{ flex: 1 }} />
        {split ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", flexDirection: "column", background: "#15233a", borderLeft: "8px solid #6f8db5", padding: "22px 26px" }}>
              <div style={{ display: "flex", fontSize: 22, fontWeight: 800, color: "#6f8db5", letterSpacing: 2, marginBottom: 8 }}>THE LEFT</div>
              <div style={{ display: "flex", fontSize: 30, color: "#cfe0ff" }}>{left}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", background: "#341916", borderLeft: "8px solid #bd6a60", padding: "22px 26px" }}>
              <div style={{ display: "flex", fontSize: 22, fontWeight: 800, color: "#bd6a60", letterSpacing: 2, marginBottom: 8 }}>THE RIGHT</div>
              <div style={{ display: "flex", fontSize: 30, color: "#ffd9d3" }}>{right}</div>
            </div>
          </div>
        ) : null}
        <div style={{ display: "flex", fontSize: 26, color: "#717880", marginTop: 44, letterSpacing: 1 }}>faultlines.kytepush.com{s ? ` · ${s.sources.length} sources` : ""}</div>
      </div>
    ),
    { width: 1080, height: 1080 },
  );
}
