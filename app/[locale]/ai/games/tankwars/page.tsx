import type { Metadata } from "next";
import { Link } from "@/lib/i18n-navigation";

export const metadata: Metadata = {
    title: "TANKWARS",
    description:
        "Turn-based and real-time artillery in the spirit of Tank Wars (1991): destructible terrain, wind, fifteen weapons, hotseat play and a campaign with bosses.",
};

/**
 * The game is a static Vite/Phaser build in public/games/tankwars. It is embedded
 * in an iframe so it keeps its own canvas sizing and keyboard focus; the src must
 * point at index.html because the build uses asset paths relative to that file.
 */
export default async function TankwarsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const no = locale === "no";

    return (
        <main className="mx-auto max-w-[90rem] px-4 sm:px-6" style={{ paddingTop: "var(--nav-height)" }}>
            <section className="pb-4 pt-8">
                <h1 className="mb-1 text-xl font-bold tracking-tight" style={{ color: "var(--t-text)" }}>
                    TANKWARS
                </h1>
                <p className="max-w-2xl text-xs" style={{ color: "var(--t-text-muted)" }}>
                    {no
                        ? "Artillerispel i ånda til Tank Wars (1991): øydeleggjeleg terreng, vind, femten våpen, hotseat for opptil fire spelarar og ein kampanje med bossar. Klikk i spelet og trykk H for kontrollar."
                        : "Artillery game in the spirit of Tank Wars (1991): destructible terrain, wind, fifteen weapons, hotseat for up to four players and a campaign with bosses. Click the game and press H for controls."}
                </p>
            </section>

            <section className="pb-6">
                <div
                    className="relative w-full overflow-hidden"
                    style={{ aspectRatio: "16 / 9", background: "#12070c", border: "1px solid var(--t-border-subtle)", borderRadius: "var(--r-card)" }}
                >
                    <iframe
                        src="/games/tankwars/index.html"
                        title="TANKWARS"
                        className="absolute inset-0 h-full w-full"
                        style={{ border: 0 }}
                        allow="fullscreen; gamepad; autoplay"
                    />
                </div>
                <p className="mt-2 text-[11px]" style={{ color: "var(--t-text-muted)" }}>
                    {no ? "F for fullskjerm · M dempar lyd · N musikk · ESC meny" : "F for fullscreen · M mutes sound · N music · ESC menu"}
                    {" · "}
                    <a href="/games/tankwars/index.html" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: "var(--ch-accent)" }}>
                        {no ? "Opna i eige vindauge ↗" : "Open in its own window ↗"}
                    </a>
                    {" · "}
                    <a href="https://github.com/vskeide/tankwars" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: "var(--ch-accent)" }}>
                        {no ? "Kjeldekode ↗" : "Source ↗"}
                    </a>
                </p>
            </section>

            <section className="py-6" style={{ borderTop: "1px solid var(--t-border-subtle)" }}>
                <Link href="/ai" className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:underline" style={{ color: "var(--ch-accent)" }}>
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    {no ? "Attende til AI" : "Back to AI"}
                </Link>
            </section>
        </main>
    );
}
