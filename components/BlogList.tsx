"use client";

import { useState } from "react";
import ArticleCard from "@/components/ArticleCard";
import CategoryFilter from "@/components/CategoryFilter";
import type { ArticleMeta } from "@/lib/articles";

interface Props {
    articles: ArticleMeta[];
    categories: string[];
    locale: string;
}

export default function BlogList({ articles, categories, locale }: Props) {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const filtered = activeCategory
        ? articles.filter((a) => a.category === activeCategory)
        : articles;

    const noArticlesText = locale === "no"
        ? "Ingen artikler funnet i denne kategorien ennå."
        : "No articles found in this category yet.";

    return (
        <>
            <section
                className="sticky top-[var(--nav-height)] z-30 -mx-4 px-4 pt-10 pb-4 sm:-mx-6 sm:px-6"
                style={{ backgroundColor: "var(--t-bg)", borderBottom: "1px solid var(--t-border-subtle)" }}
            >
                <CategoryFilter categories={categories} active={activeCategory} onSelect={setActiveCategory} />
            </section>

            <section className="pb-12 pt-4">
                <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((article) => (
                        <div key={article.slug} className="animate-fade-in-up">
                            <ArticleCard {...article} locale={locale} />
                        </div>
                    ))}
                </div>
                {filtered.length === 0 && (
                    <div className="py-16 text-center">
                        <p className="text-sm" style={{ color: "var(--t-text-muted)" }}>{noArticlesText}</p>
                    </div>
                )}
            </section>
        </>
    );
}
