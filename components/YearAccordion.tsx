"use client";

import { useState } from "react";
import Link from "next/link";

export interface ArchiveEntry {
    slug: string;
    title: string;
    date: string;
    category: string;
    type?: "article" | "calculator";
    /** Set when the article exists only in the other language. */
    fallbackLocale?: string;
}

interface YearAccordionProps {
    year: number;
    entries: ArchiveEntry[];
    defaultOpen?: boolean;
    locale?: string;
}

import { getCategoryBadgeStyle } from "@/lib/categories";
import { onlyInLabel } from "@/lib/locale-labels";

export default function YearAccordion({
    year,
    entries,
    defaultOpen = false,
    locale = "no",
}: YearAccordionProps) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div style={{ borderBottom: "1px solid var(--t-border-subtle)" }} className="last:border-b-0">
            {/* Full-width banner button */}
            <button
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between px-5 py-3.5 text-left transition-colors"
                style={{
                    backgroundColor: "var(--t-surface)",
                    color: "var(--t-text)",
                    borderRadius: "var(--r-panel)",
                }}
                aria-expanded={open}
            >
                <div className="flex items-center gap-4">
                    <span className="text-lg font-bold tracking-tight">{year}</span>
                    <span className="text-xs font-medium" style={{ color: "var(--t-text-muted)" }}>
                        {entries.length}{" "}
                        {locale === "no"
                            ? entries.length === 1 ? "oppføring" : "oppføringar"
                            : entries.length === 1 ? "entry" : "entries"}
                    </span>
                </div>
                <svg
                    className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    style={{ color: "var(--t-text-muted)" }}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {open && (
                <div className="animate-slide-down" style={{ backgroundColor: "var(--t-card)" }}>
                    <ul className="divide-y" style={{ borderColor: "var(--t-border-subtle)" }}>
                        {entries.map((entry) => {
                            const badge = getCategoryBadgeStyle(entry.category);
                            // Entries were previously always linked without a
                            // locale prefix, sending English readers to /blog/…
                            const prefix = locale === "en" ? "/en" : "";
                            const href =
                                entry.type === "calculator"
                                    ? `${prefix}/calculators`
                                    : `${prefix}/blog/${entry.slug}`;

                            return (
                                <li key={entry.slug}>
                                    <Link
                                        href={href}
                                        className="group/item flex items-center gap-3 px-5 py-3 transition-colors"
                                        style={{ color: "inherit" }}
                                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--t-surface)")}
                                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                                    >
                                        <time className="w-20 shrink-0 text-xs font-medium" style={{ color: "var(--t-text-muted)" }}>
                                            {entry.date}
                                        </time>
                                        <span
                                            className="shrink-0 px-1.5 py-0.5 text-[0.65rem] font-semibold leading-tight"
                                            style={{ borderRadius: "var(--r-pill)", background: badge.bg, color: badge.text }}
                                        >
                                            {entry.category}
                                        </span>
                                        <span className="truncate text-sm font-medium" style={{ color: "var(--t-text-secondary)" }}>
                                            {entry.title}
                                        </span>
                                        {entry.fallbackLocale && (
                                            <span
                                                className="ml-auto shrink-0 px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase"
                                                style={{
                                                    borderRadius: "var(--r-pill)",
                                                    border: "1px solid var(--t-border-medium)",
                                                    color: "var(--t-text-muted)",
                                                    letterSpacing: "0.04em",
                                                }}
                                            >
                                                {onlyInLabel(entry.fallbackLocale, locale)}
                                            </span>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}
