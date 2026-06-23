"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import { track } from "@/lib/track";
import type { Provider } from "@supabase/supabase-js";

const PROVIDERS: { id: Provider; label: string }[] = [
  { id: "google", label: "Continue with Google" },
  { id: "apple", label: "Continue with Apple" },
  { id: "github", label: "Continue with GitHub" },
];

export default function SignInWall({ onClose }: { onClose?: () => void }) {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  async function oauth(provider: Provider) {
    const sb = supabase(); if (!sb) return;
    track("signin_wall", provider);
    const { error } = await sb.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.href } });
    if (error) setMsg(error.message.includes("not enabled") ? "That provider isn't turned on yet — try the email link." : error.message);
  }
  async function magic() {
    const sb = supabase(); if (!sb || !email) return;
    track("signin_wall", "email");
    const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.href } });
    setMsg(error ? error.message : "Check your email for your free sign-in link.");
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="wall" onClick={(e) => e.stopPropagation()}>
        <div className="wall-kick">You&apos;ve read your 3 free articles</div>
        <h2>Keep reading — it&apos;s <span className="free">free</span>.</h2>
        <p>Sign in to read unlimited stories, vote on every split, and weigh in on the debates. No paywall, no catch.</p>
        <div className="wall-providers">
          {PROVIDERS.map((p) => <button key={p.id} className="auth-oauth" onClick={() => oauth(p.id)}>{p.label}</button>)}
        </div>
        <div className="auth-or">or get a free email link</div>
        <div className="wall-email">
          <input type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className="auth-oauth primary" onClick={magic}>Send link</button>
        </div>
        {msg && <div className="auth-msg">{msg}</div>}
        {onClose && <button className="wall-later" onClick={onClose}>Maybe later</button>}
      </div>
    </div>
  );
}
