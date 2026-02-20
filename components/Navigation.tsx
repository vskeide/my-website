"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "./ThemeProvider";

const navLinks = [
    { href: "/blog", label: "Blog" },
    { href: "/archive", label: "Archive" },
    { href: "/calculators", label: "Calculators" },
];

export default function Navigation() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { theme, toggle } = useTheme();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    // Prevent body scroll when mobile menu open
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [mobileOpen]);

    const isActive = (href: string) =>
        pathname === href || pathname.startsWith(href + "/");

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
                    backdropFilter: "blur(12px)",
                }}
            >
                <nav className="mx-auto flex h-full max-w-[90rem] items-center justify-between px-4 sm:px-6">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="group flex items-center gap-2 text-lg font-bold tracking-tight transition-colors"
                        style={{ color: "var(--t-text)" }}
                    >
                        <span
                            className="inline-flex h-7 w-7 items-center justify-center text-xs font-black text-white transition-transform group-hover:scale-110"
                            style={{ background: "var(--ch-accent)", borderRadius: 0 }}
                        >
                            S
                        </span>
                        <span>
                            Skeide<span style={{ color: "var(--ch-accent)" }}>.me</span>
                        </span>
                    </Link>

                    {/* Desktop links */}
                    <div className="hidden items-center gap-1 md:flex">
                        <ul className="flex items-center gap-1">
                            {navLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className={`relative px-3 py-1.5 text-sm font-medium transition-colors ${isActive(link.href)
                                            ? "font-semibold"
                                            : ""
                                            }`}
                                        style={{
                                            color: isActive(link.href) ? "var(--ch-accent)" : "var(--t-text-secondary)",
                                            backgroundColor: isActive(link.href) ? "rgba(37,99,235,0.08)" : "transparent",
                                            borderRadius: 0,
                                        }}
                                    >
                                        {link.label}
                                        {isActive(link.href) && (
                                            <span className="absolute bottom-0 left-3 right-3 h-px" style={{ background: "var(--ch-accent)" }} />
                                        )}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={toggle}
                            className="ml-2 flex h-8 w-8 items-center justify-center transition-colors"
                            style={{ color: "var(--t-text-muted)" }}
                            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
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
                        <span
                            className={`block h-0.5 w-5 transition-all duration-300 ${mobileOpen ? "translate-y-2 rotate-45" : ""}`}
                            style={{ background: mobileOpen ? "var(--t-text)" : "var(--t-text)" }}
                        />
                        <span
                            className={`block h-0.5 w-5 transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`}
                            style={{ background: "var(--t-text)" }}
                        />
                        <span
                            className={`block h-0.5 w-5 transition-all duration-300 ${mobileOpen ? "-translate-y-2 -rotate-45" : ""}`}
                            style={{ background: "var(--t-text)" }}
                        />
                    </button>
                </nav>
            </header>

            {/* Full-screen mobile menu overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-[55] flex flex-col md:hidden"
                    style={{ backgroundColor: "var(--t-card)" }}
                >
                    {/* Top bar with close button */}
                    <div
                        className="flex items-center justify-between px-4"
                        style={{ height: "var(--nav-height)", borderBottom: "1px solid var(--t-border-subtle)" }}
                    >
                        {/* Logo replica */}
                        <span className="flex items-center gap-2 font-bold text-base" style={{ color: "var(--t-text)" }}>
                            <span className="inline-flex h-7 w-7 items-center justify-center text-xs font-black text-white" style={{ background: "var(--ch-accent)", borderRadius: 0 }}>S</span>
                            Skeide<span style={{ color: "var(--ch-accent)" }}>.me</span>
                        </span>
                        {/* Explicit X close button */}
                        <button
                            onClick={() => setMobileOpen(false)}
                            className="flex h-10 w-10 items-center justify-center"
                            style={{ color: "var(--t-text)" }}
                            aria-label="Close menu"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Centered nav links */}
                    <nav className="flex flex-1 flex-col items-center justify-center gap-2 px-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className="w-full py-5 text-center text-3xl font-bold tracking-tight transition-colors"
                                style={{
                                    color: isActive(link.href) ? "var(--ch-accent)" : "var(--t-text)",
                                    borderBottom: `1px solid var(--t-border-subtle)`,
                                }}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {/* Theme toggle in mobile menu */}
                        <button
                            onClick={toggle}
                            className="mt-8 flex items-center gap-3 text-base font-medium transition-colors"
                            style={{ color: "var(--t-text-secondary)" }}
                        >
                            {theme === "dark" ? (
                                <>
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    Switch to Light Mode
                                </>
                            ) : (
                                <>
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                    Switch to Dark Mode
                                </>
                            )}
                        </button>
                    </nav>
                </div>
            )}
        </>
    );
}
