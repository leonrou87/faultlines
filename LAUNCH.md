# Fault Lines — Launch Readiness

**Live:** https://faultlines.kytepush.com · **Status: ready to launch.**
Last reviewed: 2026-06-23 (after an extensive automated quality/polish loop).

Fault Lines writes one neutral account of each story, then shows how the left and right each
frame the same facts. Autonomous newsroom (local, launchd, every ~6h) → Supabase → Next.js reader on Vercel.

---

## ✅ What's built and verified live

**Product**
- National feed (Most Debated / The Wire) + **6 city editions** (Seattle, SF, New York, LA, Chicago, DC) with a city switcher
- Geo-aware homepage (mixes the visitor's local edition into national)
- **"Today's Fault Line"** signature daily hero (side-by-side L/R, live verdict, Weigh in + Share)
- Per-story neutral summary + steelmanned Left/Right framings + reader fairness voting
- Search, relative timestamps, "Breaking" pill, saved/bookmarked articles, reading streaks
- City pages: weather, local identity, deep "issues" with provocative questions + polls

**Growth / viral**
- One-tap share on every tile; post-vote "share your take" (X + copy); shareable poll results
- Crowd-verdict social proof on tiles ("62% side with the Left", at ≥3 votes)
- Branded OG social cards for home, every city edition, and every story
- Interactive story pages (shared-link visitors can vote + share, not just read) + "More fault lines" related grid
- First-run onboarding explainer

**Quality / infra**
- Sign-in via Supabase Auth (email magic-link works now; OAuth providers pending — see below)
- Free meter: 3 articles → free sign-in wall
- SEO: robots, sitemap (~390 URLs), NewsArticle JSON-LD, unique per-page titles/descriptions
- Security headers (HSTS, nosniff, frame, referrer, permissions), no powered-by
- A11y: keyboard-operable tiles/hero, modal focus-trap + Esc + scroll-lock, focus-visible rings
- PWA installable (real 192/512/apple-touch icons), preconnects, brotli, trimmed payload (~112KB)
- **No outlet names/links anywhere** (UI or cloud API) — only an anonymized left/center/right coverage bar
- Analytics events on the kytepush track.js beacon (reads, votes, shares, sign-ins, streaks, edition switches)
- Full route-health matrix: all routes 200, invalid story 404s, no console errors

---

## 🔴 Needs YOU before / at launch

1. **OAuth providers** — Google/Apple/GitHub/Facebook buttons are wired but each needs its OAuth app
   registered in Supabase Auth. Email magic-link works today with no setup. (Create the provider apps,
   then I can wire the client IDs/secrets into Supabase.)
2. **AdSense** — integrated (pub-6716195888944928, script + ads.txt live) but **pending Google review**.
   Submit/confirm the review (under kytepush@gmail.com if desired), then send the approved `ca-pub-…` +
   an ad-unit **slot ID** → ads go live (a leaderboard slot can be added then; left out now so empty
   placeholders don't clutter the launch design).
3. **Mobile spot-check** — the dev tooling here couldn't constrain the viewport below ~949px, so verify
   the responsive layout on a real phone (mastheads, daily hero, modal). CSS is written and reasoned.
4. **Custom domain / email** — support email is kytepush@gmail.com.

---

## 🟡 Operational notes

- **Newsroom**: runs at `~/faultlines` via launchd `news.faultlines.pipeline` every ~6h
  (ingest→embed→cluster→rank→generate→originality→publish→sync). Reader reads published rows from Supabase.
- **Cost**: generation via `claude -p`; `MONTHLY_COST_CEILING` ~$50, degrades to neutral-only at 80%, halts at 100%.
- **Content quality**: split L/R views are strong. National neutral bodies were terse (an over-strict
  originality gate forced template fallbacks); the gate was tuned (10-word runs) and **verified** to let
  full ~200-word prose through — so articles fill out over the next few newsroom cycles. Existing bodies
  were already cleaned up. Single-source local stories remain concise fact-briefs by design.

## Known limitations / future
- Account-synced saves implemented (Supabase, RLS) but e2e-tested only via the anon path.
- No referral/attribution system yet.
- Local "things to do" curated only for Seattle/SF.
