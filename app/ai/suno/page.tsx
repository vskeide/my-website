"use client";

import Link from "next/link";
import { useState } from "react";

const songs = [
    { id: 1, title: "We were golden",          artist: "Sortina", sunoUrl: "https://suno.com/s/pL49xluRbYJUIXIW" },
    { id: 2, title: "Discounted Dreams",        artist: "Sortina", sunoUrl: "https://suno.com/s/y9Ob1ehfB3z7zSbl" },
    { id: 3, title: "Buy the Dip, Ride the Wave", artist: "Sortina", sunoUrl: "https://suno.com/s/gmFpS6zwi9kINfpa" },
    { id: 4, title: "Carbon Soles",             artist: "Sortina", sunoUrl: "https://suno.com/s/zwSv1iQcNONgmDKw" },
    { id: 5, title: "Grus til VM",              artist: "Sortina", sunoUrl: "https://suno.com/s/9GuEUD7nDVefkkMK" },
    { id: 6, title: "Satelite",                 artist: "Sortina", sunoUrl: "https://suno.com/s/81x1nxyEv7MDaYQp" },
    { id: 7, title: "The Rush Of Us",           artist: "Sortina", sunoUrl: "https://suno.com/s/synQrTie60hVac0i" },
    { id: 8, title: "Written on the Wall",      artist: "Sortina", sunoUrl: "https://suno.com/s/wbV4Qwg5LujJ7zp1" },
];

export default function SunoArticle() {
    const [active, setActive] = useState<number | null>(null);

    return (
        <main className="mx-auto max-w-[90rem] px-4 sm:px-6" style={{ paddingTop: "var(--nav-height)" }}>
            <section className="pb-6 pt-8">
                <p className="mb-1 text-xs font-medium uppercase tracking-widest" style={{ color: "var(--t-text-muted)" }}>
                    Music · Suno
                </p>
                <h1 className="mb-1 text-xl font-bold tracking-tight" style={{ color: "var(--t-text)" }}>
                    We were golden
                </h1>
                <p className="max-w-xl text-xs" style={{ color: "var(--t-text-muted)" }}>
                    by Sortina — made with Suno
                </p>
            </section>

            {/* Article with sidebar */}
            <section className="pb-12">
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Main article content (2/3 width) — below sidebar on mobile */}
                    <div className="order-2 lg:order-1 lg:col-span-2">
                        {/* Featured image */}
                        <div
                            className="relative mb-8 h-72 w-full overflow-hidden"
                            style={{
                                background: "url(/images/articles/suno.png) center top/cover no-repeat",
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        </div>

                        {/* Article text */}
                        <article className="text-sm leading-relaxed" style={{ color: "var(--t-text)" }}>
                            <p className="mb-5">
                                I&apos;ve been curious about AI music for a while — not in a &quot;this will replace musicians&quot; way, but in the same way I&apos;m curious about any new creative tool. What does it feel like to use? What can you make with it that you couldn&apos;t make before? Suno was the first platform that made me actually sit down and try.
                            </p>

                            <p className="mb-5">
                                The process is simpler than you&apos;d expect. You describe the kind of song you want — mood, genre, rough lyrical theme — and within a minute you have a complete track: melody, arrangement, vocals, the lot. Most attempts are forgettable. But occasionally something comes out that catches you off guard.
                            </p>

                            <h2 className="mb-3 mt-8 text-base font-semibold">The song</h2>

                            <p className="mb-5">
                                &quot;We were golden&quot; came out of an evening I wasn&apos;t trying too hard. I had been playing with different prompts — some cinematic, some stripped-back — and typed something about nostalgia, late summers, a feeling you can&apos;t quite hold onto. Suno produced a few versions; the one that stuck had this washed-out indie-pop quality, the kind of sound that sits halfway between confidence and melancholy.
                            </p>

                            <p className="mb-5">
                                The artist name Sortina came with it, generated as part of the track metadata. I kept it. It felt right for a song that doesn&apos;t quite belong to the present.
                            </p>

                            <p className="mb-5">
                                What surprised me most wasn&apos;t the production quality — it was how cohesive the thing felt. The lyrics don&apos;t land every line, but the ones that do carry actual weight. There&apos;s a hook that kept coming back to me the next day, which is more than I can say for a lot of music I&apos;ve intentionally sought out.
                            </p>

                            <h2 className="mb-3 mt-8 text-base font-semibold">What I took from it</h2>

                            <p className="mb-5">
                                AI music tools like Suno are not going to replace the experience of a human making something meaningful over years of practice. But they do something different and interesting: they collapse the distance between an idea and a listenable thing. For someone with no formal music training, that&apos;s genuinely new.
                            </p>

                            <p className="mb-5">
                                I&apos;ll keep using it — less to &quot;make music&quot; and more to see what happens when you describe a feeling and let a machine try to translate it. Sometimes the gap between what you imagined and what comes out is the most interesting part.
                            </p>

                            <div
                                className="mt-8 p-4 text-xs"
                                style={{
                                    background: "var(--t-surface)",
                                    borderLeft: "3px solid var(--ch-accent)",
                                    color: "var(--t-text-muted)",
                                }}
                            >
                                Listen to{" "}
                                <a
                                    href="https://suno.com/s/pL49xluRbYJUIXIW"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium transition-colors hover:underline"
                                    style={{ color: "var(--ch-accent)" }}
                                >
                                    We were golden on Suno ↗
                                </a>
                            </div>
                        </article>
                    </div>

                    {/* Sidebar: Playlist (1/3 width) — top on mobile */}
                    <aside className="order-1 lg:order-2">
                        <div
                            className="sticky top-[calc(var(--nav-height)+20px)]"
                            style={{
                                background: "var(--t-surface)",
                                border: "1px solid var(--t-border-subtle)",
                                padding: "20px",
                            }}
                        >
                            <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--t-text)" }}>
                                Songs
                            </h3>

                            <div className="space-y-3">
                                {songs.map((song) => (
                                    <a
                                        key={song.id}
                                        href={song.sunoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onMouseEnter={() => setActive(song.id)}
                                        onMouseLeave={() => setActive(null)}
                                        className="block p-3 transition-colors"
                                        style={{
                                            background: active === song.id ? "var(--t-card-hover, var(--t-card))" : "var(--t-card)",
                                            border: "1px solid var(--t-border-subtle)",
                                        }}
                                    >
                                        <p className="truncate text-xs font-semibold" style={{ color: "var(--t-text)" }}>
                                            {song.title}
                                        </p>
                                        <p className="text-xs" style={{ color: "var(--t-text-muted)" }}>
                                            {song.artist}
                                        </p>
                                        <p className="mt-2 text-xs font-medium" style={{ color: "var(--ch-accent)" }}>
                                            Listen on Suno ↗
                                        </p>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </section>

            <section className="py-6" style={{ borderTop: "1px solid var(--t-border-subtle)" }}>
                <Link
                    href="/ai"
                    className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:underline"
                    style={{ color: "var(--ch-accent)" }}
                >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to AI
                </Link>
            </section>
        </main>
    );
}
