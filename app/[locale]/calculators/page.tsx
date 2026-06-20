import { Link } from "@/lib/i18n-navigation";
import { getTranslations } from "next-intl/server";

export default async function CalculatorsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const no = locale === "no";
    const t = await getTranslations("calculators");

    const calcs = [
        {
            id: "kpi",
            titleNo: "Personleg KPI-kalkulator",
            titleEn: "Personal CPI Calculator",
            descNo: "Vekt SSBs konsumprisindeks med di eiga forbrukskurv og sjå korleis di personlege inflasjon og kjøpekraft utviklar seg.",
            descEn: "Weight Statistics Norway's CPI with your own consumption basket to see how your personal inflation and purchasing power evolve.",
            gradient: "linear-gradient(140deg, #8B3DD0 0%, #8B3DD0CC 100%)",
            labelNo: "Inflasjon",
            labelEn: "Inflation",
            stat: "SSB",
            statLabel: no ? "live KPI-data" : "live CPI data",
        },
        {
            id: "voldabadet",
            titleNo: "Voldabadet — Kostnadsanalyse",
            titleEn: "Voldabadet — Cost Analysis",
            descNo: "Kva kostar symjeanlegget kvar innbyggar? Interaktiv kalkulator med justérbare føresetnader og subsidieanalyse.",
            descEn: "What does the swimming facility cost per resident? Interactive calculator with adjustable assumptions and subsidy analysis.",
            gradient: "linear-gradient(140deg, #0070C0 0%, #0070C0CC 100%)",
            labelNo: "Kommuneøkonomi",
            labelEn: "Municipal",
            stat: "230M",
            statLabel: no ? "MNOK investering" : "MNOK investment",
        },
        {
            id: "norgespris",
            titleNo: "Norgespris vs. Spotpris",
            titleEn: "Norgespris vs. Spot Price",
            descNo: "Lønner fastpristilbodet 'Norgespris' seg kontra tradisjonell spotpris og strømstøtte?",
            descEn: "Does the fixed-price offer 'Norgespris' pay off compared to traditional spot price and electricity subsidies?",
            gradient: "linear-gradient(140deg, #FFC000 0%, #FFC000CC 100%)",
            labelNo: "Energi",
            labelEn: "Energy",
            stat: "35k",
            statLabel: "kWh / year",
        },
        {
            id: "sparing",
            titleNo: "Investeringskalkulator",
            titleEn: "Investment Calculator",
            descNo: "Sjå korleis startkapital, årlege innskot, gebyr og inflasjon formar det du faktisk sit att med.",
            descEn: "See how starting capital, annual contributions, fees, and inflation shape what you actually end up with.",
            gradient: "linear-gradient(140deg, #00B050 0%, #00B050CC 100%)",
            labelNo: "Sparing",
            labelEn: "Savings",
            stat: "7%",
            statLabel: no ? "snittavkastning" : "avg. return",
        },
    ];

    return (
        <main className="mx-auto max-w-[75rem] px-4 sm:px-6" style={{ paddingTop: "var(--nav-height)" }}>
            <section className="pb-4 pt-14 text-center">
                <div className="mb-4 text-xs font-bold uppercase tracking-widest" style={{ color: "var(--ch-accent)", letterSpacing: "0.12em" }}>
                    {t("kicker")}
                </div>
                <h1 className="mb-4 text-4xl font-bold sm:text-5xl lg:text-6xl" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.035em", lineHeight: 0.96, color: "var(--t-text)" }}>
                    {t("title")}
                </h1>
                <p className="mx-auto max-w-xl text-base" style={{ color: "var(--t-text-secondary)", fontFamily: "var(--font-serif)", lineHeight: 1.55 }}>
                    {t("heroSubtitle")}
                </p>
            </section>

            <section className="stagger-children grid gap-5 pb-16 pt-8 sm:grid-cols-2 lg:grid-cols-3">
                {calcs.map((calc) => (
                    <div key={calc.id} className="animate-fade-in-up">
                        <Link href={`/calculators/${calc.id}`} className="group block h-full">
                            <div className="h-full overflow-hidden transition-all duration-300 hover:-translate-y-[5px] hover:shadow-[0_22px_48px_-24px_rgba(60,30,110,0.32)]" style={{ background: "var(--t-card)", border: "1px solid var(--t-border-subtle)", borderRadius: "var(--r-card)" }}>
                                <div className="relative overflow-hidden p-5 pb-4" style={{ background: calc.gradient }}>
                                    <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.85)", letterSpacing: "0.08em" }}>
                                        {no ? calc.labelNo : calc.labelEn}
                                    </div>
                                    <div className="mt-2 text-4xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#fff", lineHeight: 1.05 }}>
                                        {calc.stat}
                                    </div>
                                    <div className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.8)" }}>
                                        {calc.statLabel}
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="mb-2 text-base font-semibold" style={{ color: "var(--t-text)", fontFamily: "var(--font-display)" }}>
                                        {no ? calc.titleNo : calc.titleEn}
                                    </h3>
                                    <p className="mb-4 text-sm leading-relaxed" style={{ color: "var(--t-text-secondary)", fontFamily: "var(--font-serif)" }}>
                                        {no ? calc.descNo : calc.descEn}
                                    </p>
                                    <span className="inline-flex items-center gap-1 text-sm font-semibold" style={{ color: "var(--ch-accent)" }}>
                                        {t("openCalculator")} →
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </section>

            <section className="py-6" style={{ borderTop: "1px solid var(--t-border-subtle)" }}>
                <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:underline" style={{ color: "var(--ch-accent)", borderRadius: "var(--r-pill)" }}>
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    {t("backToHome")}
                </Link>
            </section>
        </main>
    );
}
