import type { Metadata } from "next";
import { Inter, Bricolage_Grotesque, Newsreader } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Navigation from "@/components/Navigation";
import ThemeProvider from "@/components/ThemeProvider";
import "../globals.css";

const inter = Inter({
    variable: "--font-geist-sans",
    subsets: ["latin"],
    display: "swap",
});
const bricolage = Bricolage_Grotesque({
    variable: "--font-bricolage",
    subsets: ["latin"],
    display: "swap",
});
const newsreader = Newsreader({
    variable: "--font-newsreader",
    subsets: ["latin"],
    display: "swap",
});

export const metadata: Metadata = {
    title: {
        default: "Skeide.me — Personal Finance & Economics",
        template: "%s | Skeide.me",
    },
    description: "Insights on investing, personal economy, and local politics from an independent perspective.",
};

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    if (!(routing.locales as readonly string[]).includes(locale)) {
        notFound();
    }

    const messages = await getMessages();

    return (
        <html lang={locale} suppressHydrationWarning>
            <body className={`${inter.variable} ${bricolage.variable} ${newsreader.variable} antialiased`} suppressHydrationWarning>
                <NextIntlClientProvider messages={messages}>
                    <ThemeProvider>
                        <Navigation />
                        {children}

                        <style>{`
                            body:has(.article-outer) [data-global-footer] {
                                display: none !important;
                            }
                        `}</style>
                        <div data-global-footer="">
                            <footer className="border-t border-border-subtle" style={{ backgroundColor: "var(--t-bg)" }}>
                                <div className="mx-auto flex max-w-[90rem] flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
                                    <p className="text-xs text-text-muted">
                                        © {new Date().getFullYear()} Skeide.me — {locale === "no" ? "Alle rettar atterhaldne" : "All rights reserved"}
                                    </p>
                                    <nav className="flex items-center gap-4">
                                        <a href={locale === "en" ? "/en/blog" : "/blog"} className="text-xs text-text-muted transition-colors hover:text-text-secondary">{locale === "no" ? "Blogg" : "Blog"}</a>
                                        <a href={locale === "en" ? "/en/archive" : "/archive"} className="text-xs text-text-muted transition-colors hover:text-text-secondary">{locale === "no" ? "Arkiv" : "Archive"}</a>
                                        <a href={locale === "en" ? "/en/calculators" : "/calculators"} className="text-xs text-text-muted transition-colors hover:text-text-secondary">{locale === "no" ? "Kalkulatorar" : "Calculators"}</a>
                                        <a href={locale === "en" ? "/en/ai" : "/ai"} className="text-xs text-text-muted transition-colors hover:text-text-secondary">AI</a>
                                        <a href={locale === "en" ? "/en/apps" : "/apps"} className="text-xs text-text-muted transition-colors hover:text-text-secondary">{locale === "no" ? "Apper" : "Apps"}</a>
                                    </nav>
                                </div>
                            </footer>
                        </div>
                    </ThemeProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
