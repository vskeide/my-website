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

    const isActive = (href: string) =>
        pathname === href || pathname.startsWith(href + "/");

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled
                ? "backdrop-blur-xl shadow-lg shadow-black/10 border-border-subtle"
                : "backdrop-blur-md border-transparent"
                }`}
            style={{ height: "var(--nav-height)", backgroundColor: scrolled ? "var(--t-nav-bg-scroll)" : "var(--t-nav-bg)" }}
        >
            <nav className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6">
                {/* Logo */}
                <Link
                    href="/"
                    className="group flex items-center gap-2 text-lg font-bold tracking-tight text-text-primary transition-colors hover:text-accent"
                >
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-accent text-xs font-black text-white transition-transform group-hover:scale-110">
                        S
                    </span>
                    <span>
                        Skeide<span className="text-accent">.me</span>
                    </span>
                </Link>

                {/* Desktop links */}
                <div className="hidden items-center gap-1 md:flex">
                    <ul className="flex items-center gap-1">
                        {navLinks.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className={`relative px-3 py-1.5 text-sm font-medium transition-colors rounded-md ${isActive(link.href)
                                        ? "text-accent bg-accent/10"
                                        : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                                        }`}
                                >
                                    {link.label}
                                    {isActive(link.href) && (
                                        <span className="absolute bottom-0 left-3 right-3 h-px bg-accent" />
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <button
                        onClick={toggle}
                        className="ml-2 flex h-8 w-8 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
                        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    >
                        {theme === 'dark' ? (
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
                    className="relative z-50 flex h-8 w-8 flex-col items-center justify-center gap-1.5 md:hidden"
                    aria-label="Toggle navigation menu"
                    aria-expanded={mobileOpen}
                >
                    <span
                        className={`h-0.5 w-5 rounded-full bg-text-primary transition-all duration-300 ${mobileOpen ? "translate-y-2 rotate-45" : ""
                            }`}
                    />
                    <span
                        className={`h-0.5 w-5 rounded-full bg-text-primary transition-all duration-300 ${mobileOpen ? "opacity-0" : ""
                            }`}
                    />
                    <span
                        className={`h-0.5 w-5 rounded-full bg-text-primary transition-all duration-300 ${mobileOpen ? "-translate-y-2 -rotate-45" : ""
                            }`}
                    />
                </button>
            </nav>

            {/* Mobile menu overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 top-[var(--nav-height)] z-40 backdrop-blur-xl md:hidden"
                    style={{ backgroundColor: theme === 'dark' ? 'rgba(10,15,30,0.95)' : 'rgba(248,250,252,0.95)' }}
                    onClick={() => setMobileOpen(false)}
                >
                    <nav
                        className="flex flex-col gap-1 p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`rounded-lg px-4 py-3 text-base font-medium transition-colors ${isActive(link.href)
                                    ? "bg-accent/10 text-accent"
                                    : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
}
