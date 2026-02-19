"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Chart, { type ChartConfig } from "./Chart";

export interface ContentBlock {
    type: "text" | "chart";
    content?: string;
    chart?: ChartConfig;
}

interface ArticleLayoutProps {
    title: string;
    date: string;
    category: string;
    sections: ContentBlock[];
}

const categoryColors: Record<string, string> = {
    "Investing & Finance": "bg-accent/15 text-accent-hover",
    "Personal Economy": "bg-emerald-500/15 text-emerald-400",
    "Local Politics": "bg-accent-amber/15 text-accent-amber",
};

const MAX_PINNED = 3;
const MIN_FLEX = 0.25;

export default function ArticleLayout({
    title, date, category, sections,
}: ArticleLayoutProps) {
    const allCharts = useMemo(
        () => sections.filter((s) => s.type === "chart" && s.chart).map((s) => s.chart!),
        [sections],
    );

    const [pinnedIds, setPinnedIds] = useState<string[]>(() =>
        allCharts.filter((c) => c.pin).map((c) => c.id).slice(0, MAX_PINNED),
    );
    const [maximizedId, setMaximizedId] = useState<string | null>(null);

    // Flex ratios for distributing panel height — default 1 each
    const [flexMap, setFlexMap] = useState<Record<string, number>>({});
    const [resizing, setResizing] = useState<{
        id: string;
        startY: number;
        startFlex: number;
    } | null>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    // Drag-to-resize: adjusts flex ratio of dragged chart
    useEffect(() => {
        if (!resizing) return;
        const onMove = (e: MouseEvent) => {
            const panelH = panelRef.current?.clientHeight ?? 600;
            const totalFlex = pinnedIds.reduce((s, id) => s + (flexMap[id] ?? 1), 0);
            const flexPerPx = totalFlex / panelH;
            const delta = e.clientY - resizing.startY;
            const newFlex = Math.max(MIN_FLEX, resizing.startFlex + delta * flexPerPx);
            setFlexMap((prev) => ({ ...prev, [resizing.id]: newFlex }));
        };
        const onUp = () => setResizing(null);
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
        document.body.style.cursor = "row-resize";
        document.body.style.userSelect = "none";
        return () => {
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };
    }, [resizing, pinnedIds, flexMap]);

    const startResize = useCallback(
        (id: string, e: React.MouseEvent) => {
            e.preventDefault();
            setResizing({ id, startY: e.clientY, startFlex: flexMap[id] ?? 1 });
        },
        [flexMap],
    );

    const handlePin = (id: string) => {
        if (pinnedIds.includes(id) || pinnedIds.length >= MAX_PINNED) return;
        setPinnedIds((prev) => [...prev, id]);
    };

    const handleUnpin = (id: string) => {
        setPinnedIds((prev) => prev.filter((x) => x !== id));
        if (maximizedId === id) setMaximizedId(null);
    };

    const handleMaximize = (id: string) => {
        setMaximizedId((prev) => (prev === id ? null : id));
    };

    const getChart = (id: string) => allCharts.find((c) => c.id === id) ?? null;

    const pinnedCharts = pinnedIds.map(getChart).filter(Boolean) as ChartConfig[];
    const maximizedChart = maximizedId ? getChart(maximizedId) : null;
    const tagStyle = categoryColors[category] ?? "bg-accent/15 text-accent-hover";
    const isFull = pinnedIds.length >= MAX_PINNED;

    return (
        <main className="mx-auto max-w-7xl px-4 pt-20 sm:px-6">
            {/* Breadcrumb */}
            <nav className="pb-4 text-xs text-text-muted">
                <Link href="/" className="transition-colors hover:text-text-secondary">Home</Link>
                <span className="mx-2">/</span>
                <Link href="/blog" className="transition-colors hover:text-text-secondary">Blog</Link>
                <span className="mx-2">/</span>
                <span className="text-text-secondary">{title}</span>
            </nav>

            {/* Header */}
            <header className="pb-6">
                <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${tagStyle} mb-3`}>
                    {category}
                </span>
                <h1 className="mb-3 text-2xl font-bold leading-tight tracking-tight text-text-primary sm:text-3xl">
                    {title}
                </h1>
                <time className="text-sm text-text-muted">{date}</time>
            </header>

            {/* Two-column layout */}
            <div className="flex flex-col gap-0 pb-12 lg:flex-row">
                {/* Left column — article text */}
                <div className="min-w-0 lg:w-[55%] lg:pr-8">
                    {sections.map((block, i) => {
                        if (block.type === "text" && block.content) {
                            return (
                                <div key={`t-${i}`}>
                                    {block.content.split("\n\n").map((p, j) => (
                                        <p key={`${i}-${j}`} className="mb-4 text-sm leading-7 text-text-secondary">
                                            {p}
                                        </p>
                                    ))}
                                </div>
                            );
                        }
                        if (block.type === "chart" && block.chart) {
                            const chart = block.chart;
                            const isPinned = pinnedIds.includes(chart.id);
                            return (
                                <div key={chart.id} className="my-6 overflow-hidden rounded-xl border border-border-subtle bg-surface-card p-4">
                                    <div className="mb-3 flex items-center justify-between">
                                        <h3 className="text-xs font-semibold text-text-primary">{chart.title}</h3>
                                        <button
                                            onClick={() => isPinned ? handleUnpin(chart.id) : handlePin(chart.id)}
                                            disabled={!isPinned && isFull}
                                            className={`hidden items-center gap-1 rounded-md px-2.5 py-1 text-[0.65rem] font-semibold transition-all lg:inline-flex ${isPinned
                                                    ? "bg-accent/10 text-accent hover:bg-red-500/15 hover:text-red-400"
                                                    : isFull
                                                        ? "bg-navy-700/30 text-text-muted/40 cursor-not-allowed"
                                                        : "bg-navy-700/50 text-text-muted hover:bg-accent/15 hover:text-accent border border-border-subtle"
                                                }`}
                                        >
                                            {isPinned ? "✓ Pinned" : isFull ? "Panel full" : "Pin to panel →"}
                                        </button>
                                    </div>
                                    <Chart config={chart} compact />
                                </div>
                            );
                        }
                        return null;
                    })}
                </div>

                {/* Right column — sticky, fixed-height, no scroll */}
                <aside className="hidden lg:block lg:w-[45%] lg:border-l lg:border-border-subtle lg:pl-6">
                    <div ref={panelRef} className="sticky top-20 h-[calc(100vh-7rem)] overflow-hidden">
                        {maximizedChart ? (
                            /* Maximized single chart — fills entire panel */
                            <div className="flex h-full flex-col rounded-xl border border-border-subtle bg-surface-card">
                                <div className="flex shrink-0 items-center justify-between border-b border-border-subtle px-4 py-2.5">
                                    <h3 className="truncate text-xs font-semibold text-text-primary">
                                        {maximizedChart.title}
                                    </h3>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleUnpin(maximizedChart.id)}
                                            className="rounded p-1 text-text-muted transition-colors hover:bg-red-500/15 hover:text-red-400"
                                            title="Unpin"
                                        >
                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => setMaximizedId(null)}
                                            className="rounded p-1 text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary"
                                            title="Minimize"
                                        >
                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="min-h-0 flex-1 p-4">
                                    <Chart config={maximizedChart} height="100%" />
                                </div>
                            </div>
                        ) : pinnedCharts.length > 0 ? (
                            /* Flex column — charts share available height */
                            <div className="flex h-full flex-col gap-2">
                                {pinnedCharts.map((chart) => (
                                    <div
                                        key={chart.id}
                                        style={{ flex: flexMap[chart.id] ?? 1 }}
                                        className="flex min-h-0 flex-col rounded-xl border border-border-subtle bg-surface-card transition-all"
                                    >
                                        {/* Header — fixed */}
                                        <div className="flex shrink-0 items-center justify-between border-b border-border-subtle px-3 py-1.5">
                                            <h4 className="truncate pr-1 text-[0.65rem] font-semibold text-text-primary">
                                                {chart.title}
                                            </h4>
                                            <div className="flex shrink-0 items-center gap-0.5">
                                                <button
                                                    onClick={() => handleMaximize(chart.id)}
                                                    className="rounded p-1 text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary"
                                                    title="Maximize"
                                                >
                                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleUnpin(chart.id)}
                                                    className="rounded p-1 text-text-muted transition-colors hover:bg-red-500/15 hover:text-red-400"
                                                    title="Unpin"
                                                >
                                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        {/* Chart area — fills remaining space */}
                                        <div className="min-h-0 flex-1 px-3 pt-1">
                                            <Chart config={chart} height="100%" />
                                        </div>
                                        {/* Resize handle */}
                                        <div
                                            onMouseDown={(e) => startResize(chart.id, e)}
                                            className="group flex h-2.5 shrink-0 cursor-row-resize items-center justify-center rounded-b-xl transition-colors hover:bg-accent/10"
                                        >
                                            <div className="h-[2px] w-10 rounded-full bg-text-muted/20 transition-colors group-hover:bg-accent/50" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* Empty state */
                            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border-medium/50 bg-surface-card">
                                <div className="text-center">
                                    <svg className="mx-auto mb-3 h-10 w-10 text-text-muted/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                                    </svg>
                                    <p className="text-sm font-medium text-text-muted">Select a chart to pin it here</p>
                                    <p className="mt-1 text-xs text-text-muted/50">Click &quot;Pin to panel&quot; on any chart</p>
                                </div>
                            </div>
                        )}
                    </div>
                </aside>
            </div>

            {/* Back link */}
            <div className="border-t border-border-subtle py-6">
                <Link href="/blog" className="inline-flex items-center gap-1.5 text-xs font-medium text-accent transition-colors hover:text-accent-hover">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to all articles
                </Link>
            </div>
        </main>
    );
}
