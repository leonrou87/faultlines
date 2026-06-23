"use client";
// Bookmarked stories. localStorage-backed (instant, works for everyone); a "saves changed" event
// keeps every mounted component in sync. Account-synced saves are a future upgrade.
const KEY = "fl_saved";
const EV = "fl-saves-changed";

export function savedIds(): string[] {
  if (typeof localStorage === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
export function isSaved(id: string | number): boolean {
  return savedIds().includes(String(id));
}
export function toggleSave(id: string | number): boolean {
  const ids = savedIds();
  const k = String(id);
  const i = ids.indexOf(k);
  let nowSaved: boolean;
  if (i >= 0) { ids.splice(i, 1); nowSaved = false; } else { ids.unshift(k); nowSaved = true; }
  localStorage.setItem(KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent(EV));
  return nowSaved;
}
export function onSavesChanged(cb: () => void): () => void {
  const h = () => cb();
  window.addEventListener(EV, h);
  window.addEventListener("storage", h); // cross-tab
  return () => { window.removeEventListener(EV, h); window.removeEventListener("storage", h); };
}
