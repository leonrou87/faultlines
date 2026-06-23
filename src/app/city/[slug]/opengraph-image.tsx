import { ImageResponse } from "next/og";
import { CITIES } from "@/lib/city";

export const alt = "Fault Lines local edition";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = CITIES[slug];
  const name = c?.name || "Local";
  const tag = c?.tagline || "Local edition";
  const accent = c?.accent || "#b8923f";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#0f1113", color: "#e9ebed", padding: "70px 76px", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", height: 7, width: "100%", marginBottom: 50 }}>
          <div style={{ flex: 1, background: "#6f8db5" }} />
          <div style={{ flex: 1, background: "#b8923f" }} />
          <div style={{ flex: 1, background: "#bd6a60" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", fontSize: 32, fontWeight: 800, letterSpacing: -1 }}>
          Fault<span style={{ color: "#b8923f", margin: "0 5px" }}>/</span>Lines
          <span style={{ fontSize: 20, color: accent, marginLeft: 18, letterSpacing: 3, fontWeight: 800 }}>LOCAL EDITION</span>
        </div>
        <div style={{ display: "flex", fontSize: 104, fontWeight: 800, lineHeight: 1, letterSpacing: -3, marginTop: 36, color: "#fff", borderLeft: `8px solid ${accent}`, paddingLeft: 28 }}>{name}</div>
        <div style={{ display: "flex", fontSize: 34, color: "#a4abb2", marginTop: 22, paddingLeft: 36, fontStyle: "italic", flex: 1 }}>{tag}</div>
        <div style={{ display: "flex", fontSize: 24, color: "#717880", letterSpacing: 1 }}>Local news, weather & the debates that divide the city · faultlines.kytepush.com</div>
      </div>
    ),
    { ...size },
  );
}
