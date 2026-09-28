import type { Metadata } from "next";
import { Link } from "@/lib/i18n-navigation";

export const metadata: Metadata = {
    title: "Mi magiske verd (beta)",
    description:
        "A Nynorsk life-and-collecting game for 10–11-year-olds where spelling and maths are the currency. Beta test.",
};

/**
 * The game is a static Vite/React build in public/games/mi-magiske-verd (built with
 * --base=/games/mi-magiske-verd/). It is embedded in an iframe so it keeps its own
 * 1280×800 stage; the save lives in the browser's localStorage for this site.
 */
export default async function MiMagiskeVerdPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const no = locale === "no";

    return (
        <main className="mx-auto max-w-[90rem] px-4 sm:px-6" style={{ paddingTop: "var(--nav-height)" }}>
            <section className="pb-4 pt-8">
                <h1 className="mb-1 flex items-center gap-2 text-xl font-bold tracking-tight" style={{ color: "var(--t-text)" }}>
                    Mi magiske verd
                    <span className="px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide" style={{ background: "#fce7f3", color: "#9d174d", border: "1px solid #f9a8d4", borderRadius: "999px" }}>
                        {no ? "Beta-test" : "Beta test"}
                    </span>
                </h1>
                <div className="max-w-2xl space-y-2 text-xs leading-relaxed" style={{ color: "var(--t-text-muted)" }}>
                    <p>
                        {no
                            ? "Eit livs- og samlespel på nynorsk for born på 10–11 år. Ho lagar sin eigen figur, innreier rommet, hjelper folka i Stjernedalen gjennom brev og småjobbar, og tener myntar ved å løyse rettskriving, grammatikk og matte. Myntane brukar ho i butikkane, med ekte valørar og vekslepengar. Etter kvart opnar stallen, med hestar å stelle, føl som veks opp, ridetur og ei forteljing i 20 kapittel."
                            : "A Nynorsk life-and-collecting game for 10–11-year-olds. She creates her own character, furnishes her room, helps the people of Stjernedalen through letters and small jobs, and earns coins by solving spelling, grammar and maths tasks. The coins are spent in the shops, with real coin values and change. Later the stable opens: horses to care for, foals that grow up, riding, and a 20-chapter story."}
                    </p>
                    <p>
                        {no
                            ? "Foreldremodus: Første gong spelet startar, vel ein vaksen ein firesifra PIN-kode. Den vesle låsen øvst til høgre på heimeskjermen opnar foreldremodus. Der vel du tema og nivå, legg inn vekas ord, ser kva barnet meistrar og slit med, godkjenner skrivne svar og kan gje gåver."
                            : "Parent mode: the first time the game starts, an adult picks a four-digit PIN. The small lock at the top right of the home screen opens parent mode, where you choose topics and levels, add the week's words, see what the child masters and struggles with, approve written answers and give gifts."}
                    </p>
                    <p>
                        {no
                            ? "Lagring: Spelet blir lagra i nettlesaren på eininga det blir spelt på (localStorage). Det finst ingen konto og ingenting blir sendt nokon stad. Ein annan nettlesar eller eit anna nettbrett startar på nytt, og tømmer du nettlesardata, forsvinn lagringa. Under Foreldremodus → Data kan du ta ut ei lagringsfil og hente henne inn att."
                            : "Saving: the game is saved in the browser on the device it is played on (localStorage). There is no account and nothing is sent anywhere. Another browser or another tablet starts from scratch, and clearing browser data deletes the save. Parent mode → Data lets you export a save file and import it again."}
                    </p>
                    <p>
                        {no
                            ? "Beta: Grafikken er ikkje ferdig, og nokre ting kan endre seg eller forsvinne mellom versjonar. Best i liggjande format på nettbrett."
                            : "Beta: the art is not finished, and things may change between versions. Best in landscape on a tablet."}
                    </p>
                </div>
            </section>

            <section className="pb-6">
                <div
                    className="relative w-full overflow-hidden"
                    style={{ aspectRatio: "16 / 10", background: "#f6e7dc", border: "1px solid var(--t-border-subtle)", borderRadius: "var(--r-card)" }}
                >
                    <iframe
                        src="/games/mi-magiske-verd/index.html"
                        title="Mi magiske verd"
                        className="absolute inset-0 h-full w-full"
                        style={{ border: 0 }}
                        allow="fullscreen; autoplay"
                    />
                </div>
                <p className="mt-2 text-[11px]" style={{ color: "var(--t-text-muted)" }}>
                    <a href="/games/mi-magiske-verd/index.html" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: "var(--ch-accent)" }}>
                        {no ? "Opna i eige vindauge ↗ (best på nettbrett)" : "Open in its own window ↗ (best on a tablet)"}
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
