// Server-side read of published stories from Supabase (public RLS read with the anon key).
export type Source = { name: string; lean: 'left' | 'center' | 'right' | 'wire'; url: string; title?: string };
export type Vote = { up: number; down: number };
export type Story = {
  id: number; topic: string; neutral_title: string; neutral_body: string;
  is_political: boolean; has_split: boolean;
  left_view: string | null; right_view: string | null;
  left_summary: string | null; right_summary: string | null;
  image_url: string | null;
  agree_points: string[]; split_points: string[];
  tension_score: number | null; tension_rationale: string | null; confidence: number | null;
  sources: Source[]; generator: string | null;
  published_at: string | null;
  trending: number;
  votes: { left: Vote; right: Vote };
};

// A 0-100 "trending" score from corroboration, freshness, and engagement.
function trendingScore(s: { sources?: unknown[]; published_at?: string | null; lvotes: Vote; rvotes: Vote; has_split?: boolean }): number {
  const srcN = Array.isArray(s.sources) ? s.sources.length : 0;
  const corroboration = Math.min(45, 11 * Math.log2(1 + srcN)); // many sources => hot
  const ageH = s.published_at ? (Date.now() - Date.parse(s.published_at)) / 3.6e6 : 48;
  const fresh = Math.max(0, 30 * Math.pow(0.5, ageH / 10)); // halves every 10h
  const votes = s.lvotes.up + s.lvotes.down + s.rvotes.up + s.rvotes.down;
  const engagement = Math.min(20, votes * 2);
  const splitBoost = s.has_split ? 5 : 0;
  return Math.max(1, Math.min(100, Math.round(corroboration + fresh + engagement + splitBoost)));
}

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// RSS feeds often hand back tiny thumbnails. Rewrite known size markers to full-res
// (the <img> falls back to a gradient if an upgraded URL 404s, so this is safe).
export function upgradeImage(u: string | null): string | null {
  if (!u) return u;
  let out = u;
  out = out.replace(/(\/ace\/[a-z_]+)\/\d{2,4}\//i, "$1/1024/");        // BBC iChef
  out = out.replace(/(ichef\.bbci\.co\.uk\/news)\/\d{2,4}\//i, "$1/1024/");
  out = out.replace(/\/width\/\d+\//i, "/width/1200/");                  // Guardian/i-images
  out = out.replace(/([?&](?:w|width|resize|rw|fit|size|wid))=\d+/gi, "$1=1200"); // CDN width params
  out = out.replace(/-\d{2,4}x\d{2,4}(\.(?:jpe?g|png|webp|avif|gif))/i, "$1");    // WordPress -800x450 suffix
  out = out.replace(/(\/resize\/)\d+(x\d+)?\//i, "$11200/");            // generic /resize/240/
  return out;
}

export async function getStories(): Promise<Story[]> {
  if (!URL_ || !ANON) return [];
  const base = URL_.replace(/\/$/, '') + '/rest/v1';
  const h = { apikey: ANON, Authorization: `Bearer ${ANON}` };
  try {
    const [sRes, vRes] = await Promise.all([
      fetch(`${base}/stories?select=*&order=rank_score.desc&limit=200`, { headers: h, next: { revalidate: 60 } }),
      fetch(`${base}/votes?select=story_id,side,up,down`, { headers: h, next: { revalidate: 30 } }),
    ]);
    if (!sRes.ok) return [];
    const stories = await sRes.json();
    const votes = vRes.ok ? await vRes.json() : [];
    const vmap = new Map<string, Vote>();
    for (const v of votes) vmap.set(`${v.story_id}:${v.side}`, { up: v.up, down: v.down });
    const asArray = (v: unknown): unknown[] => {
      if (Array.isArray(v)) return v;
      if (typeof v === "string") { try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch { return []; } }
      return [];
    };
    return stories.map((s: Record<string, unknown>) => {
      const lvotes = vmap.get(`${s.id}:left`) ?? { up: 0, down: 0 };
      const rvotes = vmap.get(`${s.id}:right`) ?? { up: 0, down: 0 };
      const sources = asArray(s.sources);
      return {
        ...s,
        image_url: upgradeImage(s.image_url as string | null),
        agree_points: asArray(s.agree_points),
        split_points: asArray(s.split_points),
        sources,
        trending: trendingScore({ sources, published_at: s.published_at as string, lvotes, rvotes, has_split: !!s.has_split }),
        votes: { left: lvotes, right: rvotes },
      };
    }) as Story[];
  } catch {
    return [];
  }
}
