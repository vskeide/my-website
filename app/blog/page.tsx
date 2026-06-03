import BlogList from "@/components/BlogList";
import { getAllArticles } from "@/lib/articles";

const CATEGORIES = [
    "Investing & Finance",
    "Personal Economy",
    "Local Politics",
    "AI",
    "China",
];

export default function BlogPage() {
    const articles = getAllArticles();
    return (
        <main className="mx-auto max-w-[90rem] px-4 sm:px-6" style={{ paddingTop: "var(--nav-height)" }}>
            <BlogList articles={articles} categories={CATEGORIES} />
        </main>
    );
}
