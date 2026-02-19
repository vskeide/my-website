import Link from "next/link";

export interface ArticleCardProps {
    slug: string;
    title: string;
    excerpt: string;
    date: string;
    category: string;
    thumbnailColor?: string;
}

const categoryColors: Record<string, string> = {
    "Investing & Finance": "bg-accent/15 text-accent-hover",
    "Personal Economy": "bg-emerald-500/15 text-emerald-400",
    "Local Politics": "bg-accent-amber/15 text-accent-amber",
};

export default function ArticleCard({
    slug,
    title,
    excerpt,
    date,
    category,
    thumbnailColor,
}: ArticleCardProps) {
    const tagStyle =
        categoryColors[category] ?? "bg-accent/15 text-accent-hover";

    return (
        <Link href={`/blog/${slug}`} className="group block">
            <article className="card-glow h-full overflow-hidden rounded-xl border border-border-subtle bg-surface-card transition-all duration-300 hover:border-border-medium hover:bg-surface-card-hover hover:shadow-xl hover:shadow-black/20">
                {/* Thumbnail placeholder */}
                <div
                    className="relative h-36 w-full overflow-hidden"
                    style={{
                        background: thumbnailColor
                            ? `linear-gradient(135deg, ${thumbnailColor}, var(--navy-700))`
                            : "linear-gradient(135deg, var(--accent-blue-muted), var(--navy-700))",
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-card/80 to-transparent" />
                    <div className="absolute bottom-3 left-3">
                        <span
                            className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${tagStyle}`}
                        >
                            {category}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    <time className="mb-1.5 block text-xs font-medium text-text-muted">
                        {date}
                    </time>
                    <h3 className="mb-1.5 text-sm font-semibold leading-snug text-text-primary transition-colors group-hover:text-accent">
                        {title}
                    </h3>
                    <p className="line-clamp-2 text-xs leading-relaxed text-text-secondary">
                        {excerpt}
                    </p>
                </div>
            </article>
        </Link>
    );
}
