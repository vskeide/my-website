import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import { getAllArticles } from "@/lib/articles";

const calculators = [
    {
        id: "voldabadet",
        title: "Voldabadet — Kostnadsanalyse",
        description: "Kva kostar symjeanlegget kvar innbyggar? Interaktiv kalkulator med justérbare føresetnader og subsidieanalyse.",
        gradient: "linear-gradient(135deg, #0c4a6e 0%, #0369a1 60%, #0284c7 100%)",
        accentColor: "#38bdf8",
        label: "Kommuneøkonomi",
        imageUrl: "/images/articles/voldabadet.png",
    },
    {
        id: "norgespris",
        title: "Norgespris vs. Spotpris",
        description: "Lønner fastpristilbodet 'Norgespris' seg kontra tradisjonell spotpris og strømstøtte?",
        gradient: "linear-gradient(135deg, #451a03 0%, #92400e 60%, #d97706 100%)",
        accentColor: "#fbbf24",
        label: "Energi",
        imageUrl: "/images/articles/noregespris.png",
    },
    {
        id: "sparing",
        title: "Kostnad & avkastning",
        description: "Sjå korleis startkapital, årlege innskot, gebyr og inflasjon formar det du faktisk sit att med.",
        gradient: "linear-gradient(135deg, #052e16 0%, #166534 60%, #16a34a 100%)",
        accentColor: "#4ade80",
        label: "Sparing",
        imageUrl: "/images/articles/sparing.png",
    },
];

export default function HomePage() {
    const latestArticles = getAllArticles().slice(0, 3);
    return (
        <main className="mx-auto max-w-[90rem] px-4 sm:px-6" style={{ paddingTop: "var(--nav-height)" }}>
            {/* Intro */}
            <section className="pb-8 pt-8">
                <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: "var(--t-text)" }}>
                    Personal Finance &amp; Economics
                </h1>
                <p className="max-w-2xl text-sm leading-relaxed" style={{ color: "var(--t-text-secondary)" }}>
                    Independent analysis and practical insights on investing, personal
                    economy, and local economic policy. Cut through the noise and make
                    better financial decisions.
                </p>
            </section>

            {/* Calculators */}
            <section className="pb-10">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-base font-semibold" style={{ color: "var(--t-text)" }}>
                        Calculators
                    </h2>
                    <Link
                        href="/calculators"
                        className="text-xs font-medium transition-colors hover:underline"
                        style={{ color: "var(--ch-accent)" }}
                    >
                        All calculators →
                    </Link>
                </div>
                <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {calculators.map((calc) => (
                        <div key={calc.id} className="animate-fade-in-up">
                            <Link href={`/calculators/${calc.id}`} className="group block h-full">
                                <div
                                    className="h-full overflow-hidden transition-all duration-200 hover:shadow-xl"
                                    style={{
                                        background: "var(--t-card)",
                                        border: "1px solid var(--t-border-subtle)",
                                        borderRadius: 0,
                                    }}
                                >
                                    {/* Visual header */}
                                    <div
                                        className="relative flex h-32 items-end overflow-hidden p-4"
                                        style={{
                                            backgroundImage: `url(${calc.imageUrl}), ${calc.gradient}`,
                                            backgroundSize: "cover",
                                            backgroundPosition: "center top",
                                        }}
                                    >
                                        {/* Only show SVG bars when no real photo is loaded */}
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
                                        <h3
                                            className="mb-1.5 text-sm font-semibold transition-colors group-hover:underline"
                                            style={{ color: "var(--t-text)" }}
                                        >
                                            {calc.title}
                                        </h3>
                                        <p className="mb-3 text-xs leading-relaxed" style={{ color: "var(--t-text-secondary)" }}>
                                            {calc.description}
                                        </p>
                                        <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: "var(--ch-accent)" }}>
                                            Open calculator →
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* Latest Articles */}
            <section className="pb-12">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-base font-semibold" style={{ color: "var(--t-text)" }}>
                        Latest Articles
                    </h2>
                    <Link
                        href="/blog"
                        className="text-xs font-medium transition-colors hover:underline"
                        style={{ color: "var(--ch-accent)" }}
                    >
                        View all →
                    </Link>
                </div>
                <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {latestArticles.map((article) => (
                        <div key={article.slug} className="animate-fade-in-up">
                            <ArticleCard {...article} />
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}

// Abstract bar/line chart SVG decoration for calculator card headers
function ChartDecoration({ accentColor, seed }: { accentColor: string; seed: string }) {
    // Deterministic bar heights from seed string
    const bars = Array.from({ length: 14 }, (_, i) => {
        const c = seed.charCodeAt(i % seed.length);
        return 20 + ((c * (i + 7)) % 55);
    });
    return (
        <svg
            viewBox="0 0 280 80"
            className="absolute inset-0 h-full w-full opacity-25"
            preserveAspectRatio="none"
        >
            {bars.map((h, i) => (
                <rect
                    key={i}
                    x={i * 20 + 4}
                    y={80 - h}
                    width={14}
                    height={h}
                    fill={accentColor}
                    rx={2}
                />
            ))}
            {/* Trend line overlay */}
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
