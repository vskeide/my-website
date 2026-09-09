import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { localizeCategory } from "./categories";

export interface ArticleMeta {
    slug: string;
    title: string;
    date: string;
    category: string;
    excerpt: string;
    imageUrl: string;
    /** true = kept in the repo but not listed anywhere on the site */
    draft: boolean;
    /**
     * Set when this article has no version in the locale being viewed, so the
     * metadata here comes from the other locale. Listings show it anyway, with
     * a "Norwegian only" marker.
     */
    fallbackLocale?: string;
}

export interface Article extends ArticleMeta {
    content: string;
}

function contentDir(locale: string) {
    return path.join(process.cwd(), "content", locale);
}

/**
 * All articles for a locale, newest first.
 * Drafts (frontmatter `draft: true`) are excluded unless `includeDrafts` is set —
 * they stay in the repo as templates but never appear in a listing.
 */
export function getAllArticles(
    locale = "en",
    { includeDrafts = false }: { includeDrafts?: boolean } = {}
): ArticleMeta[] {
    const dir = contentDir(locale);
    if (!fs.existsSync(dir)) return [];

    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));

    // Deduplicate by slug, preferring .mdx
    const bySlug = new Map<string, string>();
    for (const f of files) {
        const slug = f.replace(/\.mdx?$/, "");
        if (!bySlug.has(slug) || f.endsWith(".mdx")) bySlug.set(slug, f);
    }

    return Array.from(bySlug.values())
        .map((filename) => {
            const slug = filename.replace(/\.mdx?$/, "");
            const raw = fs.readFileSync(path.join(dir, filename), "utf-8");
            const { data } = matter(raw);
            if (!data.title) return null;
            return {
                slug,
                title: data.title as string,
                date: (data.date as string) ?? "",
                category: (data.category as string) ?? "General",
                excerpt: (data.excerpt as string) ?? "",
                imageUrl: (data.imageUrl as string) ?? "",
                draft: data.draft === true,
            };
        })
        .filter((a): a is ArticleMeta => a !== null && (includeDrafts || !a.draft))
        .sort((a, b) => (a.date < b.date ? 1 : -1));
}

const OTHER_LOCALE: Record<string, string> = { no: "en", en: "no" };

/**
 * Every article a locale should LIST: its own, plus any that exist only in the
 * other language, tagged with `fallbackLocale` so the UI can mark them.
 *
 * Use this for listings. `getAllArticles` alone hides single-language articles
 * from the locale they were not written in, which is how `stad-skipstunnel`
 * (Nynorsk-only) went missing from the English blog.
 */
export function getArticlesForLocale(
    locale = "en",
    opts: { includeDrafts?: boolean } = {}
): ArticleMeta[] {
    const own = getAllArticles(locale, opts);
    const other = OTHER_LOCALE[locale];
    if (!other) return own;

    const haveSlugs = new Set(own.map((a) => a.slug));
    const onlyInOther = getAllArticles(other, opts)
        .filter((a) => !haveSlugs.has(a.slug))
        // Re-label the category into this locale's wording, so it collapses
        // onto the existing chip instead of adding a duplicate.
        .map((a) => ({ ...a, category: localizeCategory(a.category, locale), fallbackLocale: other }));

    return [...own, ...onlyInOther].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getArticle(locale: string, slug: string): Article | null {
    const dir = contentDir(locale);
    const mdxPath = path.join(dir, `${slug}.mdx`);
    const mdPath = path.join(dir, `${slug}.md`);
    const filePath = fs.existsSync(mdxPath) ? mdxPath : fs.existsSync(mdPath) ? mdPath : null;

    if (!filePath) return null;

    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);

    return {
        slug,
        title: (data.title as string) ?? slug,
        date: (data.date as string) ?? "",
        category: (data.category as string) ?? "General",
        excerpt: (data.excerpt as string) ?? "",
        imageUrl: (data.imageUrl as string) ?? "",
        draft: data.draft === true,
        content,
    };
}

/** Returns the article for the requested locale, falling back to the other locale. */
export function getArticleWithFallback(
    locale: string,
    slug: string
): { article: Article; isFallback: boolean; fallbackLocale?: string } | null {
    const article = getArticle(locale, slug);
    if (article) return { article, isFallback: false };

    const fallback = locale === "no" ? "en" : "no";
    const fallbackArticle = getArticle(fallback, slug);
    if (fallbackArticle) return { article: fallbackArticle, isFallback: true, fallbackLocale: fallback };

    return null;
}
