import BlogList from "@/components/BlogList";
import { getAllArticles } from "@/lib/articles";

export default async function BlogPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ category?: string }>;
}) {
    const { locale } = await params;
    const { category } = await searchParams;
    const articles = getAllArticles(locale);
    // Derived from what is actually published, so no empty filter chips appear.
    const categories = [...new Set(articles.map((a) => a.category))];
    const initialCategory = category && categories.includes(category) ? category : null;
    return (
        <main className="mx-auto max-w-[90rem] px-4 sm:px-6" style={{ paddingTop: "var(--nav-height)" }}>
            <BlogList articles={articles} categories={categories} locale={locale} initialCategory={initialCategory} />
        </main>
    );
}
