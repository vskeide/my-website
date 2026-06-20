import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n-navigation";
import ArticleCard from "@/components/ArticleCard";
import { getAllArticles } from "@/lib/articles";
import { getCategoryBadgeStyle } from "@/lib/categories";

const calculators = [
    {
        id: "kpi",
        titleNo: "Personleg KPI-kalkulator",
        titleEn: "Personal CPI Calculator",
        descNo: "Vekt SSBs konsumprisindeks med di eiga forbrukskurv og sjå korleis di personlege inflasjon og kjøpekraft utviklar seg.",
        descEn: "Weight Statistics Norway's CPI with your own consumption basket to see how your personal inflation and purchasing power evolve.",
        gradient: "linear-gradient(140deg, #8B3DD0 0%, #8B3DD0CC 100%)",
        accentColor: "#c084fc",
        labelNo: "Inflasjon",
        labelEn: "Inflation",
        stat: "SSB",
        statLabel: "live KPI-data",
        imageUrl: "/images/articles/kpi.png",
    },
    {
        id: "voldabadet",
        titleNo: "Voldabadet — Kostnadsanalyse",
        titleEn: "Voldabadet — Cost Analysis",
        descNo: "Kva kostar symjeanlegget kvar innbyggar? Interaktiv kalkulator med justérbare føresetnader og subsidieanalyse.",
        descEn: "What does the swimming facility cost per resident? Interactive calculator with adjustable assumptions and subsidy analysis.",
        gradient: "linear-gradient(140deg, #0070C0 0%, #0070C0CC 100%)",
        accentColor: "#38bdf8",
        labelNo: "Kommuneøkonomi",
        labelEn: "Municipal",
        stat: "230M",
        statLabel: "MNOK investment",
        imageUrl: "/images/articles/voldabadet.png",
    },
    {
        id: "norgespris",
        titleNo: "Norgespris vs. Spotpris",
        titleEn: "Norgespris vs. Spot Price",
        descNo: "Lønner fastpristilbodet 'Norgespris' seg kontra tradisjonell spotpris og strømstøtte?",
        descEn: "Does the fixed-price offer 'Norgespris' pay off compared to traditional spot price and electricity subsidies?",
        gradient: "linear-gradient(140deg, #FFC000 0%, #FFC000CC 100%)",
        accentColor: "#fbbf24",
        labelNo: "Energi",
        labelEn: "Energy",
        stat: "35k",
        statLabel: "kWh / year",
        imageUrl: "/images/articles/noregespris.png",
    },
    {
        id: "sparing",
        titleNo: "Investeringskalkulator",
        titleEn: "Investment Calculator",
        descNo: "Sjå korleis startkapital, årlege innskot, gebyr og inflasjon formar det du faktisk sit att med.",
        descEn: "See how starting capital, annual contributions, fees, and inflation shape what you actually end up with.",
        gradient: "linear-gradient(140deg, #00B050 0%, #00B050CC 100%)",
        accentColor: "#4ade80",
        labelNo: "Sparing",
        labelEn: "Savings",
        stat: "7%",
        statLabel: "avg. return",
        imageUrl: "/images/articles/sparing.png",
    },
];

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations("home");
    const allArticles = getAllArticles(locale);
    const featured = allArticles[0];
    const latestArticles = allArticles.slice(1, 6);
    const categories = [...new Set(allArticles.map((a) => a.category))];

    return (
        <main className="mx-auto max-w-[75rem] px-4 sm:px-6" style={{ paddingTop: "var(--nav-height)" }}>
            {/* Hero */}
            <section className="pb-6 pt-12 text-center">
                <div className="mb-4 text-xs font-bold uppercase tracking-widest" style={{ color: "var(--ch-accent)", letterSpacing: "0.12em" }}>
                    {t("tagline")}
                </div>
                <h1 className="mx-auto mb-5 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em", lineHeight: 1.1, color: "var(--t-text)" }}>
                    {t("heroLead")}{" "}
                    <span className="spectrum-gradient-text">{t("heroEmph")}</span>.
                </h1>
                <p className="mx-auto max-w-xl text-base leading-relaxed" style={{ color: "var(--t-text-secondary)", fontFamily: "var(--font-serif)", lineHeight: 1.55 }}>
                    {t("heroSubtitle")}
                </p>
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                    <Link href="/blog" className="spectrum-gradient-bg inline-block px-6 py-3 text-sm font-semibold" style={{ borderRadius: "var(--r-pill)", boxShadow: "0 12px 30px -10px var(--ch-accent)" }}>
                        {t("ctaReadBlog")}
                    </Link>
                    <Link href="/calculators" className="inline-block px-6 py-3 text-sm font-semibold" style={{ borderRadius: "var(--r-pill)", border: "1.5px solid var(--t-border-subtle)", color: "var(--t-text)" }}>
                        {t("ctaTryCalculators")}
                    </Link>
                </div>
                {/* Category pills */}
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {categories.map((cat) => {
                        const s = getCategoryBadgeStyle(cat);
                        return (
                            <Link key={cat} href={`/blog?category=${encodeURIComponent(cat)}`} className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold transition-all duration-200" style={{ background: s.bg, color: s.text, borderRadius: "var(--r-pill)" }}>
                                <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: s.text, opacity: 0.6 }} />
                                {cat}
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* Featured article */}
            {featured && (
                <section className="pb-10 pt-4">
                    <Link href={`/blog/${featured.slug}`} className="group block overflow-hidden transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_22px_48px_-24px_rgba(60,30,110,0.32)]" style={{ background: "var(--t-card)", border: "1px solid var(--t-border-subtle)", borderRadius: "var(--r-card)" }}>
                        <div className="grid md:grid-cols-[1.2fr_1fr]">
                            <div className="relative aspect-[16/10] overflow-hidden md:aspect-auto">
                                {featured.imageUrl && (
                                    <img src={featured.imageUrl} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" style={{ filter: "grayscale(1) contrast(1.04)" }} />
                                )}
                                <span className="absolute left-4 top-4 z-10 px-3 py-1 text-xs font-semibold" style={{ background: getCategoryBadgeStyle(featured.category).bg, color: getCategoryBadgeStyle(featured.category).text, borderRadius: "var(--r-pill)" }}>
                                    {featured.category}
                                </span>
                            </div>
                            <div className="flex flex-col justify-center p-6 md:p-8">
                                <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: "var(--ch-accent)", letterSpacing: "0.1em" }}>
                                    {t("featuredKicker")}
                                </div>
                                <h2 className="mb-3 text-xl font-bold sm:text-2xl" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em", color: "var(--t-text)", lineHeight: 1.2 }}>
                                    {featured.title}
                                </h2>
                                <p className="mb-4 text-sm leading-relaxed" style={{ color: "var(--t-text-secondary)", fontFamily: "var(--font-serif)", lineHeight: 1.6 }}>
                                    {featured.excerpt}
                                </p>
                                <div className="flex items-center gap-3 text-xs" style={{ color: "var(--t-text-muted)" }}>
                                    <time>{featured.date}</time>
                                </div>
                                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold" style={{ color: "var(--ch-accent)" }}>
                                    {locale === "no" ? "Les saka" : "Read story"} →
                                </span>
                            </div>
                        </div>
                    </Link>
                </section>
            )}

            {/* Calculators */}
            <section className="pb-10 pt-10">
                <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
                    <div>
                        <div className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: "var(--ch-accent)", letterSpacing: "0.1em" }}>
                            {t("calculatorsKicker")}
                        </div>
                        <h2 className="text-2xl font-bold sm:text-3xl" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em", color: "var(--t-text)" }}>
                            {t("calculators")}
                        </h2>
                    </div>
                    <Link href="/calculators" className="text-sm font-semibold transition-colors" style={{ color: "var(--t-text)", padding: "9px 18px", borderRadius: "var(--r-pill)", border: "1.5px solid var(--t-border-subtle)" }}>
                        {t("allCalculators")}
                    </Link>
                </div>
                <div className="stagger-children grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {calculators.map((calc) => (
                        <div key={calc.id} className="animate-fade-in-up">
                            <Link href={`/calculators/${calc.id}`} className="group block h-full">
                                <div className="h-full overflow-hidden transition-all duration-300 hover:-translate-y-[5px] hover:shadow-[0_22px_48px_-24px_rgba(60,30,110,0.32)]" style={{ background: "var(--t-card)", border: "1px solid var(--t-border-subtle)", borderRadius: "var(--r-card)" }}>
                                    <div className="relative overflow-hidden p-5 pb-4" style={{ background: calc.gradient }}>
                                        <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.85)", letterSpacing: "0.08em" }}>
                                            {locale === "no" ? calc.labelNo : calc.labelEn}
                                        </div>
                                        <div className="mt-2 text-4xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#fff", lineHeight: 1.05 }}>
                                            {calc.stat}
                                        </div>
                                        <div className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.8)" }}>
                                            {calc.statLabel}
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <h3 className="mb-2 text-base font-semibold transition-colors" style={{ color: "var(--t-text)", fontFamily: "var(--font-display)" }}>
                                            {locale === "no" ? calc.titleNo : calc.titleEn}
                                        </h3>
                                        <p className="mb-4 text-sm leading-relaxed" style={{ color: "var(--t-text-secondary)", fontFamily: "var(--font-serif)" }}>
                                            {locale === "no" ? calc.descNo : calc.descEn}
                                        </p>
                                        <span className="inline-flex items-center gap-1 text-sm font-semibold" style={{ color: "var(--ch-accent)" }}>
                                            {t("openCalculator")} →
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* Latest Articles */}
            <section className="pb-16 pt-6">
                <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
                    <div>
                        <div className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: "var(--ch-accent)", letterSpacing: "0.1em" }}>
                            {t("latestKicker")}
                        </div>
                        <h2 className="text-2xl font-bold sm:text-3xl" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em", color: "var(--t-text)" }}>
                            {t("latestArticles")}
                        </h2>
                    </div>
                    <Link href="/blog" className="text-sm font-semibold transition-colors" style={{ color: "var(--t-text)", padding: "9px 18px", borderRadius: "var(--r-pill)", border: "1.5px solid var(--t-border-subtle)" }}>
                        {t("viewAll")}
                    </Link>
                </div>
                <div className="stagger-children grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Newly published: SSB personal CPI calculator, featured first */}
                    <div className="animate-fade-in-up">
                        <Link href="/calculators/kpi" className="group block h-full">
                            <article className="h-full overflow-hidden transition-all duration-300 hover:-translate-y-[5px] hover:shadow-[0_22px_48px_-24px_rgba(60,30,110,0.32)]" style={{ background: "var(--t-card)", border: "1px solid var(--t-border-subtle)", borderRadius: "var(--r-card)" }}>
                                <div className="relative h-40 w-full overflow-hidden" style={{ background: "linear-gradient(140deg, #8B3DD0 0%, #8B3DD0CC 100%)" }}>
                                    <div className="absolute top-3 left-3">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold" style={{ background: "rgba(255,255,255,0.18)", color: "#fff", borderRadius: "var(--r-pill)" }}>
                                            {locale === "no" ? "Kalkulator" : "Calculator"}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-3 right-4 text-4xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#fff", opacity: 0.92, lineHeight: 1 }}>
                                        SSB
                                    </div>
                                </div>
                                <div className="p-5">
                                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--ch-accent)", letterSpacing: "0.08em" }}>
                                        {locale === "no" ? "Ny kalkulator" : "New calculator"}
                                    </span>
                                    <h3 className="mb-2 text-base font-semibold leading-snug" style={{ color: "var(--t-text)", fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}>
                                        {locale === "no" ? "Personleg KPI-kalkulator" : "Personal CPI Calculator"}
                                    </h3>
                                    <p className="line-clamp-2 text-sm leading-relaxed" style={{ color: "var(--t-text-secondary)", fontFamily: "var(--font-serif)" }}>
                                        {locale === "no"
                                            ? "Vekt SSBs konsumprisindeks med di eiga forbrukskurv og sjå korleis di personlege inflasjon og kjøpekraft utviklar seg."
                                            : "Weight Statistics Norway's CPI with your own consumption basket to see how your personal inflation and purchasing power evolve."}
                                    </p>
                                </div>
                            </article>
                        </Link>
                    </div>
                    {latestArticles.map((article) => (
                        <div key={article.slug} className="animate-fade-in-up">
                            <ArticleCard {...article} locale={locale} />
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
