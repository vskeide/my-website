import ArchiveList from "@/components/ArchiveList";
import { getAllArticles } from "@/lib/articles";
import { type ArchiveEntry } from "@/components/YearAccordion";

function formatDate(iso: string): string {
    const [, month, day] = iso.split("-");
    const monthsNo = ["jan.", "feb.", "mar.", "apr.", "mai", "jun.", "jul.", "aug.", "sep.", "okt.", "nov.", "des."];
    const monthsEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return { no: monthsNo, en: monthsEn }["no"][parseInt(month, 10) - 1] + " " + parseInt(day, 10);
}

export default async function ArchivePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    const mdxEntries: (ArchiveEntry & { year: number })[] = getAllArticles(locale).map((a) => ({
        slug: a.slug,
        title: a.title,
        date: formatDate(a.date),
        category: a.category,
        year: parseInt(a.date.split("-")[0], 10),
    }));

    return (
        <main className="mx-auto max-w-[90rem] px-4 sm:px-6" style={{ paddingTop: "var(--nav-height)" }}>
            <section className="pb-4 pt-8">
                <h1 className="mb-1 text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: "var(--t-text)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>
                    {locale === "no" ? "Arkiv" : "Archive"}
                </h1>
                <p className="text-xs" style={{ color: "var(--t-text-muted)" }}>
                    {locale === "no"
                        ? "Bla gjennom alle artiklar etter år og kategori."
                        : "Browse all articles by year and category."}
                </p>
            </section>
            <ArchiveList entries={mdxEntries} locale={locale} />
        </main>
    );
}
