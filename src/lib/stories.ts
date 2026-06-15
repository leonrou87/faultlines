// Server-side read of published stories from Supabase (public RLS read with the anon key).
export type Source = { name: string; lean: 'left' | 'center' | 'right' | 'wire'; url: string; title?: string };
export type Vote = { up: number; down: number };
export type Story = {
  id: number; topic: string; neutral_title: string; neutral_body: string;
  is_political: boolean; has_split: boolean;
  left_view: string | null; right_view: string | null;
  agree_points: string[]; split_points: string[];
  tension_score: number | null; tension_rationale: string | null; confidence: number | null;
  sources: Source[]; generator: string | null;
  votes: { left: Vote; right: Vote };
};

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function getStories(): Promise<Story[]> {
  if (!URL_ || !ANON) return [];
  const base = URL_.replace(/\/$/, '') + '/rest/v1';
  const h = { apikey: ANON, Authorization: `Bearer ${ANON}` };
  try {
    const [sRes, vRes] = await Promise.all([
      fetch(`${base}/stories?select=*&order=rank_score.desc&limit=50`, { headers: h, next: { revalidate: 60 } }),
      fetch(`${base}/votes?select=story_id,side,up,down`, { headers: h, next: { revalidate: 30 } }),
    ]);
    if (!sRes.ok) return [];
    const stories = await sRes.json();
    const votes = vRes.ok ? await vRes.json() : [];
    const vmap = new Map<string, Vote>();
    for (const v of votes) vmap.set(`${v.story_id}:${v.side}`, { up: v.up, down: v.down });
    return stories.map((s: Record<string, unknown>) => ({
      ...s,
      agree_points: s.agree_points ?? [],
      split_points: s.split_points ?? [],
      sources: s.sources ?? [],
      votes: {
        left: vmap.get(`${s.id}:left`) ?? { up: 0, down: 0 },
        right: vmap.get(`${s.id}:right`) ?? { up: 0, down: 0 },
      },
    })) as Story[];
  } catch {
    return [];
  }
}
