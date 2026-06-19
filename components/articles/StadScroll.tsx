"use client";

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useId,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import {
    KostnadChart as KostnadChartImpl,
    NytteChart as NytteChartImpl,
    AvgiftChart as AvgiftChartImpl,
    AltChart as AltChartImpl,
    OyreGrid as OyreGridImpl,
    DødsfallChart as DødsfallChartImpl,
} from "./StadSkipCharts";

/* ── Context ─────────────────────────────────────────────────────────────────
   Charts live in the sticky right column on desktop; each anchor registers its
   DOM position and the chart node to render in the rail. Tables stay inline. */
interface RailEntry {
    el: HTMLElement;
    content: React.ReactNode;
}

interface CtxValue {
    isDesktop: boolean;
    register: (id: string, el: HTMLElement | null, content: React.ReactNode) => void;
}

const Ctx = createContext<CtxValue | null>(null);
const useScrollCtx = () => {
    const c = useContext(Ctx);
    if (!c) throw new Error("StadScroll components must be used inside <ScrollytellingArticle>");
    return c;
};

/* ── Anchor: sits in the text flow ──────────────────────────────────────────
   Desktop → a zero-height sentinel marking where this chart belongs in the text.
   Mobile  → renders the real chart inline, exactly like the original article. */
function ChartAnchor({ content }: { content: React.ReactNode }) {
    const id = useId();
    const { register, isDesktop } = useScrollCtx();
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        register(id, ref.current, content);
        return () => register(id, null, null);
    }, [id, register, content, isDesktop]);

    if (isDesktop) {
        return <div ref={ref} data-rail-anchor aria-hidden style={{ height: 0, scrollMarginTop: 110 }} />;
    }
    return <div ref={ref} data-rail-anchor>{content}</div>;
}

/* Chart wrappers so the MDX <KostnadChart /> etc. resolve to rail anchors. */
export const OyreGrid = () => <ChartAnchor content={<OyreGridImpl />} />;
export const DødsfallChart = () => <ChartAnchor content={<DødsfallChartImpl />} />;
export const KostnadChart = () => <ChartAnchor content={<KostnadChartImpl />} />;
export const NytteChart = () => <ChartAnchor content={<NytteChartImpl />} />;
export const AvgiftChart = () => <ChartAnchor content={<AvgiftChartImpl />} />;
export const AltChart = () => <ChartAnchor content={<AltChartImpl />} />;

const GAP = 24; // px between stacked charts in the rail

/* ── RailTrack ───────────────────────────────────────────────────────────────
   All charts are stacked in equal-height slots (two fit at once). The whole
   track is translated upward continuously as the reader scrolls, so a new chart
   rises from the bottom, slides into slot 2, pushes slot 2 up into slot 1 and
   slot 1 out of view — no sudden swaps. */
function RailTrack({
    items,
    getAnchorAbsTop,
}: {
    items: { id: string; content: React.ReactNode }[];
    getAnchorAbsTop: (id: string) => number;
}) {
    const trackRef = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);
    const slotInnerRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [slotH, setSlotH] = useState(0);
    const [scales, setScales] = useState<number[]>([]);

    // Size the slots so exactly two fit, and scale each chart to fit its slot.
    useLayoutEffect(() => {
        const compute = () => {
            const vp = viewportRef.current;
            if (!vp) return;
            const h = (vp.clientHeight - GAP) / 2;
            const sc = slotInnerRefs.current.map((el) =>
                el && el.offsetHeight > 0 ? Math.min(1, h / el.offsetHeight) : 1
            );
            setSlotH(h);
            setScales(sc);
        };
        compute();
        window.addEventListener("resize", compute);
        return () => window.removeEventListener("resize", compute);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items.length]);

    // Translate the track in sync with scroll.
    useEffect(() => {
        let raf = 0;
        const update = () => {
            raf = 0;
            const vp = viewportRef.current;
            const track = trackRef.current;
            if (!vp || !track) return;
            const step = (vp.clientHeight - GAP) / 2 + GAP;
            const tops = items.map((it) => getAnchorAbsTop(it.id));
            const n = tops.length;
            const sy = window.scrollY;
            const vh = window.innerHeight;
            // Dwell-then-push: the visible pair (top = chart k, bottom = chart
            // k+1) holds still until the *third* chart's text (k+2) has risen
            // past the middle of the viewport — only then does that chart climb
            // up from the bottom, arriving in the top slot just as its anchor
            // nears the top. Between pushes the pair sticks in place.
            const START_POS = vh * 0.5;     // anchor at mid-screen → push begins
            const COMPLETE_POS = vh * 0.15; // anchor near top → push done
            let advance = 0;
            let prevComplete = -Infinity;
            for (let t = 0; t + 2 < n; t++) {
                let complete = Math.max(tops[t + 2] - COMPLETE_POS, prevComplete + 1);
                let start = Math.max(tops[t + 2] - START_POS, prevComplete);
                if (start > complete) start = complete;
                if (sy >= complete) {
                    advance = t + 1;
                    prevComplete = complete;
                    continue;
                }
                if (sy <= start) advance = t;
                else advance = t + (sy - start) / (complete - start);
                break;
            }
            // Never advance past the pair that shows the last two charts.
            advance = Math.max(0, Math.min(advance, Math.max(0, n - 2)));
            track.style.transform = `translateY(${-(advance * step)}px)`;
        };
        const onScroll = () => {
            if (!raf) raf = requestAnimationFrame(update);
        };
        update();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            if (raf) cancelAnimationFrame(raf);
        };
    }, [items, getAnchorAbsTop, slotH]);

    return (
        <div ref={viewportRef} style={{ height: "100%", overflow: "hidden" }}>
            <div
                ref={trackRef}
                style={{ display: "flex", flexDirection: "column", gap: GAP, willChange: "transform" }}
            >
                {items.map((it, i) => (
                    <div key={it.id} style={{ height: slotH || undefined, overflow: "hidden", flex: "none" }}>
                        <div
                            style={{
                                transform: `scale(${scales[i] ?? 1})`,
                                transformOrigin: "top left",
                                width: `${100 / (scales[i] ?? 1)}%`,
                            }}
                        >
                            <div ref={(el) => { slotInnerRefs.current[i] = el; }}>{it.content}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── The layout shell ───────────────────────────────────────────────────────*/
export function ScrollytellingArticle({ children }: { children: React.ReactNode }) {
    const [isDesktop, setIsDesktop] = useState(false);
    const [orderedIds, setOrderedIds] = useState<string[]>([]);
    const entries = useRef<Map<string, RailEntry>>(new Map());

    const register = useCallback((id: string, el: HTMLElement | null, content: React.ReactNode) => {
        if (el) entries.current.set(id, { el, content });
        else entries.current.delete(id);
    }, []);

    const getAnchorAbsTop = useCallback((id: string) => {
        const el = entries.current.get(id)?.el;
        if (!el) return Number.POSITIVE_INFINITY;
        return el.getBoundingClientRect().top + window.scrollY;
    }, []);

    // Track viewport size.
    useEffect(() => {
        const mq = window.matchMedia("(min-width: 1024px)");
        const apply = () => setIsDesktop(mq.matches);
        apply();
        mq.addEventListener("change", apply);
        return () => mq.removeEventListener("change", apply);
    }, []);

    // Build the chart order (document order) once anchors are registered.
    // Child (anchor) effects run before this parent effect, so entries are ready.
    useEffect(() => {
        if (!isDesktop) return;
        const build = () => {
            const list = [...entries.current.entries()]
                .sort((a, b) => a[1].el.getBoundingClientRect().top - b[1].el.getBoundingClientRect().top)
                .map(([id]) => id);
            setOrderedIds((prev) => (prev.length === list.length && prev.every((v, i) => v === list[i]) ? prev : list));
        };
        build();
        // Re-check shortly after in case any anchor registered late.
        const t = setTimeout(build, 50);
        return () => clearTimeout(t);
    }, [isDesktop]);

    const items = orderedIds
        .map((id) => ({ id, content: entries.current.get(id)?.content ?? null }))
        .filter((it) => it.content != null);

    return (
        <Ctx.Provider value={{ isDesktop, register }}>
            <style>{`
                .stad-flow { width: 100%; }
                .stad-flow__prose { min-width: 0; }
                .stad-flow__rail { display: none; }
                /* Tablet / mobile: single column, constrained for readability. */
                @media (max-width: 1023px) {
                    .stad-flow__prose { max-width: 720px; margin-inline: auto; }
                }
                @media (min-width: 1024px) {
                    .stad-flow {
                        display: grid;
                        /* text column hugs the left edge; rail fills the rest out
                           to the right edge of the header (dark-mode button). */
                        grid-template-columns: minmax(0, 640px) minmax(0, 1fr);
                        column-gap: 3rem;
                        align-items: start;
                    }
                    .stad-flow__rail {
                        display: block;
                        position: sticky;
                        top: 88px;            /* just below the site header */
                        align-self: start;
                    }
                    .stad-flow__rail-inner {
                        height: calc(100vh - 104px);
                        overflow: hidden;
                    }
                }
            `}</style>
            <div className="stad-flow">
                <div className="stad-flow__prose">{children}</div>
                <aside className="stad-flow__rail" aria-hidden>
                    <div className="stad-flow__rail-inner">
                        {isDesktop && items.length > 0 && (
                            <RailTrack items={items} getAnchorAbsTop={getAnchorAbsTop} />
                        )}
                    </div>
                </aside>
            </div>
        </Ctx.Provider>
    );
}
