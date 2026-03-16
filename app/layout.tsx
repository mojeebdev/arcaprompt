import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ArcaPrompt | Build Better. Prompt Smarter.",
  description: "Describe what you want to build. ArcaPrompt gives you structured prompts, a tech stack, hosting, and name suggestions — powered by Gemini.",
  metadataBase: new URL("https://arcaprompt.arcapush.com"),
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/arcaprompt-logo.png",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "ArcaPrompt | Build Better. Prompt Smarter.",
    description: "Describe what you want to build. Get structured prompts, a recommended tech stack, hosting advice, and name suggestions. Powered by Gemini.",
    url: "https://arcaprompt.arcapush.com",
    siteName: "ArcaPrompt by Arcapush.com",
    images: [{ url: "/og-arcprompt.png", width: 1200, height: 630, alt: "ArcaPrompt by Arcapush.com" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@Arcapush",
    creator: "@mojeebeth",
    title: "ArcaPrompt | Build Better. Prompt Smarter.",
    description: "Stop fumbling your prompts. Describe your idea — ArcaPrompt structures it, stacks it, and ships you ready to build.",
    images: ["/og-acraprompt.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Syne:wght@400;600;700;800&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, background: "#04030f" }} suppressHydrationWarning>
        {children}
      </body>
      <script defer src="https://cloud.umami.is/script.js" data-website-id="YOUR_UMAMI_ID"></script>
    </html>
  );
}