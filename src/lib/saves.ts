"use client";
// Bookmarked stories. Optimistic localStorage cache for instant UI; when signed in, mirrors to a
// Supabase `saves` table (RLS-scoped to the user) so bookmarks follow you across devices.
import { supabase } from "./supabase-browser";

const KEY = "fl_saved";
const EV = "fl-saves-changed";
let cache: Set<string> | null = null; // authoritative once initSaves runs

function lsGet(): string[] {
  if (typeof localStorage === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function lsSet(ids: string[]) {
  try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch { /* noop */ }
}
function emit() { if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(EV)); }

export function savedIds(): string[] {
  return cache ? [...cache] : lsGet();
}
export function isSaved(id: string | number): boolean {
  const k = String(id);
  return cache ? cache.has(k) : lsGet().includes(k);
}

// Load saves: merge any local bookmarks with the signed-in user's cloud rows (uploading local-only ones).
export async function initSaves(): Promise<void> {
  const local = new Set(lsGet());
  const sb = supabase();
  const { data } = sb ? await sb.auth.getUser() : { data: { user: null } };
  const uid = data?.user?.id;
  if (!sb || !uid) { cache = local; emit(); return; }
  try {
    const { data: rows } = await sb.from("saves").select("story_id");
    const cloud = new Set<string>((rows || []).map((r: { story_id: number }) => String(r.story_id)));
    const localOnly = [...local].filter((id) => !cloud.has(id));
    if (localOnly.length) {
      await sb.from("saves").upsert(localOnly.map((id) => ({ user_id: uid, story_id: Number(id) })));
      localOnly.forEach((id) => cloud.add(id));
    }
    cache = cloud;
    lsSet([...cloud]);
  } catch {
    cache = local; // offline / error → fall back to local
  }
  emit();
}

export function toggleSave(id: string | number): boolean {
  const k = String(id);
  const set = cache ?? new Set(lsGet());
  const nowSaved = !set.has(k);
  if (nowSaved) set.add(k); else set.delete(k);
  cache = set;
  lsSet([...set]);
  emit();
  // Mirror to the cloud in the background when signed in.
  const sb = supabase();
  if (sb) {
    sb.auth.getUser().then(({ data }) => {
      const uid = data?.user?.id;
      if (!uid) return;
      if (nowSaved) sb.from("saves").upsert({ user_id: uid, story_id: Number(k) }).then(() => {});
      else sb.from("saves").delete().eq("user_id", uid).eq("story_id", Number(k)).then(() => {});
    });
  }
  return nowSaved;
}

export function onSavesChanged(cb: () => void): () => void {
  const h = () => cb();
  window.addEventListener(EV, h);
  window.addEventListener("storage", h);
  return () => { window.removeEventListener(EV, h); window.removeEventListener("storage", h); };
}
