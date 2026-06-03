import ArchiveList from "@/components/ArchiveList";
import { getAllArticles } from "@/lib/articles";
import { type ArchiveEntry } from "@/components/YearAccordion";

// Entries that don't have MDX files (historical articles, calculators)
const staticEntries: (ArchiveEntry & { year: number })[] = [
    { year: 2026, slug: "compound-interest-calculator", title: "Compound Interest Calculator",                     date: "Jan 2",  category: "Calculators", type: "calculator" },
    { year: 2025, slug: "year-end-financial-review",    title: "How to Conduct Your Year-End Financial Review",    date: "Dec 20", category: "Personal Economy" },
    { year: 2025, slug: "dividend-investing-basics",    title: "Dividend Investing: Building Passive Income",      date: "Nov 15", category: "Investing & Finance" },
    { year: 2025, slug: "municipal-budget-transparency", title: "Grading Your Municipality on Budget Transparency", date: "Oct 30", category: "Local Politics" },
    { year: 2025, slug: "high-yield-savings",           title: "High-Yield Savings Accounts: Worth the Switch?",   date: "Sep 8",  category: "Personal Economy" },
    { year: 2025, slug: "bonds-introduction",           title: "Bonds 101: A Safe Harbor in Volatile Markets",     date: "Aug 22", category: "Investing & Finance" },
];

function formatDate(iso: string): string {
    const [, month, day] = iso.split("-");
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}`;
}

export default function ArchivePage() {
    const mdxEntries: (ArchiveEntry & { year: number })[] = getAllArticles().map((a) => ({
        slug: a.slug,
        title: a.title,
        date: formatDate(a.date),
        category: a.category,
        year: parseInt(a.date.split("-")[0], 10),
    }));

    // MDX articles take precedence; static entries fill in the rest
    const mdxSlugs = new Set(mdxEntries.map((e) => e.slug));
    const merged = [
        ...mdxEntries,
        ...staticEntries.filter((e) => !mdxSlugs.has(e.slug)),
    ];

    return (
        <main className="mx-auto max-w-[90rem] px-4 sm:px-6" style={{ paddingTop: "var(--nav-height)" }}>
            <section className="pb-4 pt-8">
                <h1 className="mb-1 text-xl font-bold tracking-tight" style={{ color: "var(--t-text)" }}>
                    Archive
                </h1>
                <p className="text-xs" style={{ color: "var(--t-text-muted)" }}>
                    Browse all articles and calculators by year and category.
                </p>
            </section>
            <ArchiveList entries={merged} />
        </main>
    );
}
