"use client";

import { useState } from "react";
import YearAccordion, { type ArchiveEntry } from "@/components/YearAccordion";
import { getCategoryBadgeStyle } from "@/lib/categories";

const allCategories = [
    "All",
    "Investing & Finance",
    "Personal Economy",
    "Local Politics",
    "AI",
    "China",
    "Calculators",
];

const archiveEntries: (ArchiveEntry & { year: number })[] = [
    // 2026
    { year: 2026, slug: "ai-job-market-disruption",  title: "How AI Is Reshaping White-Collar Job Markets",        date: "Jun 1",  category: "AI" },
    { year: 2026, slug: "china-economic-slowdown",    title: "China's Economic Slowdown: What Investors Should Know", date: "May 24", category: "China" },
    { year: 2026, slug: "silver-price-analysis",      title: "Silver Price Dynamics and Jewelry Sector Margins",   date: "Feb 18", category: "Investing & Finance" },
    { year: 2026, slug: "understanding-index-funds",  title: "Understanding Index Funds: A Beginner's Guide",      date: "Feb 15", category: "Investing & Finance" },
    { year: 2026, slug: "budgeting-50-30-20-rule",    title: "The 50/30/20 Rule: Managing Your Money",             date: "Feb 8",  category: "Personal Economy" },
    { year: 2026, slug: "local-infrastructure-spending", title: "Municipal Infrastructure Budget Breakdown",       date: "Jan 29", category: "Local Politics" },
    { year: 2026, slug: "emergency-fund-strategies",  title: "How to Build an Emergency Fund That Works",          date: "Jan 20", category: "Personal Economy" },
    { year: 2026, slug: "etf-vs-mutual-funds",        title: "ETFs vs. Mutual Funds: Which to Choose?",            date: "Jan 12", category: "Investing & Finance" },
    { year: 2026, slug: "property-tax-explained",     title: "Property Tax Changes for Local Homeowners",          date: "Jan 5",  category: "Local Politics" },
    { year: 2026, slug: "compound-interest-calculator", title: "Compound Interest Calculator",                     date: "Jan 2",  category: "Calculators", type: "calculator" },
    // 2025
    { year: 2025, slug: "year-end-financial-review",  title: "How to Conduct Your Year-End Financial Review",      date: "Dec 20", category: "Personal Economy" },
    { year: 2025, slug: "dividend-investing-basics",  title: "Dividend Investing: Building Passive Income",        date: "Nov 15", category: "Investing & Finance" },
    { year: 2025, slug: "municipal-budget-transparency", title: "Grading Your Municipality on Budget Transparency", date: "Oct 30", category: "Local Politics" },
    { year: 2025, slug: "high-yield-savings",         title: "High-Yield Savings Accounts: Worth the Switch?",     date: "Sep 8",  category: "Personal Economy" },
    { year: 2025, slug: "bonds-introduction",         title: "Bonds 101: A Safe Harbor in Volatile Markets",       date: "Aug 22", category: "Investing & Finance" },
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

export default function ArchivePage() {
    const [activeFilter, setActiveFilter] = useState("All");

    const filtered =
        activeFilter === "All"
            ? archiveEntries
            : archiveEntries.filter((e) => e.category === activeFilter);

    const grouped = groupByYear(filtered);

    return (
        <main className="mx-auto max-w-[90rem] px-4 sm:px-6" style={{ paddingTop: "var(--nav-height)" }}>
            <section className="pb-4 pt-8">
                <h1 className="mb-1 text-xl font-bold tracking-tight" style={{ color: "var(--t-text)" }}>
                    Archive
                </h1>
                <p className="text-xs" style={{ color: "var(--t-text-muted)" }}>
                    Browse all articles and calculators by year and category.
                </p>
            </section>

            {/* Category filter pills — always colored */}
            <section
                className="sticky top-[var(--nav-height)] z-30 -mx-4 px-4 py-3 sm:-mx-6 sm:px-6"
                style={{ backgroundColor: "var(--t-bg)", borderBottom: "1px solid var(--t-border-subtle)" }}
            >
                <div className="flex flex-wrap gap-2">
                    {allCategories.map((cat) => {
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
                                        borderRadius: 0,
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
                                    borderRadius: 0,
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
        </main>
    );
}
