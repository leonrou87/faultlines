// Vote endpoint — proxies to the Supabase `cast_vote` RPC (security-definer, granted to anon).
const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(request: Request) {
  if (!URL_ || !ANON) return Response.json({ error: "not configured" }, { status: 500 });
  let body: { story_id?: number; side?: string; dir?: string };
  try { body = await request.json(); } catch { return Response.json({ error: "bad body" }, { status: 400 }); }
  const { story_id, side, dir } = body;
  if (!story_id || !["left", "right"].includes(side || "") || !["up", "down"].includes(dir || "")) {
    return Response.json({ error: "bad args" }, { status: 400 });
  }
  const r = await fetch(`${URL_.replace(/\/$/, "")}/rest/v1/rpc/cast_vote`, {
    method: "POST",
    headers: { apikey: ANON, Authorization: `Bearer ${ANON}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_story_id: story_id, p_side: side, p_dir: dir }),
  });
  if (!r.ok) return Response.json({ error: "vote failed" }, { status: 502 });
  const row = await r.json();
  const v = Array.isArray(row) ? row[0] : row;
  return Response.json({ up: v?.up ?? 0, down: v?.down ?? 0 });
}
