import Link from "next/link";

const calculators = [
    {
        id: "voldabadet",
        title: "Voldabadet — Kostnadsanalyse",
        description:
            "Kva kostar symjeanlegget kvar innbyggar? Interaktiv kalkulator med justérbare føresetnader, husstandstypar og subsidieanalyse.",
        gradient: "linear-gradient(135deg, #0c4a6e 0%, #0369a1 60%, #0284c7 100%)",
        accentColor: "#38bdf8",
        label: "Kommuneøkonomi",
        imageUrl: "/images/articles/voldabadet.png",
        ready: true,
    },
    {
        id: "norgespris",
        title: "Norgespris vs. Spotpris",
        description:
            "Analyse av strømkostnader: Lønner fastpristilbudet 'Norgespris' seg kontra tradisjonell spotpris og strømstøtte?",
        gradient: "linear-gradient(135deg, #451a03 0%, #92400e 60%, #d97706 100%)",
        accentColor: "#fbbf24",
        label: "Energi",
        imageUrl: "/images/articles/noregespris.png",
        ready: true,
    },
    {
        id: "sparing",
        title: "Kostnad & avkastning — sparekalkulator",
        description:
            "Sjå korleis startkapital, årlege innskot, avkastning, gebyr og inflasjon formar det du faktisk sit att med — i nominelle og reelle kroner.",
        gradient: "linear-gradient(135deg, #052e16 0%, #166534 60%, #16a34a 100%)",
        accentColor: "#4ade80",
        label: "Sparing",
        imageUrl: "/images/articles/sparing.png",
        ready: true,
    },
];

function ChartDecoration({ accentColor, seed }: { accentColor: string; seed: string }) {
    const bars = Array.from({ length: 14 }, (_, i) => {
        const c = seed.charCodeAt(i % seed.length);
        return 20 + ((c * (i + 7)) % 55);
    });
    return (
        <svg viewBox="0 0 280 80" className="absolute inset-0 h-full w-full opacity-25" preserveAspectRatio="none">
            {bars.map((h, i) => (
                <rect key={i} x={i * 20 + 4} y={80 - h} width={14} height={h} fill={accentColor} rx={2} />
            ))}
            <polyline
                points={bars.map((h, i) => `${i * 20 + 11},${80 - h}`).join(" ")}
                fill="none"
                stroke={accentColor}
                strokeWidth="2"
                opacity="0.7"
            />
        </svg>
    );
}

export default function CalculatorsPage() {
    return (
        <main className="mx-auto max-w-[90rem] px-4 sm:px-6" style={{ paddingTop: "var(--nav-height)" }}>
            <section className="pb-6 pt-8">
                <h1 className="mb-1 text-xl font-bold tracking-tight" style={{ color: "var(--t-text)" }}>
                    Calculators
                </h1>
                <p className="max-w-xl text-xs" style={{ color: "var(--t-text-muted)" }}>
                    Interactive financial tools to help you plan, save, and invest smarter.
                </p>
            </section>

            <section className="stagger-children grid gap-4 pb-12 sm:grid-cols-2 lg:grid-cols-3">
                {calculators.map((calc) => {
                    const inner = (
                        <div
                            className="group h-full overflow-hidden transition-all duration-200 hover:shadow-xl"
                            style={{
                                background: "var(--t-card)",
                                border: "1px solid var(--t-border-subtle)",
                                borderRadius: 0,
                            }}
                        >
                            <div
                                className="relative flex h-32 items-end overflow-hidden p-4"
                                style={{
                                    backgroundImage: `url(${calc.imageUrl}), ${calc.gradient}`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center top",
                                }}
                            >
                                {!calc.imageUrl && <ChartDecoration accentColor={calc.accentColor} seed={calc.id} />}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <span
                                    className="relative z-10 inline-block px-2 py-0.5 text-xs font-semibold tracking-wide"
                                    style={{
                                        background: "rgba(0,0,0,0.55)",
                                        color: calc.accentColor,
                                        border: `1px solid color-mix(in srgb, ${calc.accentColor} 50%, transparent)`,
                                    }}
                                >
                                    {calc.label}
                                </span>
                            </div>
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
