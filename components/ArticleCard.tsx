"use client";

import Link from "next/link";

export interface ArticleCardProps {
    slug: string;
    title: string;
    excerpt: string;
    date: string;
    category: string;
    thumbnailColor?: string;
}

const categoryColors: Record<string, { bg: string; text: string }> = {
    "Investing & Finance": { bg: "#dbeafe", text: "#1e40af" },
    "Personal Economy": { bg: "#d1fae5", text: "#065f46" },
    "Local Politics": { bg: "#fef3c7", text: "#92400e" },
};

export default function ArticleCard({
    slug,
    title,
    excerpt,
    date,
    category,
    thumbnailColor,
}: ArticleCardProps) {
    const tag = categoryColors[category] ?? { bg: "#dbeafe", text: "#1e40af" };

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
                        background: thumbnailColor
                            ? `linear-gradient(135deg, ${thumbnailColor}cc, ${thumbnailColor}44)`
                            : "linear-gradient(135deg, #1e40af44, #0f172a)",
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
