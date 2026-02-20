import Link from "next/link";

const calculators = [
    {
        id: "voldabadet",
        title: "Voldabadet — Kostnadsanalyse",
        description:
            "Kva kostar symjeanlegget kvar innbyggar? Interaktiv kalkulator med justérbare føresetnader, husstandstypar og subsidieanalyse.",
        icon: "🏊",
        accentColor: "#2563eb",
        ready: true,
    },
    {
        id: "compound-interest",
        title: "Compound Interest Calculator",
        description:
            "See how your investments grow over time. Adjust principal, rate, and period to plan your savings strategy.",
        icon: "%",
        accentColor: "#1e40af",
    },
    {
        id: "savings-goal",
        title: "Savings Goal Calculator",
        description:
            "Figure out how much you need to save every month to reach your financial goals on time.",
        icon: "🎯",
        accentColor: "#059669",
    },
    {
        id: "loan-repayment",
        title: "Loan Repayment Calculator",
        description:
            "Estimate your monthly repayment and total interest on any loan. Compare different repayment strategies.",
        icon: "📊",
        accentColor: "#d97706",
    },
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
                                className="flex h-28 items-center justify-center"
                                style={{
                                    background: `linear-gradient(135deg, ${calc.accentColor}33, #0f172a)`,
                                }}
                            >
                                <span className="text-4xl font-black transition-transform group-hover:scale-110" style={{ color: "var(--t-text)" }}>
                                    {calc.icon}
                                </span>
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
