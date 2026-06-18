import type { Metadata, Viewport } from "next";
import { Archivo, Source_Serif_4, Libre_Franklin } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// Masthead + headlines: a bold grotesque built for headlines (CNN/Fox-style punch).
const display = Archivo({ subsets: ["latin"], weight: ["700", "800", "900"], variable: "--font-display", display: "swap" });
// Long-form article text (modal / teasers): a readable text serif.
const serif = Source_Serif_4({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-serif", display: "swap" });
// UI, labels, buttons: a clean news-grade grotesque.
const sans = Libre_Franklin({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-sans", display: "swap" });

const ADSENSE = process.env.NEXT_PUBLIC_ADSENSE_CLIENT; // e.g. "ca-pub-1234567890123456"

const SITE = "https://faultlines.kytepush.com";
const DESC = "The top stories, summarized neutrally — and for political stories, how the left and the right each frame the same facts.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "Fault Lines — where the country splits, and why", template: "%s · Fault Lines" },
  description: DESC,
  applicationName: "Fault Lines",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Fault Lines" },
  openGraph: { title: "Fault Lines", description: DESC, url: SITE, siteName: "Fault Lines", type: "website" },
  twitter: { card: "summary_large_image", title: "Fault Lines", description: DESC },
};

export const viewport: Viewport = {
  themeColor: "#0f1113", width: "device-width", initialScale: 1, viewportFit: "cover", maximumScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${serif.variable} ${sans.variable}`}>
      <body>
        {children}
        {ADSENSE && (
          <Script
            id="adsbygoogle-init"
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE}`}
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
              <script defer src="https://kytepush.com/track.js"></script>
      </body>
    </html>
  );
}
