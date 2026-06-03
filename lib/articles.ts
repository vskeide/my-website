import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content", "blog");

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

export function getAllArticles(): ArticleMeta[] {
    if (!fs.existsSync(CONTENT_DIR)) return [];

    const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));

    // Deduplicate by slug, preferring .mdx over .md
    const bySlug = new Map<string, string>();
    for (const f of files) {
        const slug = f.replace(/\.mdx?$/, "");
        if (!bySlug.has(slug) || f.endsWith(".mdx")) bySlug.set(slug, f);
    }

    return Array.from(bySlug.values())
        .map((filename) => {
            const slug = filename.replace(/\.mdx?$/, "");
            const raw = fs.readFileSync(path.join(CONTENT_DIR, filename), "utf-8");
            const { data } = matter(raw);
            if (!data.title) return null; // skip files without frontmatter
            return {
                slug,
                title: data.title,
                date: data.date ?? "",
                category: data.category ?? "General",
                excerpt: data.excerpt ?? "",
                imageUrl: data.imageUrl ?? "",
            };
        })
        .filter(Boolean)
        .sort((a, b) => (a!.date < b!.date ? 1 : -1)) as ArticleMeta[];
}

export function getArticle(slug: string): Article | null {
    const mdxPath = path.join(CONTENT_DIR, `${slug}.mdx`);
    const mdPath = path.join(CONTENT_DIR, `${slug}.md`);
    const filePath = fs.existsSync(mdxPath) ? mdxPath : fs.existsSync(mdPath) ? mdPath : null;

    if (!filePath) return null;

    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);

    return {
        slug,
        title: data.title ?? slug,
        date: data.date ?? "",
        category: data.category ?? "General",
        excerpt: data.excerpt ?? "",
        imageUrl: data.imageUrl ?? "",
        content,
    };
}
