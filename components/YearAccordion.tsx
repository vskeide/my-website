"use client";

import { useState } from "react";
import Link from "next/link";

export interface ArchiveEntry {
    slug: string;
    title: string;
    date: string;
    category: string;
    type?: "article" | "calculator";
}

interface YearAccordionProps {
    year: number;
    entries: ArchiveEntry[];
    defaultOpen?: boolean;
}

const categoryBadge: Record<string, string> = {
    "Investing & Finance": "bg-blue-100 text-blue-800",
    "Personal Economy": "bg-emerald-100 text-emerald-800",
    "Local Politics": "bg-amber-100 text-amber-800",
    Calculators: "bg-purple-100 text-purple-800",
};

export default function YearAccordion({
    year,
    entries,
    defaultOpen = false,
}: YearAccordionProps) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div style={{ borderBottom: "1px solid var(--t-border-subtle)" }} className="last:border-b-0">
            {/* Full-width banner button */}
            <button
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between px-5 py-3.5 text-left transition-colors"
                style={{
                    backgroundColor: open ? "#1c2744" : "#0f1629",
                    color: "#f1f5f9",
                    borderRadius: 0,
                }}
                aria-expanded={open}
            >
                <div className="flex items-center gap-4">
                    <span className="text-lg font-bold tracking-tight">{year}</span>
                    <span className="text-xs font-medium" style={{ color: "#94a3b8" }}>
                        {entries.length} {entries.length === 1 ? "entry" : "entries"}
                    </span>
                </div>
                <svg
                    className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#94a3b8"
                    strokeWidth={2}
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
                            const badge =
                                categoryBadge[entry.category] ??
                                "bg-blue-100 text-blue-800";
                            const href =
                                entry.type === "calculator"
                                    ? "/calculators"
                                    : `/blog/${entry.slug}`;

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
                                            className={`shrink-0 px-1.5 py-0.5 text-[0.65rem] font-semibold leading-tight ${badge}`}
                                            style={{ borderRadius: 0 }}
                                        >
                                            {entry.category}
                                        </span>
                                        <span className="truncate text-sm font-medium" style={{ color: "var(--t-text-secondary)" }}>
                                            {entry.title}
                                        </span>
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
