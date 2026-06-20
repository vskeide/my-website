import BlogList from "@/components/BlogList";
import { getAllArticles } from "@/lib/articles";

const CATEGORIES_NO = ["Investering og finans", "Personleg økonomi", "Lokalpolitikk", "AI", "Kina"];
const CATEGORIES_EN = ["Investing & Finance", "Personal Economy", "Local Politics", "AI", "China"];

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
    const categories = locale === "no" ? CATEGORIES_NO : CATEGORIES_EN;
    const initialCategory = category && categories.includes(category) ? category : null;
    return (
        <main className="mx-auto max-w-[90rem] px-4 sm:px-6" style={{ paddingTop: "var(--nav-height)" }}>
            <BlogList articles={articles} categories={categories} locale={locale} initialCategory={initialCategory} />
        </main>
    );
}
