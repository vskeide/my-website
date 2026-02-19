"use client";

import { useState } from "react";
import ArticleCard from "@/components/ArticleCard";
import CategoryFilter from "@/components/CategoryFilter";

const categories = [
    "Investing & Finance",
    "Personal Economy",
    "Local Politics",
];

const articles = [
    {
        slug: "silver-price-analysis",
        title: "Silver Price Dynamics and Jewelry Sector Margins",
        excerpt:
            "An analysis of silver spot price movements and their impact on jewelry sector profitability, cost structures, and margin correlations.",
        date: "Feb 18, 2026",
        category: "Investing & Finance",
        thumbnailColor: "#6366f1",
    },
    {
        slug: "understanding-index-funds",
        title: "Understanding Index Funds: A Beginner's Guide to Passive Investing",
        excerpt:
            "Index funds have transformed how ordinary people build wealth. Here's what you need to know before you start investing passively.",
        date: "Feb 15, 2026",
        category: "Investing & Finance",
        thumbnailColor: "#2563eb",
    },
    {
        slug: "budgeting-50-30-20-rule",
        title: "The 50/30/20 Rule: A Simple Framework for Managing Your Money",
        excerpt:
            "Not sure where your money is going? This budgeting framework makes it easy to allocate your income effectively.",
        date: "Feb 8, 2026",
        category: "Personal Economy",
        thumbnailColor: "#059669",
    },
    {
        slug: "local-infrastructure-spending",
        title: "Where Does Your Municipality Spend Its Infrastructure Budget?",
        excerpt:
            "A breakdown of local government spending priorities and how they affect your daily life and property values.",
        date: "Jan 29, 2026",
        category: "Local Politics",
        thumbnailColor: "#d97706",
    },
    {
        slug: "emergency-fund-strategies",
        title: "How to Build an Emergency Fund That Actually Works",
        excerpt:
            "Most advice on emergency funds is too generic. Here's a practical, tiered approach tailored to your financial situation.",
        date: "Jan 20, 2026",
        category: "Personal Economy",
        thumbnailColor: "#059669",
    },
    {
        slug: "etf-vs-mutual-funds",
        title: "ETFs vs. Mutual Funds: Which One Should You Choose?",
        excerpt:
            "Both options have their merits, but the right choice depends on your goals, timeline, and how actively you want to manage your portfolio.",
        date: "Jan 12, 2026",
        category: "Investing & Finance",
        thumbnailColor: "#2563eb",
    },
    {
        slug: "property-tax-explained",
        title: "Property Tax Changes: What They Mean for Local Homeowners",
        excerpt:
            "Recent changes to property tax assessments could impact your annual costs. Here's a clear breakdown of the new policy.",
        date: "Jan 5, 2026",
        category: "Local Politics",
        thumbnailColor: "#d97706",
    },
];

export default function BlogPage() {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const filtered = activeCategory
        ? articles.filter((a) => a.category === activeCategory)
        : articles;

    return (
        <main className="mx-auto max-w-6xl px-4 sm:px-6">
            {/* Category filters */}
            <section className="sticky top-[var(--nav-height)] z-30 -mx-4 bg-navy-950/90 px-4 pt-10 pb-4 backdrop-blur-xl sm:-mx-6 sm:px-6">
                <CategoryFilter
                    categories={categories}
                    active={activeCategory}
                    onSelect={setActiveCategory}
                />
            </section>

            {/* Articles grid */}
            <section className="pb-12">
                <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((article) => (
                        <div key={article.slug} className="animate-fade-in-up">
                            <ArticleCard {...article} />
                        </div>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div className="py-16 text-center">
                        <p className="text-sm text-text-muted">
                            No articles found in this category yet.
                        </p>
                    </div>
                )}
            </section>
        </main>
    );
}
