"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";

const songs = [
    { id: 1, title: "We were golden",            artist: "Sortina", sunoUrl: "https://suno.com/s/pL49xluRbYJUIXIW" },
    { id: 2, title: "Discounted Dreams",          artist: "Sortina", sunoUrl: "https://suno.com/s/y9Ob1ehfB3z7zSbl" },
    { id: 3, title: "Buy the Dip, Ride the Wave", artist: "Sortina", sunoUrl: "https://suno.com/s/gmFpS6zwi9kINfpa" },
    { id: 4, title: "Carbon Soles",               artist: "Sortina", sunoUrl: "https://suno.com/s/zwSv1iQcNONgmDKw" },
    { id: 5, title: "Grus til VM",                artist: "Sortina", sunoUrl: "https://suno.com/s/9GuEUD7nDVefkkMK" },
    { id: 6, title: "Satelite",                   artist: "Sortina", sunoUrl: "https://suno.com/s/81x1nxyEv7MDaYQp" },
    { id: 7, title: "The Rush Of Us",             artist: "Sortina", sunoUrl: "https://suno.com/s/synQrTie60hVac0i" },
    { id: 8, title: "Written on the Wall",        artist: "Sortina", sunoUrl: "https://suno.com/s/wbV4Qwg5LujJ7zp1" },
];

const articleNo = (
    <>
        <p className="mb-5">Eg har nok laga rundt 500 songar på Suno på dette tidspunktet. Kanskje meir. Dei aller fleste er borte — prøvde, lytta til éin eller to gonger og kasta. Det du ser i spellelista her er kanskje 10–20 som kjendest verd å halda på. Det forholdet seier noko viktig om kva dette faktisk inneber.</p>
        <h2 className="mb-3 mt-8 text-base font-semibold" style={{ color: "var(--t-text)" }}>Det er ikkje berre å trykkja på ein knapp</h2>
        <p className="mb-5">Den enklaste Suno-bruken finst. Du skriv ein vag prompt, noko kjem ut, du går vidare. Men slik får du ikkje noko du faktisk vil høyra igjen. Å få ein song som kjennest rett krev mykje gjenprøving — lytta til det same sporet i lette variasjonar, justera eit ord i prompten, kasta terningen igjen, samanlikna versjonar. Det liknar meir på redigering enn på generering. Det meste av tida vert brukt på å kasta ting.</p>
        <p className="mb-5">Tekstane er der det meste av arbeidet skjer. Eg brukar Claude til å hjelpa meg — skildrar konteksten, målet, kjensla eg er ute etter og ein grov tematisk retning. Me går fram og attende med å skriva utkast og forbetra dei før noko går inn i Suno. Å få tekstane rette før du genererer sparar mange bortkasta iterasjonar.</p>
        <h2 className="mb-3 mt-8 text-base font-semibold" style={{ color: "var(--t-text)" }}>Nynorske tekstar er eit eige problem</h2>
        <p className="mb-5">Å skriva på norsk — og særleg nynorsk — innfører ei rekkje vanskar som engelske tekstar ikkje har. Direkte omsetjing fungerer nesten aldri. Dei naturlege trykkmønstrana er annleis, rim som fungerer på papiret høyrest kunstige ut når dei vert sunge, og nynorsk har ein rytme som motarbeidar den typen lyrisk stenografi som engelsken trivst med. Du kan ikkje berre byta inn ein norsk frase der ein engelsk ville gå; du må byggja linja på nytt frå botnen av, basert på korleis ho faktisk vil høyrast ut.</p>
        <p className="mb-5">Å fjerna overbrukte ord og slitne tema tek tid òg. Det fyrste utkastet av nesten kva som helst er fullt av klisjear — dei same bileta, dei same kjenslemessige mønstra, dei same rimordningane. Å strippa desse ut og finna noko som faktisk seier det du meiner, på ein måte som flyt når det vert sunge, er det meste av det kreative arbeidet.</p>
        <h2 className="mb-3 mt-8 text-base font-semibold" style={{ color: "var(--t-text)" }}>Kva det har gjort med måten eg høyrer på</h2>
        <p className="mb-5">Å laga musikk — sjølv på denne måten — har gjort at eg set stor pris på musikk. Eg er merksam på tekststruktur no på ein måte eg ikkje var før. Eg legg merke til produksjonsval, korleis ein beat sit under ei vokallinje, kor energien i eit spor kjem frå. Eg har lært meir om korleis songar faktisk fungerer ved å prøva å laga dei, enn eg gjorde frå mange år med berre å lytta.</p>
        <p className="mb-5">Det er òg meir produktiv bruk av ein sein kveld enn å sjå endå ein Netflix-serie. Det høyrest kanskje ut som ein låg standard, men det er ærleg talt slik eg tenkjer på det. Du går ut med noko — nokre gonger noko du faktisk likar.</p>
        <h2 className="mb-3 mt-8 text-base font-semibold" style={{ color: "var(--t-text)" }}>Tilknyting, som kanskje er litt narsissistisk</h2>
        <p className="mb-5">Songane eg har brukt skikkeleg tid på tyder noko for meg på ein måte som songar eg berre har konsumert ikkje gjer. Det er kanskje litt narsissistisk — å lika sitt eige verk meir fordi det er ditt — men eg trur det òg berre er slik kreativ investering fungerer. Når du har brukt ein kveld på å gå fram og attende på ein tekst, lytta til ti versjonar, endeleg landa på noko som kjennest rett, er du knytt til det. Dei i spellelista her er dei eg heldt på å koma attende til. Det er det einaste filteret som tyder noko.</p>
    </>
);

const articleEn = (
    <>
        <p className="mb-5">I've probably made around 500 songs on Suno at this point. Maybe more. The vast majority of them are gone — tried, listened to once or twice, and discarded. What you see in the playlist here is maybe 10–20 that felt worth keeping. That ratio tells you something important about what this actually involves.</p>
        <h2 className="mb-3 mt-8 text-base font-semibold" style={{ color: "var(--t-text)" }}>It's not just pressing a button</h2>
        <p className="mb-5">The plug-and-play version of Suno exists. You type a vague prompt, something comes out, you move on. But that's not how you get something you actually want to listen to again. Getting a song that feels right takes a lot of retrying — listening to the same track in slight variations, tweaking a word in the prompt, rolling the dice again, comparing versions. It's closer to editing than generating. Most of the time is spent rejecting things.</p>
        <p className="mb-5">The lyrics are where most of the work happens. I use Claude to help — describing the context, the goal, the feeling I'm after, a rough thematic direction. We go back and forth drafting and refining before anything goes into Suno. Getting the lyrics right before you generate saves a lot of wasted iterations.</p>
        <h2 className="mb-3 mt-8 text-base font-semibold" style={{ color: "var(--t-text)" }}>Norwegian lyrics are a different problem</h2>
        <p className="mb-5">Writing in Norwegian — and especially nynorsk — introduces a specific set of difficulties that English lyrics don't have. Direct translation almost never works. The natural stress patterns are different, rhymes that work on paper sound forced when sung, and nynorsk in particular has a cadence that resists the kind of lyrical shorthand English thrives on. You can't just swap in a Norwegian phrase where an English one would go; you have to rebuild the line from scratch around how it will actually sound.</p>
        <p className="mb-5">Removing overused words and tired themes takes time too. The first draft of almost anything is full of clichés — the same imagery, the same emotional beats, the same rhyme schemes. Stripping those out and finding something that actually says what you mean, in a way that flows when it's sung, is most of the creative work.</p>
        <h2 className="mb-3 mt-8 text-base font-semibold" style={{ color: "var(--t-text)" }}>What it's done to how I listen</h2>
        <p className="mb-5">Making music — even this way — has made me appreciate music considerably more. I pay attention to lyric structure now in a way I didn't before. I notice production choices, how a beat sits under a vocal line, where the energy in a track comes from. I've learned more about how songs actually work by trying to make them than I did from years of just listening.</p>
        <p className="mb-5">It's also a more productive use of a late evening than watching another Netflix series. That probably sounds like a low bar, but it's genuinely how I think about it. You come away with something — sometimes something you actually like.</p>
        <h2 className="mb-3 mt-8 text-base font-semibold" style={{ color: "var(--t-text)" }}>Connection, which might be narcissistic</h2>
        <p className="mb-5">The songs I've spent real time on mean something to me in a way that songs I just consumed don't. That might be slightly narcissistic — liking your own work more because it's yours — but I think it's also just how creative investment works. When you've spent an evening going back and forth on a lyric, listening to ten versions, finally landing on something that feels right, you're attached to it. The ones in the playlist here are the ones I kept coming back to. That's the only filter that matters.</p>
    </>
);

export default function SunoPage() {
    const locale = useLocale();
    const no = locale === "no";
    const [active, setActive] = useState<number | null>(null);
    const [showNo, setShowNo] = useState(no);

    return (
        <main className="mx-auto max-w-[90rem] px-4 sm:px-6" style={{ paddingTop: "var(--nav-height)" }}>
            <section className="pb-6 pt-8">
                <p className="mb-1 text-xs font-medium uppercase tracking-widest" style={{ color: "var(--t-text-muted)" }}>
                    {no ? "Musikk · Suno" : "Music · Suno"}
                </p>
                <h1 className="mb-1 text-xl font-bold tracking-tight" style={{ color: "var(--t-text)" }}>
                    We were golden
                </h1>
                <p className="max-w-xl text-xs" style={{ color: "var(--t-text-muted)" }}>
                    {no ? "av Sortina — laga med Suno" : "by Sortina — made with Suno"}
                </p>
            </section>

            <section className="pb-12">
                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="order-2 lg:order-1 lg:col-span-2">
                        <div className="relative mb-8 h-72 w-full overflow-hidden" style={{ background: "url(/images/articles/suno.png) center top/cover no-repeat" }}>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        </div>

                        {/* In-article language toggle */}
                        <div className="mb-6 flex items-center gap-2">
                            <span className="text-xs" style={{ color: "var(--t-text-muted)" }}>{no ? "Les på:" : "Read in:"}</span>
                            <button onClick={() => setShowNo(true)} className="px-2 py-0.5 text-xs font-semibold" style={{ background: showNo ? "var(--ch-accent)" : "var(--t-surface)", color: showNo ? "#fff" : "var(--t-text-muted)", border: "1px solid var(--t-border-subtle)", borderRadius: 0 }}>NO</button>
                            <button onClick={() => setShowNo(false)} className="px-2 py-0.5 text-xs font-semibold" style={{ background: !showNo ? "var(--ch-accent)" : "var(--t-surface)", color: !showNo ? "#fff" : "var(--t-text-muted)", border: "1px solid var(--t-border-subtle)", borderRadius: 0 }}>EN</button>
                        </div>

                        <article className="text-sm leading-relaxed" style={{ color: "var(--t-text)" }}>
                            {showNo ? articleNo : articleEn}
                        </article>
                    </div>

                    <aside className="order-1 lg:order-2">
                        <div className="sticky top-[calc(var(--nav-height)+20px)]" style={{ background: "var(--t-surface)", border: "1px solid var(--t-border-subtle)", padding: "20px" }}>
                            <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--t-text)" }}>
                                {no ? "Songar" : "Songs"}
                            </h3>
                            <div className="space-y-3">
                                {songs.map((song) => (
                                    <a key={song.id} href={song.sunoUrl} target="_blank" rel="noopener noreferrer"
                                        onMouseEnter={() => setActive(song.id)} onMouseLeave={() => setActive(null)}
                                        className="block p-3 transition-colors"
                                        style={{ background: active === song.id ? "var(--t-card-hover, var(--t-card))" : "var(--t-card)", border: "1px solid var(--t-border-subtle)" }}>
                                        <p className="truncate text-xs font-semibold" style={{ color: "var(--t-text)" }}>{song.title}</p>
                                        <p className="text-xs" style={{ color: "var(--t-text-muted)" }}>{song.artist}</p>
                                        <p className="mt-2 text-xs font-medium" style={{ color: "var(--ch-accent)" }}>
                                            {no ? "Lytt på Suno ↗" : "Listen on Suno ↗"}
                                        </p>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </section>

            <section className="py-6" style={{ borderTop: "1px solid var(--t-border-subtle)" }}>
                <Link href="/ai" className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:underline" style={{ color: "var(--ch-accent)" }}>
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    {no ? "Attende til AI" : "Back to AI"}
                </Link>
            </section>
        </main>
    );
}
