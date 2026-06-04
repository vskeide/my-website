import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface ArticleMeta {
    slug: string;
    title: string;
    date: string;
    category: string;
    excerpt: string;
    imageUrl: string;
}

export interface Article extends ArticleMeta {
    content: string;
}

function contentDir(locale: string) {
    return path.join(process.cwd(), "content", locale);
}

export function getAllArticles(locale = "en"): ArticleMeta[] {
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
            };
        })
        .filter(Boolean)
        .sort((a, b) => (a!.date < b!.date ? 1 : -1)) as ArticleMeta[];
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
