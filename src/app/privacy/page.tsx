export const metadata = { title: "Privacy Policy — Fault Lines" };

export default function Privacy() {
  return (
    <>
      <header className="app">
        <div className="bar"><a href="/" className="wordmark">Fault<span className="seam" />Lines</a></div>
      </header>
      <article className="doc">
        <h1>Privacy Policy</h1>
        <p>Last updated June 2026. Fault Lines (&ldquo;we&rdquo;) operates faultlines.kytepush.com.</p>

        <h3>What we collect</h3>
        <p>We do not require accounts and do not ask for your name, email, or other personal identifiers.
        When you vote on how fairly a side is framed, we store only an anonymous tally — not who voted.
        We keep basic, aggregate analytics about page usage.</p>

        <h3>Cookies &amp; advertising</h3>
        <p>We use Google AdSense to display advertising. Google and its partners may use cookies and similar
        technologies to serve ads based on your prior visits to this and other websites. Google&apos;s use of
        advertising cookies enables it and its partners to serve ads to you based on your visit to our site
        and/or other sites on the Internet.</p>
        <p>You may opt out of personalized advertising by visiting{" "}
        <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener" style={{ color: "var(--accent)" }}>Google Ads Settings</a>.
        For more on how Google uses data, see{" "}
        <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener" style={{ color: "var(--accent)" }}>Google&apos;s policies</a>.
        Third-party vendors, including Google, use cookies to serve ads based on prior visits.</p>

        <h3>Data storage</h3>
        <p>Story content and anonymous vote tallies are stored with Supabase. We link out to original sources;
        when you click a source chip you are subject to that publisher&apos;s own privacy policy.</p>

        <h3>Children</h3>
        <p>This site is not directed to children under 13 and we do not knowingly collect their data.</p>

        <h3>Contact</h3>
        <p>Questions &amp; support: kytepush@gmail.com</p>

        <p style={{ marginTop: 30 }}><a href="/" style={{ color: "var(--accent)" }}>← Back to the feed</a></p>
      </article>
    </>
  );
}
