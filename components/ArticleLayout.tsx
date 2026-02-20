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

const categoryTag: Record<string, { bg: string; color: string }> = {
    "Investing & Finance": { bg: "rgba(37,99,235,0.12)", color: "#2563eb" },
    "Personal Economy": { bg: "rgba(5,150,105,0.12)", color: "#059669" },
    "Local Politics": { bg: "rgba(217,119,6,0.12)", color: "#d97706" },
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
    const [flexMap, setFlexMap] = useState<Record<string, number>>({});
    const [resizing, setResizing] = useState<{ id: string; startY: number; startFlex: number } | null>(null);

    const leftRef = useRef<HTMLDivElement>(null);
    const rightRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    // ── Forward wheel events from right panel to left pane ─────────────────────
    // passive:false + preventDefault() prevents the browser from scrolling the body.
    // We manually scroll the left pane instead.
    useEffect(() => {
        const right = rightRef.current;
        const left = leftRef.current;
        if (!right || !left) return;
        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            left.scrollBy({ top: e.deltaY, behavior: "auto" });
        };
        right.addEventListener("wheel", onWheel, { passive: false });
        return () => right.removeEventListener("wheel", onWheel);
    }, []);

    // ── Resize handling ─────────────────────────────────────────────────────────
    const pinnedIds_ref = useRef(pinnedIds);
    pinnedIds_ref.current = pinnedIds;
    const flexMap_ref = useRef(flexMap);
    flexMap_ref.current = flexMap;

    useEffect(() => {
        if (!resizing) return;
        const onMove = (e: MouseEvent) => {
            const panelH = panelRef.current?.clientHeight ?? 600;
            const totalFlex = pinnedIds_ref.current.reduce((s, id) => s + (flexMap_ref.current[id] ?? 1), 0);
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
    }, [resizing]);

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
    const handleMaximize = (id: string) => setMaximizedId((prev) => (prev === id ? null : id));
    const getChart = (id: string) => allCharts.find((c) => c.id === id) ?? null;

    const pinnedCharts = pinnedIds.map(getChart).filter(Boolean) as ChartConfig[];
    const maximizedChart = maximizedId ? getChart(maximizedId) : null;
    const tag = categoryTag[category] ?? { bg: "rgba(37,99,235,0.12)", color: "#2563eb" };
    const isFull = pinnedIds.length >= MAX_PINNED;

    return (
        <>
            {/*
              ── Layout strategy ──────────────────────────────────────────────────
              Outer wrapper = exactly 100vh, flex column, overflow hidden.
              Row 1: nav placeholder (var(--nav-height)) — keeps content below fixed nav.
              Row 2: flex:1, flex row — left + right panels, both overflow:hidden.
              Left panel: overflow-y:scroll with HIDDEN scrollbar (scrollbar-width:none).
              Right panel: overflow:hidden — never moves, never scrolls.
              Wheel events on right panel are forwarded to left panel via JS listener.
              Mobile: only left panel shown, full width, natural scroll via body.
            */}
            <style>{`
                .article-left-pane {
                    scrollbar-width: none;          /* Firefox */
                    -ms-overflow-style: none;       /* IE */
                    overflow-y: scroll;
                }
                .article-left-pane::-webkit-scrollbar {
                    display: none;                  /* Chrome/Safari */
                }
                @media (max-width: 1023px) {
                    .article-outer  { height: auto !important; overflow: visible !important; }
                    .article-row    { display: block !important; }
                    .article-left-pane {
                        overflow-y: visible !important;
                        overflow: visible !important;
                        scrollbar-width: auto;
                        height: auto !important;
                        padding-bottom: 48px;
                    }
                    .article-right-panel { display: none !important; }
                }
            `}</style>

            {/* Outer viewport box */}
            <div
                className="article-outer"
                style={{
                    height: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                }}
            >
                {/* Nav placeholder — pushes content below the fixed nav bar */}
                <div style={{ height: "var(--nav-height)", flexShrink: 0 }} />

                {/* Content row */}
                <div
                    className="article-row mx-auto w-full max-w-[90rem]"
                    style={{
                        flex: 1,
                        display: "flex",
                        overflow: "hidden",
                        paddingLeft: "1rem",
                        paddingRight: "1rem",
                    }}
                >
                    {/* ── Left pane — scrollable, hidden scrollbar ── */}
                    <div
                        ref={leftRef}
                        className="article-left-pane"
                        style={{
                            flex: 1,
                            paddingTop: 20,
                            paddingBottom: 48,
                            paddingRight: 32,
                        }}
                    >
                        {/* Breadcrumb */}
                        <nav className="mb-3 flex flex-wrap items-center gap-1 text-xs" style={{ color: "var(--t-text-muted)" }}>
                            <Link href="/" className="hover:underline" style={{ color: "var(--t-text-muted)" }}>Home</Link>
                            <span>/</span>
                            <Link href="/blog" className="hover:underline" style={{ color: "var(--t-text-muted)" }}>Blog</Link>
                            <span>/</span>
                            <span style={{ color: "var(--t-text-secondary)" }}>{title}</span>
                        </nav>

                        {/* Category tag */}
                        <span
                            className="mb-2 inline-block px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider"
                            style={{ background: tag.bg, color: tag.color, borderRadius: 0 }}
                        >
                            {category}
                        </span>

                        {/* Title */}
                        <h1 className="mb-1.5 font-bold leading-tight tracking-tight" style={{ fontSize: 22, color: "var(--t-text)" }}>
                            {title}
                        </h1>

                        {/* Date */}
                        <time className="text-sm" style={{ color: "var(--t-text-muted)" }}>{date}</time>
                        <div className="my-5" style={{ height: 1, background: "var(--t-border-subtle)" }} />

                        {/* Article content */}
                        {sections.map((block, i) => {
                            if (block.type === "text" && block.content) {
                                return (
                                    <div key={`t-${i}`}>
                                        {block.content.split("\n\n").map((p, j) => (
                                            <p key={`${i}-${j}`} className="mb-4 text-sm leading-7" style={{ color: "var(--t-text-secondary)" }}>
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
                                    <div
                                        key={chart.id}
                                        className="my-5 overflow-hidden"
                                        style={{ border: "1px solid var(--t-border-subtle)", borderRadius: 0 }}
                                    >
                                        <div
                                            className="flex items-center justify-between px-3 py-2"
                                            style={{ borderBottom: "1px solid var(--t-border-subtle)", background: "var(--t-surface, var(--t-card))" }}
                                        >
                                            <h3 className="text-[0.65rem] font-semibold" style={{ color: "var(--t-text)" }}>{chart.title}</h3>
                                            <button
                                                onClick={() => isPinned ? handleUnpin(chart.id) : handlePin(chart.id)}
                                                disabled={!isPinned && isFull}
                                                className="hidden items-center gap-1 px-2 py-0.5 text-[0.6rem] font-semibold transition-all lg:inline-flex"
                                                style={{
                                                    background: isPinned ? "rgba(37,99,235,0.12)" : "var(--t-card)",
                                                    color: isPinned ? "var(--ch-accent)" : "var(--t-text-muted)",
                                                    border: `1px solid ${isPinned ? "var(--ch-accent)" : "var(--t-border-subtle)"}`,
                                                    borderRadius: 0,
                                                    opacity: !isPinned && isFull ? 0.4 : 1,
                                                    cursor: !isPinned && isFull ? "not-allowed" : "pointer",
                                                }}
                                            >
                                                {isPinned ? "✓ Pinned" : isFull ? "Panel full" : "Pin to panel →"}
                                            </button>
                                        </div>
                                        {/* Inline charts = static (no interactivity) */}
                                        <Chart config={chart} compact static height={180} />
                                    </div>
                                );
                            }
                            return null;
                        })}

                        {/* Slim inline footer */}
                        <div
                            className="mt-6 pt-4 flex items-center justify-between flex-wrap gap-3"
                            style={{ borderTop: "1px solid var(--t-border-subtle)" }}
                        >
                            <p className="text-[0.65rem]" style={{ color: "var(--t-text-muted)" }}>
                                © {new Date().getFullYear()} Skeide.me
                            </p>
                            <nav className="flex items-center gap-3">
                                {[["/blog", "Blog"], ["/archive", "Archive"], ["/calculators", "Calculators"]].map(([href, label]) => (
                                    <Link key={href} href={href} className="text-[0.65rem] hover:underline" style={{ color: "var(--t-text-muted)" }}>{label}</Link>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* ── Right panel — truly fixed, never scrolls ── */}
                    <aside
                        ref={rightRef}
                        className="article-right-panel hidden lg:flex lg:flex-col"
                        style={{
                            flex: 1,
                            overflow: "hidden",
                            borderLeft: "1px solid var(--t-border-subtle)",
                        }}
                    >
                        <div
                            ref={panelRef}
                            style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}
                        >
                            {maximizedChart ? (
                                <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
                                    <div
                                        className="flex shrink-0 items-center justify-between px-4 py-2"
                                        style={{ borderBottom: "1px solid var(--t-border-subtle)", background: "var(--t-surface, var(--t-card))" }}
                                    >
                                        <h3 className="truncate text-xs font-semibold" style={{ color: "var(--t-text)" }}>{maximizedChart.title}</h3>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => handleUnpin(maximizedChart.id)} className="p-1" style={{ color: "var(--t-text-muted)" }} title="Unpin">
                                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                            <button onClick={() => setMaximizedId(null)} className="p-1" style={{ color: "var(--t-text-muted)" }} title="Minimize">
                                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ flex: 1, padding: "8px 12px", minHeight: 0 }}>
                                        <Chart config={maximizedChart} height="100%" />
                                    </div>
                                </div>
                            ) : pinnedCharts.length > 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
                                    {pinnedCharts.map((chart, idx) => (
                                        <div
                                            key={chart.id}
                                            style={{
                                                flex: flexMap[chart.id] ?? 1,
                                                display: "flex",
                                                flexDirection: "column",
                                                minHeight: 0,
                                                borderBottom: idx < pinnedCharts.length - 1 ? "1px solid var(--t-border-subtle)" : "none",
                                                overflow: "hidden",
                                            }}
                                        >
                                            <div
                                                className="flex shrink-0 items-center justify-between px-4 py-2"
                                                style={{ borderBottom: "1px solid var(--t-border-subtle)", background: "var(--t-surface, var(--t-card))" }}
                                            >
                                                <h4 className="truncate pr-1 text-[0.65rem] font-semibold" style={{ color: "var(--t-text)" }}>{chart.title}</h4>
                                                <div className="flex shrink-0 items-center gap-0.5">
                                                    <button onClick={() => handleMaximize(chart.id)} className="p-1" style={{ color: "var(--t-text-muted)" }} title="Maximize">
                                                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>
                                                    </button>
                                                    <button onClick={() => handleUnpin(chart.id)} className="p-1" style={{ color: "var(--t-text-muted)" }} title="Unpin">
                                                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </div>
                                            </div>
                                            <div style={{ flex: 1, padding: "6px 12px", minHeight: 0 }}>
                                                <Chart config={chart} height="100%" />
                                            </div>
                                            {pinnedCharts.length > 1 && (
                                                <div
                                                    onMouseDown={(e) => startResize(chart.id, e)}
                                                    className="flex h-2 shrink-0 cursor-row-resize items-center justify-center"
                                                    style={{ background: "var(--t-border-subtle)" }}
                                                >
                                                    <div className="h-px w-8" style={{ background: "var(--t-border-medium)" }} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <div className="px-8 text-center">
                                        <svg className="mx-auto mb-3 h-10 w-10" style={{ color: "var(--t-border-medium)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                                        </svg>
                                        <p className="text-sm font-medium" style={{ color: "var(--t-text-muted)" }}>Pin charts to this panel</p>
                                        <p className="mt-1 text-xs" style={{ color: "var(--t-text-muted)", opacity: 0.6 }}>Click &ldquo;Pin to panel →&rdquo; on any chart in the article</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </div>
        </>
    );
}
