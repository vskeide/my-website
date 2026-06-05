"use client";

import { usePathname, useRouter } from "@/lib/i18n-navigation";
import { useLocale } from "next-intl";
import { useState, useEffect } from "react";
import { useTheme } from "./ThemeProvider";
import Link from "next/link";

export default function Navigation() {
    const pathname = usePathname();
    const router = useRouter();
    const locale = useLocale();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { theme, toggle } = useTheme();
    const logoSrc = theme === "dark" ? "/images/logo-light.png" : "/images/logo-dark.png";

    const navLinks = [
        { href: "/blog", label: locale === "no" ? "Blogg" : "Blog" },
        { href: "/archive", label: locale === "no" ? "Arkiv" : "Archive" },
        { href: "/calculators", label: locale === "no" ? "Kalkulatorer" : "Calculators" },
        { href: "/ai", label: "AI" },
        { href: "/apps", label: locale === "no" ? "Apper" : "Apps" },
    ];

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => { setMobileOpen(false); }, [pathname]);

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [mobileOpen]);

    const isActive = (href: string) =>
        pathname === href || pathname.startsWith(href + "/");

    function switchLocale() {
        const next = locale === "no" ? "en" : "no";
        router.replace(pathname, { locale: next });
    }

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled
                    ? "shadow-lg shadow-black/5 border-[var(--t-border-medium)]"
                    : "border-[var(--t-border-subtle)]"
                    }`}
                style={{
                    height: "var(--nav-height)",
                    backgroundColor: scrolled ? "var(--t-nav-bg-scroll)" : "var(--t-nav-bg)",
                    backdropFilter: "blur(14px)",
                }}
            >
                <nav className="mx-auto flex h-full max-w-[90rem] items-center justify-between px-4 sm:px-6">
                    {/* Logo */}
                    <Link href="/" locale={locale} className="group flex items-center gap-2 text-lg font-bold tracking-tight transition-colors" style={{ color: "var(--t-nav-text)" }}>
                        <img src={logoSrc} alt="Skeide.me Logo" className="h-8 w-auto transition-transform group-hover:scale-105" />
                    </Link>

                    {/* Desktop links */}
                    <div className="hidden items-center gap-1 md:flex">
                        <ul className="flex items-center gap-1">
                            {navLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        locale={locale}
                                        className="relative px-4 py-2 text-sm font-medium transition-all"
                                        style={{
                                            color: isActive(link.href) ? "#fff" : "var(--t-nav-text-muted)",
                                            backgroundColor: isActive(link.href) ? "var(--ch-accent)" : "transparent",
                                            borderRadius: "var(--r-pill)",
                                            fontWeight: isActive(link.href) ? 600 : 500,
                                        }}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        {/* Language toggle */}
                        <button
                            onClick={switchLocale}
                            className="ml-2 px-3 py-1.5 text-xs font-semibold transition-colors"
                            style={{ color: "var(--t-nav-text-muted)", border: "1px solid var(--t-border-subtle)", borderRadius: "var(--r-pill)" }}
                            title={locale === "no" ? "Switch to English" : "Bytt til norsk"}
                        >
                            {locale === "no" ? "EN" : "NO"}
                        </button>

                        {/* Theme toggle */}
                        <button
                            onClick={toggle}
                            className="ml-1 flex h-9 w-9 items-center justify-center transition-colors"
                            style={{ color: "var(--t-nav-text-muted)", border: "1px solid var(--t-border-subtle)", borderRadius: "var(--r-pill)" }}
                            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                        >
                            {theme === "dark" ? (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="relative z-[60] flex h-8 w-8 flex-col items-center justify-center gap-1.5 md:hidden"
                        aria-label="Toggle navigation menu"
                        aria-expanded={mobileOpen}
                    >
                        <span className={`block h-0.5 w-5 transition-all duration-300 ${mobileOpen ? "translate-y-2 rotate-45" : ""}`} style={{ background: mobileOpen ? "var(--t-text)" : "var(--t-nav-text)" }} />
                        <span className={`block h-0.5 w-5 transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} style={{ background: "var(--t-nav-text)" }} />
                        <span className={`block h-0.5 w-5 transition-all duration-300 ${mobileOpen ? "-translate-y-2 -rotate-45" : ""}`} style={{ background: mobileOpen ? "var(--t-text)" : "var(--t-nav-text)" }} />
                    </button>
                </nav>
            </header>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-[55] flex flex-col md:hidden" style={{ backgroundColor: "var(--t-bg)" }}>
                    <div className="flex items-center justify-between px-4" style={{ height: "var(--nav-height)", borderBottom: "1px solid var(--t-border-subtle)" }}>
                        <img src={logoSrc} alt="Skeide.me Logo" className="h-7 w-auto" />
                        <button onClick={() => setMobileOpen(false)} className="flex h-10 w-10 items-center justify-center" style={{ color: "var(--t-text)" }} aria-label="Close menu">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <nav className="flex flex-1 flex-col items-center justify-center gap-2 px-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                locale={locale}
                                onClick={() => setMobileOpen(false)}
                                className="w-full py-5 text-center text-3xl tracking-tight transition-colors"
                                style={{
                                    color: isActive(link.href) ? "var(--ch-accent)" : "var(--t-text)",
                                    borderBottom: "1px solid var(--t-border-subtle)",
                                    fontFamily: "var(--font-display)",
                                    fontWeight: 700,
                                    letterSpacing: "-0.02em",
                                }}
                            >
                                {link.label}
                            </Link>
                        ))}

                        <button onClick={switchLocale} className="mt-6 px-4 py-2 text-base font-semibold" style={{ color: "var(--t-text-secondary)", border: "1px solid var(--t-border-subtle)", borderRadius: "var(--r-pill)" }}>
                            {locale === "no" ? "Switch to English" : "Bytt til norsk"}
                        </button>

                        <button onClick={toggle} className="mt-4 flex items-center gap-3 text-base font-medium transition-colors" style={{ color: "var(--t-text-secondary)" }}>
                            {theme === "dark" ? (
                                <><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>Switch to Light Mode</>
                            ) : (
                                <><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>Switch to Dark Mode</>
                            )}
                        </button>
                    </nav>
                </div>
            )}
        </>
    );
}
