// Poll vote endpoint — proxies to the Supabase `cast_poll_vote` RPC (anon, security-definer).
const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(request: Request) {
  if (!URL_ || !ANON) return Response.json({ error: "not configured" }, { status: 500 });
  let b: { poll_id?: number; option_idx?: number };
  try { b = await request.json(); } catch { return Response.json({ error: "bad body" }, { status: 400 }); }
  if (typeof b.poll_id !== "number" || typeof b.option_idx !== "number" || b.option_idx < 0 || b.option_idx > 9)
    return Response.json({ error: "bad args" }, { status: 400 });
  const r = await fetch(`${URL_.replace(/\/$/, "")}/rest/v1/rpc/cast_poll_vote`, {
    method: "POST",
    headers: { apikey: ANON, Authorization: `Bearer ${ANON}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_poll_id: b.poll_id, p_option_idx: b.option_idx }),
  });
  if (!r.ok) return Response.json({ error: "vote failed" }, { status: 502 });
  const row = await r.json();
  const v = Array.isArray(row) ? row[0] : row;
  return Response.json({ option_idx: v?.option_idx, votes: v?.votes ?? 0 });
}
