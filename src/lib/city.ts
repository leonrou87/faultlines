// City-edition config, live weather (Open-Meteo, free/no-key), and issue/poll data access.
const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const H = { apikey: ANON || "", Authorization: `Bearer ${ANON || ""}` };

export type CityCfg = {
  name: string; lat: number; lon: number; accent: string; tagline: string;
  impact: string;
  thingsToDo: { group: string; items: { name: string; note: string }[] }[];
};

export const CITIES: Record<string, CityCfg> = {
  seattle: {
    name: "Seattle", lat: 47.6062, lon: -122.3321, accent: "#2f8f9d",
    tagline: "The Emerald City",
    impact: "A tech-and-coffee capital wedged between Puget Sound and the Cascades — booming, beautiful, and arguing with itself over how to grow.",
    thingsToDo: [
      { group: "See & Do", items: [
        { name: "Pike Place Market", note: "The original — fishmongers, the first Starbucks, the gum wall." },
        { name: "Space Needle & Seattle Center", note: "City views + Chihuly Garden and MoPOP next door." },
        { name: "Museum of Pop Culture (MoPOP)", note: "Music, sci-fi and pop-culture under Gehry's metal swoop." },
      ]},
      { group: "Eat & Drink", items: [
        { name: "The Walrus and the Carpenter", note: "Ballard oyster bar, a Seattle institution." },
        { name: "Canlis", note: "Special-occasion fine dining with a midcentury view." },
        { name: "Capitol Hill", note: "The city's densest stretch of bars, coffee and late-night food." },
      ]},
      { group: "Outdoors", items: [
        { name: "Discovery Park", note: "534 acres of bluffs, beach and forest in the city." },
        { name: "Washington Park Arboretum", note: "Paddle the marsh or walk the Japanese Garden." },
        { name: "Mount Rainier day trip", note: "Two hours to an active volcano and alpine meadows." },
      ]},
    ],
  },
  sf: {
    name: "San Francisco", lat: 37.7749, lon: -122.4194, accent: "#c4603f",
    tagline: "The City by the Bay",
    impact: "Seven square miles of fog, hills and reinvention — the center of the AI boom and a long-running fight over its own future.",
    thingsToDo: [
      { group: "See & Do", items: [
        { name: "Golden Gate Bridge", note: "Walk or bike across to the Marin headlands." },
        { name: "Ferry Building Marketplace", note: "Food hall + farmers market on the Embarcadero." },
        { name: "Golden Gate Park", note: "De Young, the Academy of Sciences, and miles of trails." },
      ]},
      { group: "Eat & Drink", items: [
        { name: "The Mission", note: "Burritos, taquerias and murals — the city's food heart." },
        { name: "Tartine Bakery", note: "The bread that launched a thousand imitators." },
        { name: "North Beach", note: "Italian cafes and the Beat-era City Lights bookstore." },
      ]},
      { group: "Outdoors", items: [
        { name: "Lands End", note: "Coastal trail to the Sutro Baths ruins." },
        { name: "Twin Peaks", note: "The classic 360° view of the city and bay." },
        { name: "Muir Woods day trip", note: "Old-growth redwoods just over the bridge." },
      ]},
    ],
  },
};

const WMO: [number[], string, string][] = [
  [[0], "Clear", "☀️"], [[1, 2], "Partly cloudy", "⛅"], [[3], "Overcast", "☁️"],
  [[45, 48], "Fog", "🌫️"], [[51, 53, 55, 56, 57], "Drizzle", "🌦️"],
  [[61, 63, 65, 66, 67, 80, 81, 82], "Rain", "🌧️"], [[71, 73, 75, 77, 85, 86], "Snow", "❄️"],
  [[95, 96, 99], "Storms", "⛈️"],
];
export async function getWeather(c: CityCfg): Promise<{ temp: number; label: string; icon: string } | null> {
  try {
    const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&current=temperature_2m,weather_code&temperature_unit=fahrenheit`, { next: { revalidate: 1800 } });
    if (!r.ok) return null;
    const j = await r.json();
    const code = j.current?.weather_code ?? 0;
    const m = WMO.find(([codes]) => codes.includes(code)) || [[], "—", "🌡️"];
    return { temp: Math.round(j.current?.temperature_2m ?? 0), label: m[1] as string, icon: m[2] as string };
  } catch { return null; }
}

export type Issue = { slug: string; title: string; dek: string; body: string; questions: string[] };
export type Poll = { id: number; question: string; options: string[]; votes: number[] };

const asArr = (v: unknown): unknown[] => Array.isArray(v) ? v : (typeof v === "string" ? (() => { try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch { return []; } })() : []);

export async function getIssues(city: string): Promise<Issue[]> {
  if (!URL_) return [];
  try {
    const r = await fetch(`${URL_}/rest/v1/city_issues?city=eq.${city}&select=slug,title,dek,body,questions&order=rank.asc,id.asc`, { headers: H, next: { revalidate: 300 } });
    if (!r.ok) return [];
    return (await r.json()).map((i: Record<string, unknown>) => ({ ...i, questions: asArr(i.questions) })) as Issue[];
  } catch { return []; }
}

export async function getIssue(slug: string): Promise<Issue | null> {
  if (!URL_) return null;
  try {
    const r = await fetch(`${URL_}/rest/v1/city_issues?slug=eq.${slug}&select=slug,title,dek,body,questions&limit=1`, { headers: H, next: { revalidate: 300 } });
    if (!r.ok) return null;
    const rows = await r.json();
    return rows[0] ? { ...rows[0], questions: asArr(rows[0].questions) } : null;
  } catch { return null; }
}

export async function getPolls(issueSlug: string): Promise<Poll[]> {
  if (!URL_) return [];
  try {
    const [pRes, vRes] = await Promise.all([
      fetch(`${URL_}/rest/v1/polls?issue_slug=eq.${issueSlug}&select=id,question,options&order=id.asc`, { headers: H, next: { revalidate: 60 } }),
      fetch(`${URL_}/rest/v1/poll_votes?select=poll_id,option_idx,votes`, { headers: H, next: { revalidate: 20 } }),
    ]);
    if (!pRes.ok) return [];
    const polls = await pRes.json();
    const votes = vRes.ok ? await vRes.json() : [];
    return polls.map((p: { id: number; question: string; options: unknown }) => {
      const opts = asArr(p.options) as string[];
      const counts = opts.map((_, i) => votes.find((v: { poll_id: number; option_idx: number }) => v.poll_id === p.id && v.option_idx === i)?.votes || 0);
      return { id: p.id, question: p.question, options: opts, votes: counts };
    }) as Poll[];
  } catch { return []; }
}
