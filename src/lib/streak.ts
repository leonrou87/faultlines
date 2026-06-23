"use client";
// Daily reading streak — a light retention mechanic. localStorage only; counts consecutive calendar days visited.
const KEY = "fl_streak";

function todayStr(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export type StreakState = { count: number; bumped: boolean };

// Call once per session on load. Returns the current streak and whether it just advanced to a new day.
export function tickStreak(): StreakState {
  if (typeof localStorage === "undefined") return { count: 0, bumped: false };
  const today = todayStr();
  const yesterday = todayStr(new Date(Date.now() - 86400000));
  let saved: { date?: string; count?: number } = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { saved = {}; }
  if (saved.date === today) return { count: saved.count || 1, bumped: false };
  const count = saved.date === yesterday ? (saved.count || 0) + 1 : 1;
  try { localStorage.setItem(KEY, JSON.stringify({ date: today, count })); } catch { /* noop */ }
  return { count, bumped: true };
}
