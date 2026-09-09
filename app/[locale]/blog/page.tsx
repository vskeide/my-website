import BlogList from "@/components/BlogList";
import { getArticlesForLocale } from "@/lib/articles";
import { categoriesForLocale } from "@/lib/categories";

export default async function BlogPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ category?: string }>;
}) {
    const { locale } = await params;
    const { category } = await searchParams;
    const articles = getArticlesForLocale(locale);
    // Full vocabulary, not just what is published — a category with no articles
    // still gets a chip (it renders the empty state).
    const categories = categoriesForLocale(locale, articles.map((a) => a.category));
    const initialCategory = category && categories.includes(category) ? category : null;
    return (
        <main className="mx-auto max-w-[90rem] px-4 sm:px-6" style={{ paddingTop: "var(--nav-height)" }}>
            <BlogList articles={articles} categories={categories} locale={locale} initialCategory={initialCategory} />
        </main>
    );
}
