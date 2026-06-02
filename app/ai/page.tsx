"use client";

import Link from "next/link";
import { useState } from "react";

const defaultSongs = [
    {
        id: 1,
        title: "Untitled",
        style: "AI Generated",
        sunoUrl: "https://suno.com/s/pL49xluRbYJUIXIW",
    },
];

export default function AIPage() {
    const [songs] = useState(defaultSongs);

    return (
        <main className="mx-auto max-w-[90rem] px-4 sm:px-6" style={{ paddingTop: "var(--nav-height)" }}>
            <section className="pb-6 pt-8">
                <h1 className="mb-1 text-xl font-bold tracking-tight" style={{ color: "var(--t-text)" }}>
                    Music Made with Suno
                </h1>
                <p className="max-w-xl text-xs" style={{ color: "var(--t-text-muted)" }}>
                    Exploring AI-generated music and creative possibilities.
                </p>
            </section>

            {/* Article with sidebar */}
            <section className="pb-12">
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Main article content (2/3 width) */}
                    <div className="lg:col-span-2">
                        {/* Featured image */}
                        <div
                            className="relative mb-8 h-96 w-full overflow-hidden rounded"
                            style={{
                                background: "url(/images/articles/suno.png) center/cover no-repeat",
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </div>

                        {/* Article text */}
                        <article style={{ color: "var(--t-text)" }}>
                            <h2 className="mb-4 text-lg font-semibold">Creating Music with AI</h2>

                            <p className="mb-4 leading-relaxed text-sm" style={{ color: "var(--t-text)" }}>
                                Suno is a powerful AI music generation platform that makes it easy to create original songs from text descriptions. Whether you're looking to generate background music for projects, explore new musical styles, or simply experiment with AI creativity, Suno provides an intuitive interface and impressive audio quality.
                            </p>

                            <p className="mb-4 leading-relaxed text-sm" style={{ color: "var(--t-text)" }}>
                                The platform uses advanced machine learning models trained on diverse music styles and genres. By providing a simple prompt describing the mood, style, instruments, and lyrics, Suno generates complete, original compositions in seconds. This democratizes music creation, allowing anyone to produce professional-sounding tracks without years of musical training.
                            </p>

                            <p className="mb-4 leading-relaxed text-sm" style={{ color: "var(--t-text)" }}>
                                I've been exploring Suno to understand how AI approaches composition, harmony, and rhythm. Below you'll find a curated collection of tracks I've created, ranging from experimental electronic pieces to more structured melodic compositions. Each song represents a different exploration of what's possible with AI-assisted creativity.
                            </p>

                            <div className="mt-6 rounded" style={{ background: "var(--t-surface)", padding: "16px", borderLeft: "3px solid var(--ch-c1)" }}>
                                <p className="text-xs font-medium" style={{ color: "var(--t-text-muted)" }}>
                                    Explore more on{" "}
                                    <a
                                        href="https://suno.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="transition-colors hover:underline"
                                        style={{ color: "var(--ch-accent)" }}
                                    >
                                        Suno.com ↗
                                    </a>
                                </p>
                            </div>
                        </article>
                    </div>

                    {/* Sidebar: Playlist (1/3 width) */}
                    <aside>
                        <div
                            className="sticky top-[calc(var(--nav-height)+20px)] rounded"
                            style={{
                                background: "var(--t-surface)",
                                border: "1px solid var(--t-border-subtle)",
                                padding: "20px",
                            }}
                        >
                            <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--t-text)" }}>
                                My Songs
                            </h3>

                            <div className="space-y-3">
                                {songs.map((song) => (
                                    <a
                                        key={song.id}
                                        href={song.sunoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block rounded p-3 transition-colors hover:bg-opacity-80"
                                        style={{
                                            background: "var(--t-card)",
                                            border: "1px solid var(--t-border-subtle)",
                                        }}
                                    >
                                        <p className="truncate text-xs font-medium" style={{ color: "var(--t-text)" }}>
                                            {song.title}
                                        </p>
                                        <p className="text-xs" style={{ color: "var(--t-text-muted)" }}>
                                            {song.style}
                                        </p>
                                        <p className="mt-2 text-xs" style={{ color: "var(--ch-accent)" }}>
                                            Listen on Suno ↗
                                        </p>
                                    </a>
                                ))}
                            </div>

                            <div
                                className="mt-4 rounded p-3 text-center text-xs"
                                style={{
                                    background: "var(--t-card)",
                                    border: "1px dashed var(--t-border-subtle)",
                                    color: "var(--t-text-muted)",
                                }}
                            >
                                Add more songs here
                            </div>
                        </div>
                    </aside>
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
