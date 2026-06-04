import { Link } from "@/lib/i18n-navigation";

export default async function CalculatorsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const no = locale === "no";

    const calcs = [
        {
            id: "voldabadet",
            titleNo: "Voldabadet — Kostnadsanalyse",
            titleEn: "Voldabadet — Cost Analysis",
            descNo: "Kva kostar symjeanlegget kvar innbyggar? Interaktiv kalkulator med justérbare føresetnader og subsidieanalyse.",
            descEn: "What does the swimming facility cost per resident? Interactive calculator with adjustable assumptions and subsidy analysis.",
            gradient: "linear-gradient(135deg, #0c4a6e 0%, #0369a1 60%, #0284c7 100%)",
            accentColor: "#38bdf8",
            labelNo: "Kommuneøkonomi",
            labelEn: "Municipal",
            imageUrl: "/images/articles/voldabadet.png",
        },
        {
            id: "norgespris",
            titleNo: "Norgespris vs. Spotpris",
            titleEn: "Norgespris vs. Spot Price",
            descNo: "Lønner fastpristilbodet 'Norgespris' seg kontra tradisjonell spotpris og strømstøtte?",
            descEn: "Does the fixed-price offer 'Norgespris' pay off compared to traditional spot price and electricity subsidies?",
            gradient: "linear-gradient(135deg, #451a03 0%, #92400e 60%, #d97706 100%)",
            accentColor: "#fbbf24",
            labelNo: "Energi",
            labelEn: "Energy",
            imageUrl: "/images/articles/noregespris.png",
        },
        {
            id: "sparing",
            titleNo: "Investeringskalkulator",
            titleEn: "Investment Calculator",
            descNo: "Sjå korleis startkapital, årlege innskot, gebyr og inflasjon formar det du faktisk sit att med.",
            descEn: "See how starting capital, annual contributions, fees, and inflation shape what you actually end up with.",
            gradient: "linear-gradient(135deg, #052e16 0%, #166534 60%, #16a34a 100%)",
            accentColor: "#4ade80",
            labelNo: "Sparing",
            labelEn: "Savings",
            imageUrl: "/images/articles/sparing.png",
        },
    ];

    return (
        <main className="mx-auto max-w-[90rem] px-4 sm:px-6" style={{ paddingTop: "var(--nav-height)" }}>
            <section className="pb-6 pt-8">
                <h1 className="mb-1 text-xl font-bold tracking-tight" style={{ color: "var(--t-text)" }}>
                    {no ? "Kalkulatorar" : "Calculators"}
                </h1>
                <p className="max-w-xl text-xs" style={{ color: "var(--t-text-muted)" }}>
                    {no ? "Interaktive verktøy for personleg økonomi og offentleg politikk." : "Interactive tools for personal finance and public policy."}
                </p>
            </section>

            <section className="stagger-children grid gap-4 pb-12 sm:grid-cols-2 lg:grid-cols-3">
                {calcs.map((calc) => (
                    <div key={calc.id} className="animate-fade-in-up">
                        <Link href={`/calculators/${calc.id}`} className="group block h-full">
                            <div className="h-full overflow-hidden transition-all duration-200 hover:shadow-xl" style={{ background: "var(--t-card)", border: "1px solid var(--t-border-subtle)", borderRadius: 0 }}>
                                <div className="relative flex h-32 items-end overflow-hidden p-4" style={{ backgroundImage: `url(${calc.imageUrl}), ${calc.gradient}`, backgroundSize: "cover", backgroundPosition: "center top" }}>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <span className="relative z-10 inline-block px-2 py-0.5 text-xs font-semibold tracking-wide" style={{ background: "rgba(0,0,0,0.55)", color: calc.accentColor, border: `1px solid color-mix(in srgb, ${calc.accentColor} 50%, transparent)` }}>
                                        {no ? calc.labelNo : calc.labelEn}
                                    </span>
                                </div>
                                <div className="p-4">
                                    <h3 className="mb-1.5 text-sm font-semibold transition-colors group-hover:underline" style={{ color: "var(--t-text)" }}>
                                        {no ? calc.titleNo : calc.titleEn}
                                    </h3>
                                    <p className="mb-3 text-xs leading-relaxed" style={{ color: "var(--t-text-secondary)" }}>
                                        {no ? calc.descNo : calc.descEn}
                                    </p>
                                    <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: "var(--ch-accent)" }}>
                                        {no ? "Opna kalkulator →" : "Open calculator →"}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </section>

            <section className="py-6" style={{ borderTop: "1px solid var(--t-border-subtle)" }}>
                <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:underline" style={{ color: "var(--ch-accent)" }}>
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    {no ? "Attende til framsida" : "Back to home"}
                </Link>
            </section>
        </main>
    );
}
