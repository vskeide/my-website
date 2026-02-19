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
    "Investing & Finance": "bg-accent/15 text-accent-hover",
    "Personal Economy": "bg-emerald-500/15 text-emerald-400",
    "Local Politics": "bg-accent-amber/15 text-accent-amber",
    Calculators: "bg-purple-500/15 text-purple-400",
};

export default function YearAccordion({
    year,
    entries,
    defaultOpen = false,
}: YearAccordionProps) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-border-subtle last:border-b-0">
            <button
                onClick={() => setOpen(!open)}
                className="group flex w-full items-center justify-between py-3 text-left transition-colors hover:bg-white/[0.02] px-2 rounded-lg"
                aria-expanded={open}
            >
                <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-text-primary">{year}</span>
                    <span className="text-xs font-medium text-text-muted">
                        {entries.length} {entries.length === 1 ? "entry" : "entries"}
                    </span>
                </div>
                <svg
                    className={`h-4 w-4 text-text-muted transition-transform duration-300 ${open ? "rotate-180" : ""
                        }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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
                <div className="animate-slide-down pb-3">
                    <ul className="space-y-0.5">
                        {entries.map((entry) => {
                            const badge =
                                categoryBadge[entry.category] ??
                                "bg-accent/15 text-accent-hover";
                            const href =
                                entry.type === "calculator"
                                    ? "/calculators"
                                    : `/blog/${entry.slug}`;

                            return (
                                <li key={entry.slug}>
                                    <Link
                                        href={href}
                                        className="group/item flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-white/[0.03]"
                                    >
                                        <time className="w-20 shrink-0 text-xs font-medium text-text-muted">
                                            {entry.date}
                                        </time>
                                        <span
                                            className={`shrink-0 rounded px-1.5 py-0.5 text-[0.65rem] font-semibold leading-tight ${badge}`}
                                        >
                                            {entry.category}
                                        </span>
                                        <span className="truncate text-sm font-medium text-text-secondary transition-colors group-hover/item:text-text-primary">
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
