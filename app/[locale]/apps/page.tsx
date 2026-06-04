import { Link } from "@/lib/i18n-navigation";

const apps = [
    {
        id: "handleliste",
        titleNo: "Handleliste",
        titleEn: "Handleliste",
        descNo: "Smart handleliste for norske daglegvarebutikkar. Sortering basert på butikkart, kategoriar, middagsplanlegging og delt husstand.",
        descEn: "Smart shopping list for Norwegian grocery stores. Sorting by store layout, categories, meal planning and shared households.",
        icon: "🛒",
        accentColor: "var(--ch-c1)",
        url: "https://handleliste-nine.vercel.app",
        tags: ["Next.js", "Supabase", "PWA"],
        ctaNo: "Åpne app",
        ctaEn: "Open app",
    },
    {
        id: "finsankey",
        titleNo: "FinSankey",
        titleEn: "FinSankey",
        descNo: "Excel-tillegg som viser finansielle strømmer som interaktive Sankey-diagrammer. Visualiser hvordan inntekter beveger seg gjennom kostnader, marginer og resultat.",
        descEn: "Excel add-in that renders financial flows as interactive Sankey diagrams. Visualise how revenue moves through costs, margins, and profit — directly inside your spreadsheet.",
        icon: "🔀",
        accentColor: "#6366f1",
        url: "https://github.com/vskeide/FinSankey",
        tags: ["Excel Add-in", "D3.js", "React"],
        ctaNo: "Se på GitHub",
        ctaEn: "View on GitHub",
    },
    {
        id: "monte-carlo",
        titleNo: "Monte Carlo Sim",
        titleEn: "Monte Carlo Sim",
        descNo: "Excel-tillegg for probabilistisk finansmodellering. Definer innganger med PERT-, triangulær-, normal- eller uniformfordeling med egendefinerte MC.*-funksjoner og få histogramutdata med persentilbånd.",
        descEn: "Excel add-in for probabilistic financial modelling. Define inputs with PERT, triangular, normal, or uniform distributions using custom MC.* functions, run thousands of iterations, and get histogram output with percentile bands — ideal for DCF and project valuation.",
        icon: "🎲",
        accentColor: "#f59e0b",
        url: "https://github.com/vskeide/monte-carlo-anitgravity",
        tags: ["Excel Add-in", "TypeScript", "Monte Carlo"],
        ctaNo: "Se på GitHub",
        ctaEn: "View on GitHub",
    },
];

export default async function AppsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const no = locale === "no";

    return (
        <main className="mx-auto max-w-[90rem] px-4 sm:px-6" style={{ paddingTop: "var(--nav-height)" }}>
            <section className="pb-6 pt-8">
                <h1 className="mb-1 text-xl font-bold tracking-tight" style={{ color: "var(--t-text)" }}>
                    {no ? "Apper" : "Apps"}
                </h1>
                <p className="max-w-xl text-xs" style={{ color: "var(--t-text-muted)" }}>
                    {no ? "Nettapper og verktøy jeg har bygget. Åpen kildekode og gratis å bruke." : "Web apps and tools I've built. Open source and free to use."}
                </p>
            </section>

            <section className="stagger-children grid gap-4 pb-12 sm:grid-cols-2 lg:grid-cols-3">
                {apps.map((app) => (
                    <div key={app.id} className="animate-fade-in-up">
                        <a href={app.url} target="_blank" rel="noopener noreferrer" className="group block h-full">
                            <div className="h-full overflow-hidden transition-all duration-200 hover:shadow-lg" style={{ background: "var(--t-card)", border: "1px solid var(--t-border-subtle)", borderRadius: 0 }}>
                                <div className="relative flex h-28 items-center justify-center overflow-hidden" style={{ background: `color-mix(in srgb, ${app.accentColor} 15%, var(--t-surface))` }}>
                                    <span className="relative z-10 text-5xl transition-transform group-hover:scale-110">{app.icon}</span>
                                </div>
                                <div className="p-4">
                                    <h2 className="mb-1.5 text-sm font-semibold transition-colors group-hover:underline" style={{ color: "var(--t-text)" }}>
                                        {no ? app.titleNo : app.titleEn}
                                    </h2>
                                    <p className="mb-3 text-xs leading-relaxed" style={{ color: "var(--t-text-secondary)" }}>
                                        {no ? app.descNo : app.descEn}
                                    </p>
                                    <div className="mb-3 flex flex-wrap gap-1.5">
                                        {app.tags.map((tag) => (
                                            <span key={tag} className="inline-block px-1.5 py-0.5 text-[10px] font-medium" style={{ background: "color-mix(in srgb, var(--ch-accent) 10%, var(--t-surface))", color: "var(--t-text-muted)", border: "1px solid var(--t-border-subtle)" }}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: "var(--ch-accent)" }}>
                                        {no ? app.ctaNo : app.ctaEn}
                                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                    </span>
                                </div>
                            </div>
                        </a>
                    </div>
                ))}
            </section>

            <section className="py-6" style={{ borderTop: "1px solid var(--t-border-subtle)" }}>
                <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:underline" style={{ color: "var(--ch-accent)" }}>
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    {no ? "Tilbake til forsiden" : "Back to home"}
                </Link>
            </section>
        </main>
    );
}
