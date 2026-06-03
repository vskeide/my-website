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
                                I&apos;ve probably made around 500 songs on Suno at this point. Maybe more. The vast majority of them are gone — tried, listened to once or twice, and discarded. What you see in the playlist here is maybe 10–20 that felt worth keeping. That ratio tells you something important about what this actually involves.
                            </p>

                            <h2 className="mb-3 mt-8 text-base font-semibold">It&apos;s not just pressing a button</h2>

                            <p className="mb-5">
                                The plug-and-play version of Suno exists. You type a vague prompt, something comes out, you move on. But that&apos;s not how you get something you actually want to listen to again. Getting a song that feels right takes a lot of retrying — listening to the same track in slight variations, tweaking a word in the prompt, rolling the dice again, comparing versions. It&apos;s closer to editing than generating. Most of the time is spent rejecting things.
                            </p>

                            <p className="mb-5">
                                The lyrics are where most of the work happens. I use Claude to help — describing the context, the goal, the feeling I&apos;m after, a rough thematic direction. We go back and forth drafting and refining before anything goes into Suno. Getting the lyrics right before you generate saves a lot of wasted iterations.
                            </p>

                            <h2 className="mb-3 mt-8 text-base font-semibold">Norwegian lyrics are a different problem</h2>

                            <p className="mb-5">
                                Writing in Norwegian — and especially nynorsk — introduces a specific set of difficulties that English lyrics don&apos;t have. Direct translation almost never works. The natural stress patterns are different, rhymes that work on paper sound forced when sung, and nynorsk in particular has a cadence that resists the kind of lyrical shorthand English thrives on. You can&apos;t just swap in a Norwegian phrase where an English one would go; you have to rebuild the line from scratch around how it will actually sound.
                            </p>

                            <p className="mb-5">
                                Removing overused words and tired themes takes time too. The first draft of almost anything is full of clichés — the same imagery, the same emotional beats, the same rhyme schemes. Stripping those out and finding something that actually says what you mean, in a way that flows when it&apos;s sung, is most of the creative work.
                            </p>

                            <h2 className="mb-3 mt-8 text-base font-semibold">What it&apos;s done to how I listen</h2>

                            <p className="mb-5">
                                Making music — even this way — has made me appreciate music considerably more. I pay attention to lyric structure now in a way I didn&apos;t before. I notice production choices, how a beat sits under a vocal line, where the energy in a track comes from. I&apos;ve learned more about how songs actually work by trying to make them than I did from years of just listening.
                            </p>

                            <p className="mb-5">
                                It&apos;s also a more productive use of a late evening than watching another Netflix series. That probably sounds like a low bar, but it&apos;s genuinely how I think about it. You come away with something — sometimes something you actually like.
                            </p>

                            <h2 className="mb-3 mt-8 text-base font-semibold">Connection, which might be narcissistic</h2>

                            <p className="mb-5">
                                The songs I&apos;ve spent real time on mean something to me in a way that songs I just consumed don&apos;t. That might be slightly narcissistic — liking your own work more because it&apos;s yours — but I think it&apos;s also just how creative investment works. When you&apos;ve spent an evening going back and forth on a lyric, listening to ten versions, finally landing on something that feels right, you&apos;re attached to it. The ones in the playlist here are the ones I kept coming back to. That&apos;s the only filter that matters.
                            </p>
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
