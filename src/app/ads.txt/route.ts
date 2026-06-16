// Serves /ads.txt for AdSense. Once NEXT_PUBLIC_ADSENSE_CLIENT (ca-pub-…) is set,
// this returns the authorized-seller line Google requires for monetization.
export const dynamic = "force-static";

export function GET() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT; // ca-pub-XXXXXXXXXXXXXXXX
  const pub = client?.replace(/^ca-/, ""); // -> pub-XXXXXXXXXXXXXXXX
  const body = pub
    ? `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`
    : "# ads.txt — set NEXT_PUBLIC_ADSENSE_CLIENT to publish the AdSense seller line\n";
  return new Response(body, { headers: { "content-type": "text/plain" } });
}
