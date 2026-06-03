import Link from "next/link";

export default function AIPage() {
    return (
        <main className="mx-auto max-w-[90rem] px-4 sm:px-6" style={{ paddingTop: "var(--nav-height)" }}>
            <section className="pb-6 pt-8">
                <h1 className="mb-1 text-xl font-bold tracking-tight" style={{ color: "var(--t-text)" }}>
                    AI
                </h1>
                <p className="max-w-xl text-xs" style={{ color: "var(--t-text-muted)" }}>
                    Things I&apos;m exploring with AI — music, tools, experiments.
                </p>
            </section>

            {/* Music with Suno */}
            <section className="pb-12">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-base font-semibold" style={{ color: "var(--t-text)" }}>
                        Music
                    </h2>
                    <Link
                        href="/ai/suno"
                        className="text-xs font-medium transition-colors hover:underline"
                        style={{ color: "var(--ch-accent)" }}
                    >
                        Explore →
                    </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Link href="/ai/suno" className="group block h-full overflow-hidden transition-all duration-200 hover:shadow-xl" style={{ background: "var(--t-card)", border: "1px solid var(--t-border-subtle)", borderRadius: 0 }}>
                        {/* Visual header with image */}
                        <div
                            className="relative flex h-36 items-end overflow-hidden p-4"
                            style={{
                                backgroundImage: "url(/images/articles/suno.png)",
                                backgroundSize: "cover",
                                backgroundPosition: "center top",
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <span
                                className="relative z-10 inline-block px-2 py-0.5 text-xs font-semibold tracking-wide"
                                style={{
                                    background: "rgba(0,0,0,0.55)",
                                    color: "#c7d2fe",
                                    border: "1px solid color-mix(in srgb, #c7d2fe 50%, transparent)",
                                }}
                            >
                                Suno
                            </span>
                        </div>

                        <div className="p-4">
                            <h3
                                className="mb-1.5 text-sm font-semibold transition-colors group-hover:underline"
                                style={{ color: "var(--t-text)" }}
                            >
                                We were golden
                            </h3>
                            <p className="mb-3 text-xs leading-relaxed" style={{ color: "var(--t-text-secondary)" }}>
                                by Sortina
                            </p>
                            <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: "var(--ch-accent)" }}>
                                Read story →
                            </span>
                        </div>
                    </Link>
                </div>
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
