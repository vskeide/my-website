import { Link } from "@/lib/i18n-navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import ArticleLayout from "@/components/ArticleLayout";
import { silverPriceAnalysis } from "@/lib/articles/silver-price-analysis";
import { getCategoryBadgeStyle } from "@/lib/categories";
import { getArticle, getArticleWithFallback, getAllArticles } from "@/lib/articles";
import { notFound } from "next/navigation";
import DatawrapperResizer from "@/components/DatawrapperResizer";
import ArticleToggle from "@/components/ArticleToggle";

const chartArticles: Record<string, typeof silverPriceAnalysis> = {
    "silver-price-analysis": silverPriceAnalysis,
};

const mdxComponents = {
    p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
        <p style={{ marginBottom: "1.25rem", fontSize: "0.875rem", lineHeight: "1.75", color: "var(--t-text-secondary)" }} {...props} />
    ),
    h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h2 style={{ marginTop: "2.5rem", marginBottom: "0.75rem", fontSize: "1.1rem", fontWeight: 700, color: "var(--t-text)" }} {...props} />
    ),
    h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h3 style={{ marginTop: "2rem", marginBottom: "0.5rem", fontSize: "0.95rem", fontWeight: 700, color: "var(--t-text)" }} {...props} />
    ),
    iframe: (props: React.IframeHTMLAttributes<HTMLIFrameElement>) => (
        <div style={{ margin: "3rem 0 3.5rem" }}>
            <iframe {...props} scrolling="no" style={{ display: "block", width: "100%", border: "none" }} />
        </div>
    ),
};

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
        ? "Denne artikkelen er ikke tilgjengelig på norsk ennå. Viser engelsk versjon."
        : "This article is not yet available in English. Showing Norwegian version.";

    const currentContent = <MDXRemote source={article.content} components={mdxComponents} />;
    const otherContent = otherArticle ? <MDXRemote source={otherArticle.content} components={mdxComponents} /> : null;

    return (
        <main className="mx-auto max-w-3xl px-4 pt-20 sm:px-6">
            <nav className="pb-4 text-xs text-text-muted">
                <Link href="/" className="transition-colors hover:text-text-secondary">{locale === "no" ? "Hjem" : "Home"}</Link>
                <span className="mx-2">/</span>
                <Link href="/blog" className="transition-colors hover:text-text-secondary">{locale === "no" ? "Blogg" : "Blog"}</Link>
                <span className="mx-2">/</span>
                <span className="text-text-secondary">{article.title}</span>
            </nav>

            <header className="pb-6">
                <span className="mb-3 inline-block px-2 py-0.5 text-xs font-semibold" style={{ background: badgeStyle.bg, color: badgeStyle.text, borderRadius: 0 }}>
                    {article.category}
                </span>
                <h1 className="mb-3 text-2xl font-bold leading-tight tracking-tight text-text-primary sm:text-3xl">
                    {article.title}
                </h1>
                <time className="text-sm text-text-muted">{article.date}</time>
            </header>

            {article.imageUrl && (
                <div className="mb-8 h-64 w-full overflow-hidden sm:h-80" style={{ background: `url(${article.imageUrl}) center/cover no-repeat` }} />
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
                    {locale === "no" ? "Tilbake til alle artikler" : "Back to all articles"}
                </Link>
            </div>
            <DatawrapperResizer />
        </main>
    );
}
