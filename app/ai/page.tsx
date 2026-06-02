import Link from "next/link";

const sunoSongs = [
    {
        title: "Untitled",
        style: "AI Generated",
        sunoUrl: "https://suno.com/s/pL49xluRbYJUIXIW",
    },
];

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

            {/* Suno Music */}
            <section className="pb-12">
                <div className="mb-5 flex items-baseline gap-3">
                    <h2 className="text-sm font-semibold" style={{ color: "var(--t-text)" }}>
                        Music made with Suno
                    </h2>
                    <a
                        href="https://suno.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs transition-colors hover:underline"
                        style={{ color: "var(--t-text-muted)" }}
                    >
                        suno.com ↗
                    </a>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {sunoSongs.map((song) => (
                        <a
                            key={song.sunoUrl}
                            href={song.sunoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block transition-all duration-200 hover:shadow-lg"
                            style={{ background: "var(--t-card)", border: "1px solid var(--t-border-subtle)" }}
                        >
                            {/* Visual header */}
                            <div
                                className="relative flex h-28 items-end overflow-hidden p-3"
                                style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #1d4ed8 100%)" }}
                            >
                                {/* Waveform decoration */}
                                <svg
                                    viewBox="0 0 200 48"
                                    className="absolute inset-0 h-full w-full opacity-20"
                                    preserveAspectRatio="none"
                                >
                                    {Array.from({ length: 40 }).map((_, i) => {
                                        const h = 8 + Math.sin(i * 0.7) * 12 + Math.sin(i * 0.3) * 8;
                                        return (
                                            <rect
                                                key={i}
                                                x={i * 5 + 1}
                                                y={(48 - h) / 2}
                                                width={3}
                                                height={h}
                                                fill="white"
                                                rx={1}
                                            />
                                        );
                                    })}
                                </svg>
                                <span
                                    className="relative z-10 inline-block px-2 py-0.5 text-xs font-semibold"
                                    style={{ background: "rgba(255,255,255,0.15)", color: "#c7d2fe" }}
                                >
                                    Suno ↗
                                </span>
                            </div>

                            <div className="p-4">
                                <p className="mb-1 text-sm font-semibold group-hover:underline" style={{ color: "var(--t-text)" }}>
                                    {song.title}
                                </p>
                                <p className="text-xs" style={{ color: "var(--t-text-muted)" }}>
                                    {song.style}
                                </p>
                            </div>
                        </a>
                    ))}
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
