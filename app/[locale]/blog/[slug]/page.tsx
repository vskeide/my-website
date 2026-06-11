import { Link } from "@/lib/i18n-navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import ArticleLayout from "@/components/ArticleLayout";
import { silverPriceAnalysis } from "@/lib/articles/silver-price-analysis";
import { getCategoryBadgeStyle } from "@/lib/categories";
import { getArticle, getArticleWithFallback, getAllArticles } from "@/lib/articles";
import { notFound } from "next/navigation";
import DatawrapperResizer from "@/components/DatawrapperResizer";
import ArticleToggle from "@/components/ArticleToggle";
import {
    KostnadChart,
    NytteChart,
    AvgiftChart,
    AltChart,
    OyreGrid,
    Merk,
} from "@/components/articles/StadSkipCharts";

const chartArticles: Record<string, typeof silverPriceAnalysis> = {
    "silver-price-analysis": silverPriceAnalysis,
};

const baseMdxComponents = {
    p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
        <p style={{ marginBottom: "1.25rem", fontSize: "1.05rem", lineHeight: "1.72", color: "var(--t-text-secondary)", fontFamily: "var(--font-serif)" }} {...props} />
    ),
    h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h2 style={{ marginTop: "2.5rem", marginBottom: "0.75rem", fontSize: "1.25rem", fontWeight: 700, color: "var(--t-text)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }} {...props} />
    ),
    h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h3 style={{ marginTop: "2rem", marginBottom: "0.5rem", fontSize: "1.05rem", fontWeight: 700, color: "var(--t-text)", fontFamily: "var(--font-display)" }} {...props} />
    ),
    iframe: (props: React.IframeHTMLAttributes<HTMLIFrameElement>) => (
        <div style={{ margin: "3rem 0 3.5rem" }}>
            <iframe {...props} scrolling="no" style={{ display: "block", width: "100%", border: "none" }} />
        </div>
    ),
};

const stadSkipComponents = {
    ...baseMdxComponents,
    KostnadChart,
    NytteChart,
    AvgiftChart,
    AltChart,
    OyreGrid,
    Merk,
    blockquote: (props: React.HTMLAttributes<HTMLElement>) => (
        <blockquote style={{
            borderLeft: "3px solid #E05A3A",
            paddingLeft: "1.25rem",
            margin: "2rem 0",
            fontFamily: "var(--font-serif)",
            fontSize: "1.1rem",
            lineHeight: 1.6,
            color: "var(--t-text-secondary)",
            fontStyle: "italic",
        }} {...props} />
    ),
    table: (props: React.HTMLAttributes<HTMLTableElement>) => (
        <div style={{ overflowX: "auto", margin: "1.75rem 0 2rem" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem", background: "var(--t-card)", border: "1px solid var(--t-border-subtle)", borderRadius: "var(--r-panel)" }} {...props} />
        </div>
    ),
    thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
        <thead style={{ background: "var(--t-surface)" }} {...props} />
    ),
    th: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => (
        <th style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.06em", textTransform: "uppercase", textAlign: (props.align === "right" ? "right" : "left") as React.CSSProperties["textAlign"], padding: "0.6rem 0.875rem", borderBottom: "2px solid var(--t-border-strong)", color: "var(--t-text-muted)", fontWeight: 500 }} {...props} />
    ),
    td: (props: React.TdHTMLAttributes<HTMLTableCellElement>) => (
        <td style={{ padding: "0.6rem 0.875rem", borderBottom: "1px solid var(--t-border-subtle)", verticalAlign: "top", textAlign: (props.align === "right" ? "right" : "left") as React.CSSProperties["textAlign"], fontFamily: props.align === "right" ? "var(--font-mono)" : undefined, fontSize: props.align === "right" ? "0.85rem" : undefined, color: "var(--t-text-secondary)" }} {...props} />
    ),
};

function getMdxComponents(slug: string) {
    if (slug === "stad-skipstunnel") return stadSkipComponents;
    return baseMdxComponents;
}


export async function generateStaticParams() {
    const noArticles = getAllArticles("no").map((a) => ({ slug: a.slug, locale: "no" }));
    const enArticles = getAllArticles("en").map((a) => ({ slug: a.slug, locale: "en" }));
    return [...noArticles, ...enArticles];
}

export default async function ArticlePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
    const { locale, slug } = await params;

    if (chartArticles[slug]) {
        const a = chartArticles[slug];
        return <ArticleLayout title={a.title} date={a.date} category={a.category} sections={a.sections} />;
    }

    const result = getArticleWithFallback(locale, slug);
    if (!result) notFound();

    const { article, isFallback, fallbackLocale } = result;
    const badgeStyle = getCategoryBadgeStyle(article.category);
    const otherLocale = locale === "no" ? "en" : "no";
    const otherArticle = getArticle(otherLocale, slug);

    const fallbackMessage = locale === "no"
        ? "Denne artikkelen er ikkje tilgjengeleg på norsk enno. Viser engelsk versjon."
        : "This article is not yet available in English. Showing Norwegian version.";

    const components = getMdxComponents(slug);
    const mdxOptions = { mdxOptions: { remarkPlugins: [remarkGfm] } };
    const currentContent = <MDXRemote source={article.content} components={components} options={mdxOptions} />;
    const otherContent = otherArticle ? <MDXRemote source={otherArticle.content} components={components} options={mdxOptions} /> : null;

    return (
        <main className="mx-auto max-w-3xl px-4 pt-20 sm:px-6">
            <nav className="pb-4 text-xs text-text-muted">
                <Link href="/" className="transition-colors hover:text-text-secondary">{locale === "no" ? "Heim" : "Home"}</Link>
                <span className="mx-2">/</span>
                <Link href="/blog" className="transition-colors hover:text-text-secondary">{locale === "no" ? "Blogg" : "Blog"}</Link>
                <span className="mx-2">/</span>
                <span className="text-text-secondary">{article.title}</span>
            </nav>

            <header className="pb-6">
                <span className="mb-3 inline-block px-3 py-1 text-xs font-semibold" style={{ background: badgeStyle.bg, color: badgeStyle.text, borderRadius: "var(--r-pill)" }}>
                    {article.category}
                </span>
                <h1 className="mb-3 text-2xl font-bold leading-tight tracking-tight sm:text-3xl" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.025em", color: "var(--t-text)" }}>
                    {article.title}
                </h1>
                <time className="text-sm" style={{ color: "var(--t-text-muted)" }}>{article.date}</time>
            </header>

            {article.imageUrl && (
                <div className="relative mb-8 overflow-hidden" style={{ maxWidth: 720, aspectRatio: "16/7", maxHeight: 340, borderRadius: "var(--r-card)" }}>
                    <img src={article.imageUrl} alt="" className="h-full w-full object-cover" style={{ filter: "grayscale(0.3) contrast(1.02)" }} />
                    {slug === "stad-skipstunnel" && (
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(18,14,28,0.18) 0%, rgba(18,14,28,0.62) 100%)", borderRadius: "var(--r-card)" }} />
                    )}
                </div>
            )}

            <article className="pb-12">
                <ArticleToggle
                    defaultLocale={isFallback ? (fallbackLocale ?? otherLocale) : locale}
                    otherLocale={otherLocale}
                    currentContent={currentContent}
                    otherContent={otherContent}
                    isFallback={isFallback}
                    fallbackMessage={isFallback ? fallbackMessage : undefined}
                />
            </article>

            <div className="border-t border-border-subtle py-6">
                <Link href="/blog" className="inline-flex items-center gap-1.5 text-xs font-medium text-accent transition-colors hover:text-accent-hover">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    {locale === "no" ? "Attende til alle artiklar" : "Back to all articles"}
                </Link>
            </div>
            <DatawrapperResizer />
        </main>
    );
}
