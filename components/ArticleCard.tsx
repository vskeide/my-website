"use client";

import Link from "next/link";
import { getCategoryBadgeStyle } from "@/lib/categories";

export interface ArticleCardProps {
    slug: string;
    title: string;
    excerpt: string;
    date: string;
    category: string;
    imageUrl?: string | null;
    locale?: string;
}

/* ── Per-category gradient backgrounds ────────────────────────────────────── */
const GRADIENTS: Record<string, string> = {
    "Investing & Finance":   "linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%)",
    "Investering og finans": "linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%)",
    "Personal Economy":      "linear-gradient(135deg, #042f2e 0%, #0f766e 60%, #0d9488 100%)",
    "Personlig økonomi":     "linear-gradient(135deg, #042f2e 0%, #0f766e 60%, #0d9488 100%)",
    "Local Politics":        "linear-gradient(135deg, #1c1917 0%, #7c2d12 60%, #c2410c 100%)",
    "Lokalpolitikk":         "linear-gradient(135deg, #1c1917 0%, #7c2d12 60%, #c2410c 100%)",
    "AI":                    "linear-gradient(135deg, #022c22 0%, #065f46 55%, #059669 100%)",
    "China":                 "linear-gradient(135deg, #0c1a2e 0%, #0e4272 55%, #0284c7 100%)",
    "Kina":                  "linear-gradient(135deg, #0c1a2e 0%, #0e4272 55%, #0284c7 100%)",
};
const DEFAULT_GRADIENT = "linear-gradient(135deg, #1e1b4b 0%, #3730a3 60%, #4f46e5 100%)";

/* ── Candlestick chart — Investing & Finance ──────────────────────────────── */
function CandlestickSVG({ accent }: { accent: string }) {
    const candles = [
        { x: 22,  o: 108, c: 88,  h: 80,  l: 116, up: true  },
        { x: 58,  o: 90,  c: 100, h: 84,  l: 106, up: false },
        { x: 94,  o: 98,  c: 78,  h: 70,  l: 104, up: true  },
        { x: 130, o: 80,  c: 64,  h: 57,  l: 86,  up: true  },
        { x: 166, o: 66,  c: 75,  h: 60,  l: 80,  up: false },
        { x: 202, o: 73,  c: 56,  h: 48,  l: 78,  up: true  },
        { x: 238, o: 58,  c: 44,  h: 36,  l: 64,  up: true  },
        { x: 274, o: 46,  c: 32,  h: 24,  l: 52,  up: true  },
    ];
    const downColor = "#FF6666";
    return (
        <svg viewBox="0 0 320 144" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
            {[40, 75, 110].map(y => (
                <line key={y} x1="0" y1={y} x2="320" y2={y} stroke="white" strokeWidth="0.4" opacity="0.1" />
            ))}
            {candles.map(c => (
                <g key={c.x}>
                    <line x1={c.x} y1={c.h} x2={c.x} y2={c.l}
                          stroke={c.up ? accent : downColor} strokeWidth="1.5" opacity="0.9" />
                    <rect x={c.x - 9} y={c.up ? c.c : c.o} width="18"
                          height={Math.max(2, Math.abs(c.o - c.c))}
                          fill={c.up ? accent : downColor} rx="1" opacity="0.9" />
                </g>
            ))}
            {/* Trend line */}
            <polyline
                points={candles.map(c => `${c.x},${c.up ? c.c : c.o}`).join(" ")}
                fill="none" stroke={accent} strokeWidth="1.5" strokeDasharray="5 3" opacity="0.4"
            />
        </svg>
    );
}

/* ── Neural network — AI ──────────────────────────────────────────────────── */
function NeuralNetworkSVG({ accent }: { accent: string }) {
    const layers = [
        { x: 46,  ys: [36, 72, 108] },
        { x: 120, ys: [22, 54, 86, 118] },
        { x: 200, ys: [22, 54, 86, 118] },
        { x: 274, ys: [54, 90] },
    ];
    // "Activated" path through the network
    const activated = [
        { x: 46, y: 72 }, { x: 120, y: 54 }, { x: 200, y: 86 }, { x: 274, y: 54 },
    ];
    const isActivated = (lx: number, ly: number) =>
        activated.some(p => p.x === lx && p.y === ly);

    return (
        <svg viewBox="0 0 320 144" className="absolute inset-0 h-full w-full">
            {/* All connections (dim) */}
            {layers.slice(0, -1).map((layer, li) =>
                layer.ys.flatMap(fy =>
                    layers[li + 1].ys.map(ty => (
                        <line key={`${li}-${fy}-${ty}`}
                              x1={layer.x} y1={fy} x2={layers[li + 1].x} y2={ty}
                              stroke={accent} strokeWidth="0.6" opacity="0.15" />
                    ))
                )
            )}
            {/* Activated path (bright) */}
            <polyline
                points={activated.map(p => `${p.x},${p.y}`).join(" ")}
                fill="none" stroke={accent} strokeWidth="2" opacity="0.75"
            />
            {/* All nodes */}
            {layers.map((layer, li) =>
                layer.ys.map(y => {
                    const active = isActivated(layer.x, y);
                    return (
                        <g key={`${li}-${y}`}>
                            {active && <circle cx={layer.x} cy={y} r="10" fill={accent} opacity="0.15" />}
                            <circle cx={layer.x} cy={y} r="5"
                                    fill={accent} opacity={active ? 1 : 0.4} />
                        </g>
                    );
                })
            )}
        </svg>
    );
}

/* ── Budget donut — Personal Economy ─────────────────────────────────────── */
function BudgetDonutSVG({ accent }: { accent: string }) {
    const cx = 88, cy = 72, r2 = 52, r1 = 30;
    const PI2 = 2 * Math.PI;
    const segments = [
        { pct: 0.35, color: accent,   label: "Bolig", lx: 148, ly: 40  },
        { pct: 0.20, color: "#5EEAD4", label: "Mat",   lx: 148, ly: 62  },
        { pct: 0.20, color: "#2DD4BF", label: "Spar.", lx: 148, ly: 84  },
        { pct: 0.15, color: "#99F6E4", label: "Trans", lx: 148, ly: 106 },
        { pct: 0.10, color: "#CCFBF1", label: "Annet", lx: 148, ly: 128 },
    ];
    let angle = -Math.PI / 2;
    const paths = segments.map(seg => {
        const a1 = angle;
        const a2 = angle + seg.pct * PI2;
        angle = a2;
        const large = seg.pct > 0.5 ? 1 : 0;
        const x1 = cx + r2 * Math.cos(a1), y1 = cy + r2 * Math.sin(a1);
        const x2 = cx + r2 * Math.cos(a2), y2 = cy + r2 * Math.sin(a2);
        const x3 = cx + r1 * Math.cos(a2), y3 = cy + r1 * Math.sin(a2);
        const x4 = cx + r1 * Math.cos(a1), y4 = cy + r1 * Math.sin(a1);
        return {
            d: `M${x1},${y1} A${r2},${r2} 0 ${large} 1 ${x2},${y2} L${x3},${y3} A${r1},${r1} 0 ${large} 0 ${x4},${y4}Z`,
            color: seg.color, label: seg.label, lx: seg.lx, ly: seg.ly,
            pct: Math.round(seg.pct * 100),
        };
    });
    return (
        <svg viewBox="0 0 320 144" className="absolute inset-0 h-full w-full">
            {paths.map((p, i) => (
                <path key={i} d={p.d} fill={p.color} opacity="0.85" />
            ))}
            <text x={cx} y={cy - 5} textAnchor="middle" fill="white" fontSize="11" fontWeight="700" opacity="0.9">Budsjett</text>
            <text x={cx} y={cy + 10} textAnchor="middle" fill="white" fontSize="9" opacity="0.55">2026</text>
            {/* Dot + label legend on right */}
            {paths.map((p, i) => (
                <g key={`l${i}`}>
                    <rect x={p.lx} y={p.ly - 7} width="8" height="8" fill={p.color} rx="1" opacity="0.9" />
                    <text x={p.lx + 12} y={p.ly} fill="white" fontSize="9" opacity="0.75">
                        {p.label} {p.pct}%
                    </text>
                </g>
            ))}
        </svg>
    );
}

/* ── City skyline + budget bars — Local Politics ─────────────────────────── */
function CitySkylineSVG({ accent }: { accent: string }) {
    const floor = 122;
    // Silhouette buildings [x, roofY, width]
    const buildings = [
        [8, 98, 20], [32, 78, 16], [52, 86, 22], [78, 62, 14],
        [96, 70, 20], [120, 80, 16], [140, 66, 12], [156, 78, 20],
        [180, 90, 14], [198, 65, 16], [218, 76, 22], [244, 85, 14], [262, 74, 18],
    ];
    // Budget bar chart [label, height]
    const bars: [string, number][] = [
        ["Vei", 52], ["Skole", 70], ["Helse", 58], ["Kultur", 36], ["Adm", 44],
    ];
    const barW = 28, barStart = 285 - bars.length * (barW + 6);
    return (
        <svg viewBox="0 0 320 144" className="absolute inset-0 h-full w-full">
            {/* Skyline fill */}
            {buildings.map(([x, y, w]) => (
                <rect key={x} x={x} y={y} width={w} height={floor - y}
                      fill={accent} opacity="0.2" />
            ))}
            {/* Capitol dome on tallest */}
            <ellipse cx="85" cy="62" rx="11" ry="5" fill={accent} opacity="0.35" />
            <rect x="82" y="62" width="6" height="8" fill={accent} opacity="0.35" />
            {/* Horizon */}
            <line x1="0" y1={floor} x2="320" y2={floor} stroke={accent} strokeWidth="0.8" opacity="0.35" />
            {/* Budget bars (right side) */}
            {bars.map(([label, h], i) => {
                const bx = barStart + i * (barW + 6);
                return (
                    <g key={label}>
                        <rect x={bx} y={floor - h} width={barW} height={h}
                              fill={accent} opacity="0.85" rx="1" />
                        <text x={bx + barW / 2} y={floor + 13} textAnchor="middle"
                              fill="white" fontSize="7" opacity="0.65">{label}</text>
                    </g>
                );
            })}
        </svg>
    );
}

/* ── GDP bar chart with decline — China ──────────────────────────────────── */
function ChinaEconomySVG({ accent }: { accent: string }) {
    const floor = 122;
    const data: [string, number, boolean][] = [
        ["18", 82, true], ["19", 76, true], ["20", 38, false],
        ["21", 78, true], ["22", 58, false], ["23", 52, false],
        ["24", 44, false], ["25", 36, false],
    ];
    const barW = 26, gap = 12;
    const total = data.length * (barW + gap) - gap;
    const startX = (320 - total) / 2;
    return (
        <svg viewBox="0 0 320 144" className="absolute inset-0 h-full w-full">
            {/* Grid */}
            {[40, 75, 110].map(y => (
                <line key={y} x1="10" y1={y} x2="310" y2={y} stroke="white" strokeWidth="0.4" opacity="0.1" />
            ))}
            {data.map(([year, h, up], i) => {
                const bx = startX + i * (barW + gap);
                return (
                    <g key={year}>
                        <rect x={bx} y={floor - h} width={barW} height={h}
                              fill={up ? accent : "#FF4444"}
                              opacity="0.82" rx="2" />
                        <text x={bx + barW / 2} y={floor + 13} textAnchor="middle"
                              fill="white" fontSize="8" opacity="0.55">{year}</text>
                    </g>
                );
            })}
            {/* Trend line */}
            <polyline
                points={data.map(([, h], i) => {
                    const bx = startX + i * (barW + gap) + barW / 2;
                    return `${bx},${floor - h}`;
                }).join(" ")}
                fill="none" stroke={accent} strokeWidth="1.5" opacity="0.6"
            />
            {/* Decline label */}
            <text x="248" y="30" fill="#FF7777" fontSize="9" fontWeight="600" opacity="0.85">▼ Slowdown</text>
        </svg>
    );
}

/* ── Default generic chart ────────────────────────────────────────────────── */
function DefaultChartSVG({ accent }: { accent: string }) {
    const pts = [0, 58, 40, 44, 80, 50, 120, 34, 160, 26, 200, 36, 240, 20, 280, 28, 320, 16];
    return (
        <svg viewBox="0 0 320 144" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
            <polygon
                points={`0,80 ${pts.join(" ")} 320,80`}
                fill={accent} opacity="0.12"
            />
            <polyline points={pts.join(" ")}
                      fill="none" stroke={accent} strokeWidth="2" opacity="0.7"
                      strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

/* ── Dispatch illustration by category ───────────────────────────────────── */
function CategoryIllustration({ category }: { category: string }) {
    const s = getCategoryBadgeStyle(category);
    // Resolve CSS variable to a real hex — use inline fallbacks per category
    const accentMap: Record<string, string> = {
        "Investing & Finance":   "#60a5fa",
        "Investering og finans": "#60a5fa",
        "Personal Economy":      "#5eead4",
        "Personlig økonomi":     "#5eead4",
        "Local Politics":        "#fdba74",
        "Lokalpolitikk":         "#fdba74",
        "AI":                    "#6ee7b7",
        "China":                 "#7dd3fc",
        "Kina":                  "#7dd3fc",
    };
    const accent = accentMap[category] ?? "#a5b4fc";
    void s; // getCategoryBadgeStyle used elsewhere; keep import live

    switch (category) {
        case "Investing & Finance":
        case "Investering og finans": return <CandlestickSVG accent={accent} />;
        case "Personal Economy":
        case "Personlig økonomi":     return <BudgetDonutSVG accent={accent} />;
        case "Local Politics":
        case "Lokalpolitikk":         return <CitySkylineSVG accent={accent} />;
        case "AI":                    return <NeuralNetworkSVG accent={accent} />;
        case "China":
        case "Kina":                  return <ChinaEconomySVG accent={accent} />;
        default:                      return <DefaultChartSVG accent={accent} />;
    }
}

/* ── Thumbnail wrapper ────────────────────────────────────────────────────── */
function ArticleThumbnail({ category, imageUrl }: { category: string; imageUrl?: string | null }) {
    if (imageUrl) {
        return <div className="h-full w-full" style={{ background: `url(${imageUrl}) center/cover no-repeat` }} />;
    }
    const gradient = GRADIENTS[category] ?? DEFAULT_GRADIENT;
    return (
        <div className="relative h-full w-full overflow-hidden" style={{ background: gradient }}>
            <CategoryIllustration category={category} />
        </div>
    );
}

/* ── Card ─────────────────────────────────────────────────────────────────── */
export default function ArticleCard({ slug, title, excerpt, date, category, imageUrl, locale }: ArticleCardProps) {
    const tag = getCategoryBadgeStyle(category);
    const href = locale === "en" ? `/en/blog/${slug}` : `/blog/${slug}`;
    return (
        <Link href={href} className="group block h-full">
            <article
                className="h-full overflow-hidden transition-all duration-200 hover:shadow-lg"
                style={{ background: "var(--t-card)", border: "1px solid var(--t-border-subtle)", borderRadius: 0 }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--t-border-medium)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--t-border-subtle)"; }}
            >
                <div className="relative h-36 w-full overflow-hidden">
                    <ArticleThumbnail category={category} imageUrl={imageUrl} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <div className="absolute bottom-3 left-3">
                        <span
                            className="inline-block px-2 py-0.5 text-xs font-semibold"
                            style={{ background: tag.bg, color: tag.text, borderRadius: 0 }}
                        >
                            {category}
                        </span>
                    </div>
                </div>
                <div className="p-4">
                    <time className="mb-1.5 block text-xs font-medium" style={{ color: "var(--t-text-muted)" }}>
                        {date}
                    </time>
                    <h3 className="mb-1.5 text-sm font-semibold leading-snug transition-colors group-hover:underline" style={{ color: "var(--t-text)" }}>
                        {title}
                    </h3>
                    <p className="line-clamp-2 text-xs leading-relaxed" style={{ color: "var(--t-text-secondary)" }}>
                        {excerpt}
                    </p>
                </div>
            </article>
        </Link>
    );
}
