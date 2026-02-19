import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import ThemeProvider from "@/components/ThemeProvider";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Skeide.me — Personal Finance & Economics",
    template: "%s | Skeide.me",
  },
  description:
    "Insights on investing, personal economy, and local politics from an independent perspective.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider>
          <Navigation />
          <div style={{ paddingTop: "var(--nav-height)" }}>{children}</div>

          {/* Footer */}
          <footer className="border-t border-border-subtle" style={{ backgroundColor: "var(--t-bg)" }}>
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
              <p className="text-xs text-text-muted">
                © {new Date().getFullYear()} Skeide.me — All rights reserved
              </p>
              <nav className="flex items-center gap-4">
                <a
                  href="/blog"
                  className="text-xs text-text-muted transition-colors hover:text-text-secondary"
                >
                  Blog
                </a>
                <a
                  href="/archive"
                  className="text-xs text-text-muted transition-colors hover:text-text-secondary"
                >
                  Archive
                </a>
                <a
                  href="/calculators"
                  className="text-xs text-text-muted transition-colors hover:text-text-secondary"
                >
                  Calculators
                </a>
              </nav>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
