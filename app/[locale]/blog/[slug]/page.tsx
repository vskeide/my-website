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
    DødsfallChart,
    Merk,
} from "@/components/articles/StadSkipCharts";
import * as StadScroll from "@/components/articles/StadScroll";

function cellText(node: React.ReactNode): string {
    if (typeof node === "string" || typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(cellText).join("");
    if (node && typeof node === "object" && "props" in node)
        return cellText((node as { props: { children?: React.ReactNode } }).props.children);
    return "";
}

function numColor(text: string): string | undefined {
    const t = text.trim();
    if (t.startsWith("−") || t.startsWith("-")) return "#E05A3A";
    if (t.startsWith("+")) return "#00B050";
    if (/^(Sterkt negativ|Negativ|Klart ul|Ekstremt ul)/i.test(t)) return "#E05A3A";
    if (/^(Svært h|^Høg$)/i.test(t)) return "#00B050";
    if (/^(Låg|Svært låg|Låg–)/i.test(t)) return "#938AA6";
    if (/^(Aldri statleg|Ikkje rekna)/i.test(t)) return "var(--t-text-muted)";
    return undefined;
}

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
    DødsfallChart,
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
        <div style={{ margin: "1.75rem 0 2rem", borderRadius: "var(--r-panel)", border: "1px solid var(--t-border-subtle)", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem", background: "var(--t-card)", tableLayout: "auto" }} {...props} />
            </div>
        </div>
    ),
    thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
        <thead style={{ background: "var(--t-surface)" }} {...props} />
    ),
    th: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => {
        const { style: inStyle, ...rest } = props;
        return (
            <th
                {...rest}
                style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.7rem",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    textAlign: "left",   // default; overridden by inStyle
                    padding: "0.65rem 1rem",
                    borderBottom: "2px solid var(--t-border-strong)",
                    color: "var(--t-text-muted)",
                    fontWeight: 500,
                    ...inStyle,          // picks up textAlign from remark-gfm
                    whiteSpace: "nowrap" // always last — cannot be overridden
                }}
            />
        );
    },
    td: (props: React.TdHTMLAttributes<HTMLTableCellElement>) => {
        const { style: inStyle, ...rest } = props;
        const isRight = (inStyle as React.CSSProperties | undefined)?.textAlign === "right";
        const text = cellText(props.children);
        const color = numColor(text) ?? (isRight ? "var(--t-text)" : "var(--t-text-secondary)");
        const isBold = !!numColor(text);
        return (
            <td
                {...rest}
                style={{
                    padding: "0.65rem 1rem",
                    borderBottom: "1px solid var(--t-border-subtle)",
                    verticalAlign: "top",
                    textAlign: "left",   // default; overridden by inStyle
                    fontFamily: isRight ? "var(--font-mono)" : undefined,
                    fontSize: isRight ? "0.85rem" : "0.9rem",
                    lineHeight: 1.5,
                    ...inStyle,          // picks up textAlign from remark-gfm
                    color,               // always our color
                    fontWeight: isBold ? 600 : undefined,
                }}
            />
        );
    },
    a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
        <a style={{ color: "var(--ch-accent)", textDecoration: "underline", textUnderlineOffset: "3px" }} target={props.href?.startsWith("http") ? "_blank" : undefined} rel={props.href?.startsWith("http") ? "noopener noreferrer" : undefined} {...props} />
    ),
    ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
        <ul style={{ margin: "0.5rem 0 1.25rem 1.25rem", listStyleType: "disc", color: "var(--t-text-secondary)", fontSize: "0.95rem", lineHeight: 1.7 }} {...props} />
    ),
    li: (props: React.HTMLAttributes<HTMLLIElement>) => (
        <li style={{ marginBottom: "0.4rem" }} {...props} />
    ),
    em: (props: React.HTMLAttributes<HTMLElement>) => (
        <em style={{ color: "var(--t-text)", fontStyle: "italic", fontWeight: 700 }} {...props} />
    ),
};

// Same rich components as the inline version, but charts become sticky-rail
// anchors handled by ScrollytellingArticle. Tables stay inline.
const stadScrollComponents = {
    ...stadSkipComponents,
    KostnadChart: StadScroll.KostnadChart,
    NytteChart: StadScroll.NytteChart,
    AvgiftChart: StadScroll.AvgiftChart,
    AltChart: StadScroll.AltChart,
    OyreGrid: StadScroll.OyreGrid,
    DødsfallChart: StadScroll.DødsfallChart,
};

function getMdxComponents(slug: string) {
    if (slug === "stad-skipstunnel") return stadScrollComponents;
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

    const isScroll = slug === "stad-skipstunnel";
    const components = getMdxComponents(slug);
    const mdxOptions = { mdxOptions: { remarkPlugins: [remarkGfm] } };
    const currentContent = <MDXRemote source={article.content} components={components} options={mdxOptions} />;
    const otherContent = otherArticle ? <MDXRemote source={otherArticle.content} components={components} options={mdxOptions} /> : null;

    return (
        <main className={isScroll ? "mx-auto max-w-[90rem] px-4 pt-20 sm:px-6" : "mx-auto max-w-3xl px-4 pt-20 sm:px-6"}>
            <nav className="pb-4 text-xs text-text-muted">
                <Link href="/" className="transition-colors hover:text-text-secondary">{locale === "no" ? "Heim" : "Home"}</Link>
                <span className="mx-2">/</span>
                <Link href="/blog" className="transition-colors hover:text-text-secondary">{locale === "no" ? "Blogg" : "Blog"}</Link>
                <span className="mx-2">/</span>
                <span className="text-text-secondary">{article.title}</span>
            </nav>

            <header className="pb-6" style={isScroll ? { maxWidth: 640 } : undefined}>
                <span className="mb-3 inline-block px-3 py-1 text-xs font-semibold" style={{ background: badgeStyle.bg, color: badgeStyle.text, borderRadius: "var(--r-pill)" }}>
                    {article.category}
                </span>
                <h1 className="mb-3 text-2xl font-bold leading-tight tracking-tight sm:text-3xl" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.025em", color: "var(--t-text)" }}>
                    {article.title}
                </h1>
                <time className="text-sm" style={{ color: "var(--t-text-muted)" }}>{article.date}</time>
            </header>

            {article.imageUrl && (
                <div className="relative mb-8 overflow-hidden" style={{ maxWidth: isScroll ? 640 : 720, aspectRatio: "16/7", maxHeight: isScroll ? 300 : 340, borderRadius: "var(--r-card)" }}>
                    <img src={article.imageUrl} alt="" className="h-full w-full object-cover" style={{ filter: "grayscale(0.3) contrast(1.02)" }} />
                    {slug === "stad-skipstunnel" && (
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(18,14,28,0.18) 0%, rgba(18,14,28,0.62) 100%)", borderRadius: "var(--r-card)" }} />
                    )}
                </div>
            )}

            <article className="pb-12">
                {isScroll ? (
                    <StadScroll.ScrollytellingArticle>{currentContent}</StadScroll.ScrollytellingArticle>
                ) : (
                    <ArticleToggle
                        defaultLocale={isFallback ? (fallbackLocale ?? otherLocale) : locale}
                        otherLocale={otherLocale}
                        currentContent={currentContent}
                        otherContent={otherContent}
                        isFallback={isFallback}
                        fallbackMessage={isFallback ? fallbackMessage : undefined}
                    />
                )}
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
