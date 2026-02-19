import Link from "next/link";

const calculators = [
    {
        id: "voldabadet",
        title: "Voldabadet — Kostnadsanalyse",
        description:
            "Kva kostar symjeanlegget kvar innbyggar? Interaktiv kalkulator med justérbare føresetnader, husstandstypar og subsidieanalyse.",
        icon: "🏊",
        gradient: "from-accent/40 to-navy-800",
        ready: true,
    },
    {
        id: "compound-interest",
        title: "Compound Interest Calculator",
        description:
            "See how your investments grow over time. Adjust principal, rate, and period to plan your savings strategy.",
        icon: "%",
        gradient: "from-accent-muted/40 to-navy-800",
    },
    {
        id: "savings-goal",
        title: "Savings Goal Calculator",
        description:
            "Figure out how much you need to save every month to reach your financial goals on time.",
        icon: "🎯",
        gradient: "from-emerald-600/30 to-navy-800",
    },
    {
        id: "loan-repayment",
        title: "Loan Repayment Calculator",
        description:
            "Estimate your monthly repayment and total interest on any loan. Compare different repayment strategies.",
        icon: "📊",
        gradient: "from-accent-amber/30 to-navy-800",
    },
];

export default function CalculatorsPage() {
    return (
        <main className="mx-auto max-w-6xl px-4 sm:px-6">
            {/* Header */}
            <section className="pb-6 pt-8">
                <h1 className="mb-1 text-xl font-bold tracking-tight text-text-primary">
                    Calculators
                </h1>
                <p className="max-w-xl text-xs text-text-muted">
                    Interactive financial tools to help you plan, save, and invest smarter.
                    More calculators coming soon.
                </p>
            </section>

            {/* Calculator cards */}
            <section className="stagger-children grid gap-4 pb-12 sm:grid-cols-2 lg:grid-cols-3">
                {calculators.map((calc) => {
                    const inner = (
                        <div className="card-glow group h-full overflow-hidden rounded-xl border border-border-subtle bg-surface-card transition-all duration-300 hover:border-border-medium hover:bg-surface-card-hover hover:shadow-xl hover:shadow-black/20">
                            {/* Top visual */}
                            <div
                                className={`flex h-28 items-center justify-center bg-gradient-to-br ${calc.gradient}`}
                            >
                                <span className="text-4xl font-black text-text-primary opacity-80 transition-transform group-hover:scale-110">
                                    {calc.icon}
                                </span>
                            </div>
                            {/* Content */}
                            <div className="p-4">
                                <h2 className="mb-1.5 text-sm font-semibold text-text-primary transition-colors group-hover:text-accent">
                                    {calc.title}
                                </h2>
                                <p className="mb-3 text-xs leading-relaxed text-text-secondary">
                                    {calc.description}
                                </p>
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-accent transition-colors group-hover:text-accent-hover">
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
            <section className="border-t border-border-subtle py-6">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-accent transition-colors hover:text-accent-hover"
                >
                    <svg
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                    Back to home
                </Link>
            </section>
        </main>
    );
}
