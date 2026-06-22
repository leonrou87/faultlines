"use client";
// Soft meter: 3 free articles, then a (free) sign-in wall. Tracked in localStorage by story id.
export const FREE_LIMIT = 3;
const KEY = "fl_read";

export function readIds(): string[] {
  if (typeof localStorage === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
export function recordRead(id: string | number) {
  if (typeof localStorage === "undefined") return;
  const ids = readIds();
  if (!ids.includes(String(id))) { ids.push(String(id)); localStorage.setItem(KEY, JSON.stringify(ids)); }
}
export function readCount() { return readIds().length; }
// Can this id be read for free? (already-read ones never re-gate; otherwise under the limit)
export function canRead(id: string | number) {
  const ids = readIds();
  return ids.includes(String(id)) || ids.length < FREE_LIMIT;
}
