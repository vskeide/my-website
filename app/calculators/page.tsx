import Link from "next/link";

const calculators = [
    {
        id: "voldabadet",
        title: "Voldabadet — Kostnadsanalyse",
        description:
            "Kva kostar symjeanlegget kvar innbyggar? Interaktiv kalkulator med justérbare føresetnader, husstandstypar og subsidieanalyse.",
        icon: "🏊",
        accentColor: "var(--ch-c1)",
        imageUrl: "/images/calc_pool.svg",
        ready: true,
    },
    {
        id: "norgespris",
        title: "Norgespris vs. Spotpris",
        description:
            "Analyse av strømkostnader: Lønner fastpristilbudet 'Norgespris' seg kontra tradisjonell spotpris og strømstøtte?",
        icon: "⚡",
        accentColor: "var(--ch-c2)",
        imageUrl: null, // Fallbacks to icon+accentColor rendering
        ready: true,
    }
];

export default function CalculatorsPage() {
    return (
        <main className="mx-auto max-w-[90rem] px-4 sm:px-6" style={{ paddingTop: "var(--nav-height)" }}>
            {/* Header */}
            <section className="pb-6 pt-8">
                <h1 className="mb-1 text-xl font-bold tracking-tight" style={{ color: "var(--t-text)" }}>
                    Calculators
                </h1>
                <p className="max-w-xl text-xs" style={{ color: "var(--t-text-muted)" }}>
                    Interactive financial tools to help you plan, save, and invest smarter.
                    More calculators coming soon.
                </p>
            </section>

            {/* Calculator cards */}
            <section className="stagger-children grid gap-4 pb-12 sm:grid-cols-2 lg:grid-cols-3">
                {calculators.map((calc) => {
                    const inner = (
                        <div
                            className="group h-full overflow-hidden transition-all duration-200 hover:shadow-lg"
                            style={{
                                background: "var(--t-card)",
                                border: "1px solid var(--t-border-subtle)",
                                borderRadius: 0,
                            }}
                        >
                            {/* Top visual */}
                            <div
                                className="relative flex h-28 items-center justify-center overflow-hidden"
                                style={{
                                    background: calc.imageUrl
                                        ? `url(${calc.imageUrl}) center/cover no-repeat var(--t-surface)`
                                        : `color-mix(in srgb, ${calc.accentColor} 15%, var(--t-surface))`,
                                }}
                            >
                                {!calc.imageUrl && (
                                    <span className="relative z-10 text-4xl font-black transition-transform group-hover:scale-110" style={{ color: "var(--t-text)" }}>
                                        {calc.icon}
                                    </span>
                                )}
                            </div>
                            {/* Content */}
                            <div className="p-4">
                                <h2 className="mb-1.5 text-sm font-semibold transition-colors group-hover:underline" style={{ color: "var(--t-text)" }}>
                                    {calc.title}
                                </h2>
                                <p className="mb-3 text-xs leading-relaxed" style={{ color: "var(--t-text-secondary)" }}>
                                    {calc.description}
                                </p>
                                <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: "var(--ch-accent)" }}>
                                    {calc.ready ? "Open calculator →" : "Coming soon"}
                                </span>
                            </div>
                        </div>
                    );
                    return (
                        <div key={calc.id} className="animate-fade-in-up">
                            {calc.ready ? (
                                <Link href={`/calculators/${calc.id}`} className="block h-full">{inner}</Link>
                            ) : inner}
                        </div>
                    );
                })}
            </section>

            {/* CTA back */}
            <section className="py-6" style={{ borderTop: "1px solid var(--t-border-subtle)" }}>
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:underline"
                    style={{ color: "var(--ch-accent)" }}
                >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to home
                </Link>
            </section>
        </main>
    );
}
