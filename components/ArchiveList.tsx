"use client";

import { useState } from "react";
import YearAccordion, { type ArchiveEntry } from "@/components/YearAccordion";
import { getCategoryBadgeStyle } from "@/lib/categories";

const ALL_CATEGORIES = [
    "All",
    "Investing & Finance",
    "Personal Economy",
    "Local Politics",
    "AI",
    "China",
    "Calculators",
];

function groupByYear(entries: (ArchiveEntry & { year: number })[]) {
    const years: Record<number, ArchiveEntry[]> = {};
    entries.forEach((entry) => {
        if (!years[entry.year]) years[entry.year] = [];
        years[entry.year].push(entry);
    });
    return Object.entries(years)
        .map(([y, e]) => ({ year: Number(y), entries: e }))
        .sort((a, b) => b.year - a.year);
}

export default function ArchiveList({ entries, locale = "en" }: { entries: (ArchiveEntry & { year: number })[]; locale?: string }) {
    const [activeFilter, setActiveFilter] = useState("All");

    const filtered =
        activeFilter === "All"
            ? entries
            : entries.filter((e) => e.category === activeFilter);

    const grouped = groupByYear(filtered);

    return (
        <>
            <section
                className="sticky top-[var(--nav-height)] z-30 -mx-4 px-4 py-3 sm:-mx-6 sm:px-6"
                style={{ backgroundColor: "var(--t-bg)", borderBottom: "1px solid var(--t-border-subtle)" }}
            >
                <div className="flex flex-wrap gap-2">
                    {ALL_CATEGORIES.map((cat) => {
                        const isActive = activeFilter === cat;
                        if (cat === "All") {
                            return (
                                <button
                                    key="All"
                                    onClick={() => setActiveFilter("All")}
                                    className="px-3 py-1.5 text-xs font-semibold transition-all duration-200"
                                    style={{
                                        background: isActive ? "var(--t-text)" : "var(--t-card)",
                                        color: isActive ? "var(--t-bg)" : "var(--t-text-muted)",
                                        border: `1px solid ${isActive ? "var(--t-text)" : "var(--t-border-medium)"}`,
                                        borderRadius: "var(--r-pill)",
                                    }}
                                >
                                    All
                                </button>
                            );
                        }
                        const s = getCategoryBadgeStyle(cat);
                        return (
                            <button
                                key={cat}
                                onClick={() => setActiveFilter(cat)}
                                className="px-3 py-1.5 text-xs font-semibold transition-all duration-200"
                                style={{
                                    background: isActive
                                        ? s.bg
                                        : `color-mix(in srgb, ${s.bg} 13%, var(--t-card))`,
                                    color: isActive ? s.text : s.bg,
                                    border: `1px solid color-mix(in srgb, ${s.bg} 35%, transparent)`,
                                    borderRadius: "var(--r-pill)",
                                }}
                            >
                                {cat}
                            </button>
                        );
                    })}
                </div>
            </section>

            <section className="pb-12 pt-2">
                {grouped.map((group, i) => (
                    <YearAccordion
                        key={group.year}
                        year={group.year}
                        entries={group.entries}
                        defaultOpen={i === 0}
                    />
                ))}
                {grouped.length === 0 && (
                    <div className="py-16 text-center">
                        <p className="text-sm" style={{ color: "var(--t-text-muted)" }}>
                            No entries found for this category.
                        </p>
                    </div>
                )}
            </section>
        </>
    );
}
