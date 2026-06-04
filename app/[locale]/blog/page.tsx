import BlogList from "@/components/BlogList";
import { getAllArticles } from "@/lib/articles";

const CATEGORIES_NO = ["Investering og finans", "Personlig økonomi", "Lokalpolitikk", "AI", "Kina"];
const CATEGORIES_EN = ["Investing & Finance", "Personal Economy", "Local Politics", "AI", "China"];

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const articles = getAllArticles(locale);
    const categories = locale === "no" ? CATEGORIES_NO : CATEGORIES_EN;
    return (
        <main className="mx-auto max-w-[90rem] px-4 sm:px-6" style={{ paddingTop: "var(--nav-height)" }}>
            <BlogList articles={articles} categories={categories} locale={locale} />
        </main>
    );
}
