"use client";

import { useState } from "react";
import YearAccordion, { type ArchiveEntry } from "@/components/YearAccordion";

const allCategories = [
    "All",
    "Investing & Finance",
    "Personal Economy",
    "Local Politics",
    "Calculators",
];

const archiveEntries: (ArchiveEntry & { year: number })[] = [
    // 2026
    { year: 2026, slug: "silver-price-analysis", title: "Silver Price Dynamics and Jewelry Sector Margins", date: "Feb 18", category: "Investing & Finance" },
    { year: 2026, slug: "understanding-index-funds", title: "Understanding Index Funds: A Beginner's Guide", date: "Feb 15", category: "Investing & Finance" },
    { year: 2026, slug: "budgeting-50-30-20-rule", title: "The 50/30/20 Rule: Managing Your Money", date: "Feb 8", category: "Personal Economy" },
    { year: 2026, slug: "local-infrastructure-spending", title: "Municipal Infrastructure Budget Breakdown", date: "Jan 29", category: "Local Politics" },
    { year: 2026, slug: "emergency-fund-strategies", title: "How to Build an Emergency Fund That Works", date: "Jan 20", category: "Personal Economy" },
    { year: 2026, slug: "etf-vs-mutual-funds", title: "ETFs vs. Mutual Funds: Which to Choose?", date: "Jan 12", category: "Investing & Finance" },
    { year: 2026, slug: "property-tax-explained", title: "Property Tax Changes for Local Homeowners", date: "Jan 5", category: "Local Politics" },
    { year: 2026, slug: "compound-interest-calculator", title: "Compound Interest Calculator", date: "Jan 2", category: "Calculators", type: "calculator" },
    // 2025
    { year: 2025, slug: "year-end-financial-review", title: "How to Conduct Your Year-End Financial Review", date: "Dec 20", category: "Personal Economy" },
    { year: 2025, slug: "dividend-investing-basics", title: "Dividend Investing: Building Passive Income", date: "Nov 15", category: "Investing & Finance" },
    { year: 2025, slug: "municipal-budget-transparency", title: "Grading Your Municipality on Budget Transparency", date: "Oct 30", category: "Local Politics" },
    { year: 2025, slug: "high-yield-savings", title: "High-Yield Savings Accounts: Worth the Switch?", date: "Sep 8", category: "Personal Economy" },
    { year: 2025, slug: "bonds-introduction", title: "Bonds 101: A Safe Harbor in Volatile Markets", date: "Aug 22", category: "Investing & Finance" },
];

// Group by explicit year field — no index-based heuristics
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

export default function ArchivePage() {
    const [activeFilter, setActiveFilter] = useState("All");

    const filtered =
        activeFilter === "All"
            ? archiveEntries
            : archiveEntries.filter((e) => e.category === activeFilter);

    const grouped = groupByYear(filtered);

    return (
        <main className="mx-auto max-w-[90rem] px-4 sm:px-6" style={{ paddingTop: "var(--nav-height)" }}>
            {/* Header */}
            <section className="pb-4 pt-8">
                <h1 className="mb-1 text-xl font-bold tracking-tight" style={{ color: "var(--t-text)" }}>
                    Archive
                </h1>
                <p className="text-xs" style={{ color: "var(--t-text-muted)" }}>
                    Browse all articles and calculators by year and category.
                </p>
            </section>

            {/* Section jump buttons */}
            <section
                className="sticky top-[var(--nav-height)] z-30 -mx-4 px-4 py-3 sm:-mx-6 sm:px-6"
                style={{ backgroundColor: "var(--t-bg)", borderBottom: "1px solid var(--t-border-subtle)" }}
            >
                <div className="flex flex-wrap gap-2">
                    {allCategories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveFilter(cat)}
                            className="px-3 py-1.5 text-xs font-semibold transition-all duration-200"
                            style={{
                                background: activeFilter === cat ? "var(--ch-accent)" : "var(--t-card)",
                                color: activeFilter === cat ? "#ffffff" : "var(--t-text-secondary)",
                                border: `1px solid ${activeFilter === cat ? "var(--ch-accent)" : "var(--t-border-subtle)"}`,
                                borderRadius: 0,
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </section>

            {/* Year accordions */}
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
        </main>
    );
}
