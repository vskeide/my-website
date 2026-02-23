"use client";

import Link from "next/link";

export interface ArticleCardProps {
    slug: string;
    title: string;
    excerpt: string;
    date: string;
    category: string;
    imageUrl?: string;
}

import { getCategoryBadgeStyle } from "@/lib/categories";

export default function ArticleCard({
    slug,
    title,
    excerpt,
    date,
    category,
    imageUrl,
}: ArticleCardProps) {
    const tag = getCategoryBadgeStyle(category);

    return (
        <Link href={`/blog/${slug}`} className="group block h-full">
            <article
                className="h-full overflow-hidden transition-all duration-200 hover:shadow-lg"
                style={{
                    background: "var(--t-card)",
                    border: "1px solid var(--t-border-subtle)",
                    borderRadius: 0,
                }}
                onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--t-border-medium)";
                }}
                onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--t-border-subtle)";
                }}
            >
                {/* Thumbnail */}
                <div
                    className="relative h-36 w-full overflow-hidden"
                    style={{
                        background: imageUrl
                            ? `url(${imageUrl}) center/cover no-repeat var(--t-surface)`
                            : `color-mix(in srgb, ${tag.bg} 15%, var(--t-surface))`,
                    }}
                >
                    {/* Bottom fade */}
                    <div
                        className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
                    />
                    <div className="absolute bottom-3 left-3">
                        <span
                            className="inline-block px-2 py-0.5 text-xs font-semibold"
                            style={{ background: tag.bg, color: tag.text, borderRadius: 0 }}
                        >
                            {category}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    <time className="mb-1.5 block text-xs font-medium" style={{ color: "var(--t-text-muted)" }}>
                        {date}
                    </time>
                    <h3
                        className="mb-1.5 text-sm font-semibold leading-snug transition-colors group-hover:underline"
                        style={{ color: "var(--t-text)" }}
                    >
                        {title}
                    </h3>
                    <p className="line-clamp-2 text-xs leading-relaxed" style={{ color: "var(--t-text-secondary)" }}>
                        {excerpt}
                    </p>
                </div>
            </article>
        </Link>
    );
}
