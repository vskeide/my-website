"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import ArticleCard from "@/components/ArticleCard";
import CategoryFilter from "@/components/CategoryFilter";
import type { ArticleMeta } from "@/lib/articles";

interface Props {
    articles: ArticleMeta[];
    categories: string[];
    locale: string;
    initialCategory?: string | null;
}

export default function BlogList({ articles, categories, locale, initialCategory = null }: Props) {
    const [activeCategory, setActiveCategory] = useState<string | null>(initialCategory);

    const filtered = activeCategory
        ? articles.filter((a) => a.category === activeCategory)
        : articles;

    const t = useTranslations("blog");

    return (
        <>
            <section
                className="sticky top-[var(--nav-height)] z-30 -mx-4 px-4 pt-10 pb-4 sm:-mx-6 sm:px-6"
                style={{ backgroundColor: "var(--t-bg)", borderBottom: "1px solid var(--t-border-subtle)" }}
            >
                <CategoryFilter categories={categories} active={activeCategory} onSelect={setActiveCategory} locale={locale} />
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
                        <p className="text-sm" style={{ color: "var(--t-text-muted)" }}>{t("noArticles")}</p>
                    </div>
                )}
            </section>
        </>
    );
}
