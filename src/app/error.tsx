"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="empty" style={{ paddingTop: 90 }}>
      <div style={{ fontFamily: "var(--display)", fontWeight: 900, fontSize: 32, color: "var(--ink)", marginBottom: 8 }}>Something broke</div>
      <p>We hit an error loading this. Try again in a moment.</p>
      <p style={{ marginTop: 16, display: "flex", gap: 14, justifyContent: "center" }}>
        <button onClick={reset} className="auth-btn">Retry</button>
        <a href="/" style={{ color: "var(--accent)", fontWeight: 700, textDecoration: "none", alignSelf: "center" }}>Home</a>
      </p>
    </div>
  );
}
