"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import type { Provider } from "@supabase/supabase-js";

const PROVIDERS: { id: Provider; label: string }[] = [
  { id: "google", label: "Continue with Google" },
  { id: "apple", label: "Continue with Apple" },
  { id: "github", label: "Continue with GitHub" },
  { id: "facebook", label: "Continue with Facebook" },
];

export default function AuthButton() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<{ email?: string; name?: string; avatar?: string } | null>(null);
  const [msg, setMsg] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sb = supabase();
    if (!sb) return;
    sb.auth.getUser().then(({ data }) => { if (data.user) setUser(toUser(data.user)); });
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => setUser(session?.user ? toUser(session.user) : null));
    return () => sub.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  function toUser(u: { email?: string; user_metadata?: Record<string, unknown> }) {
    const m = u.user_metadata || {};
    return { email: u.email, name: (m.name || m.full_name || m.user_name) as string, avatar: (m.avatar_url || m.picture) as string };
  }

  async function oauth(provider: Provider) {
    const sb = supabase(); if (!sb) return;
    const { error } = await sb.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin } });
    if (error) setMsg(error.message.includes("provider is not enabled") ? "That provider isn't enabled yet." : error.message);
  }
  async function magicLink() {
    const sb = supabase(); if (!sb || !email) return;
    const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    setMsg(error ? error.message : "Check your email for a sign-in link.");
  }
  async function signOut() { await supabase()?.auth.signOut(); setUser(null); setOpen(false); }

  if (user) {
    return (
      <div className="auth" ref={ref}>
        <button className="auth-avatar" onClick={() => setOpen((o) => !o)} title={user.email}>
          {user.avatar ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={user.avatar} alt="" /> : (user.name || user.email || "?").slice(0, 1).toUpperCase()}
        </button>
        {open && (
          <div className="auth-pop">
            <div className="auth-who">{user.name || user.email}</div>
            <button onClick={signOut}>Sign out</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="auth" ref={ref}>
      <button className="auth-btn" onClick={() => setOpen((o) => !o)}>Sign in</button>
      {open && (
        <div className="auth-pop wide">
          <div className="auth-h">Join the debate</div>
          {PROVIDERS.map((p) => <button key={p.id} className="auth-oauth" onClick={() => oauth(p.id)}>{p.label}</button>)}
          <div className="auth-or">or email me a link</div>
          <input className="auth-email" type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className="auth-oauth primary" onClick={magicLink}>Email sign-in link</button>
          {msg && <div className="auth-msg">{msg}</div>}
        </div>
      )}
    </div>
  );
}
