import { ImageResponse } from "next/og";

export const alt = "Fault Lines — where the country splits, and why";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#0f1113", color: "#e9ebed", padding: "70px 76px", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", height: 7, width: "100%", marginBottom: 56 }}>
          <div style={{ flex: 1, background: "#6f8db5" }} />
          <div style={{ flex: 1, background: "#b8923f" }} />
          <div style={{ flex: 1, background: "#bd6a60" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", fontSize: 44, fontWeight: 800, letterSpacing: -1.5 }}>
          Fault<span style={{ color: "#b8923f", margin: "0 6px" }}>/</span>Lines
        </div>
        <div style={{ display: "flex", fontSize: 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2.5, marginTop: 30, flex: 1 }}>
          See every side of the story.
        </div>
        <div style={{ display: "flex", gap: 16, marginBottom: 30 }}>
          <div style={{ display: "flex", flex: 1, background: "#15233a", borderLeft: "5px solid #6f8db5", padding: "14px 20px", fontSize: 23, color: "#9bb4d6", fontWeight: 700 }}>How the LEFT frames it</div>
          <div style={{ display: "flex", flex: 1, background: "#341916", borderLeft: "5px solid #bd6a60", padding: "14px 20px", fontSize: 23, color: "#e0a59e", fontWeight: 700 }}>How the RIGHT frames it</div>
        </div>
        <div style={{ display: "flex", fontSize: 24, color: "#717880", letterSpacing: 1 }}>Neutral news, and how each side frames it · faultlines.kytepush.com</div>
      </div>
    ),
    { ...size },
  );
}
