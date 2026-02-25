"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { Zap, Settings, Info, Check, AlertCircle } from "lucide-react";

// --- GLOBAL THEME VARIABLES ---
const C: Record<string, string> = {
    bg: "var(--t-bg)",
    surface: "var(--t-surface)",
    card: "var(--t-card)",
    border: "var(--t-border-subtle)",
    borderStrong: "var(--t-border-medium)",
    c1: "var(--ch-c1)", // Purple
    c2: "var(--ch-c2)", // Deep Blue
    c3: "var(--ch-c3)", // Teal
    c4: "var(--ch-c4)", // Amber
    c5: "var(--ch-c5)", // Steel Blue
    c6: "var(--ch-c6)", // Plum
    positive: "#1F9D55", // Finance Green (cheaper/savings)
    negative: "#D64545", // Finance Red (more expensive/cost)
    neutralColor: "#6B7280",
    text: "var(--t-text)",
    muted: "var(--t-text-secondary)",
    tooltipBg: "var(--ch-tooltip-bg)",
    tooltipBorder: "var(--ch-border)",
};

const CH = {
    bg: "var(--ch-bg)", // Forced white per strict UI rules
    axisText: "var(--ch-axis-text)",
    positive: "#1F9D55",
    negative: "#D64545",
};

// --- HELPER COMPONENTS ---

const Card = ({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
    <div
        className={`overflow-hidden ${className}`}
        style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 0,
            ...style,
        }}
    >
        {children}
    </div>
);

const PriceCard = ({ title, value, subValue, isCheapest, colorVar, diff }: {
    title: string;
    value: string;
    subValue: string;
    isCheapest: boolean;
    colorVar: string;
    diff: number | null;
}) => (
    <Card
        className="np-price-card"
        style={{
            padding: "16px 16px",
            borderTop: `4px solid ${colorVar}`,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            boxShadow: isCheapest ? `0 4px 20px -4px color-mix(in srgb, ${colorVar} 40%, transparent)` : "0 1px 3px rgba(0,0,0,0.05)",
            background: isCheapest ? "color-mix(in srgb, var(--t-surface) 90%, var(--ch-positive))" : C.card,
            position: "relative",
            overflow: "hidden"
        }}
    >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 className="np-price-title" style={{ fontSize: 13, fontWeight: 700, margin: 0, color: C.text, textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</h3>
            {isCheapest && (
                <span style={{ display: "flex", alignItems: "center", gap: 2, color: C.positive, fontSize: 10, fontWeight: 800, textTransform: "uppercase", background: "color-mix(in srgb, var(--ch-positive) 15%, transparent)", padding: "2px 6px", borderRadius: 4 }}>
                    <Check size={12} strokeWidth={3} /> BEST
                </span>
            )}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap", margin: "4px 0" }}>
            <p className="np-price-val" style={{ fontSize: 24, fontWeight: 800, margin: 0, color: isCheapest ? C.positive : C.text, fontVariantNumeric: "tabular-nums" }}>{value}</p>
            <p className="np-price-sub" style={{ fontSize: 11, color: C.muted, margin: 0 }}>/ år</p>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, paddingTop: 10, borderTop: `1px solid ${isCheapest ? "color-mix(in srgb, var(--ch-positive) 20%, transparent)" : C.border}` }}>
            <span style={{ color: C.muted }}>Mnd snitt: <span style={{ fontWeight: 600, color: C.text }}>{subValue}</span></span>
            {diff !== null && typeof diff === "number" && (
                <span style={{ fontWeight: 600, color: diff > 0 ? C.negative : C.positive }}>
                    {diff > 0 ? "+" : ""}{diff.toLocaleString("nb-NO")}
                </span>
            )}
        </div>
    </Card>
);

// --- MAIN APP ---

export default function NorgesprisKalkulator() {
    // Prevent SSR hydration mismatch for random styles/colors by ensuring mounted state
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    // --- CONFIG & STATE ---
    const [totalForbruk, setTotalForbruk] = useState(35000);
    const [nettleige, setNettleige] = useState(0.30); // Variabelt ledd eks mva
    const [fastledd, setFastledd] = useState(500);   // Fastledd inkl mva
    const [mvaPa, setMvaPa] = useState(true);

    // Strømstøtte parametere
    const [stotteTerskel, setStotteTerskel] = useState(0.77);
    const STOTTE_DEKNINGSGRAD = 0.90;

    // Normaliserte andeler som summerer til 100%
    const [monthlyData, setMonthlyData] = useState([
        { mnd: "Jan", andel: 11.04, spot: 1.19, norgespris: 0.812 },
        { mnd: "Feb", andel: 9.74, spot: 1.10, norgespris: 0.40 },
        { mnd: "Mar", andel: 9.63, spot: 0.60, norgespris: 0.40 },
        { mnd: "Apr", andel: 9.08, spot: 0.50, norgespris: 0.40 },
        { mnd: "Mai", andel: 7.81, spot: 0.30, norgespris: 0.40 },
        { mnd: "Jun", andel: 5.81, spot: 0.20, norgespris: 0.40 },
        { mnd: "Jul", andel: 5.41, spot: 0.20, norgespris: 0.40 },
        { mnd: "Aug", andel: 5.91, spot: 0.30, norgespris: 0.40 },
        { mnd: "Sep", andel: 6.91, spot: 0.50, norgespris: 0.40 },
        { mnd: "Okt", andel: 8.41, spot: 0.50, norgespris: 0.40 },
        { mnd: "Nov", andel: 9.41, spot: 0.70, norgespris: 0.40 },
        { mnd: "Des", andel: 10.84, spot: 1.00, norgespris: 0.40 },
    ]);

    // --- CALCS ---
    const kalkulasjon = useMemo(() => {
        const mvaSats = mvaPa ? 1.25 : 1.0;
        const mndFastleddKost = mvaPa ? fastledd : (fastledd / 1.25);

        let sumSpot = 0;
        let sumStotte = 0;
        let sumNorgespris = 0;

        const data = monthlyData.map((m) => {
            const kwh = totalForbruk * (m.andel / 100);
            const nettleigeVarKost = (nettleige * kwh) * mvaSats;
            const totalNettleieMnd = nettleigeVarKost + mndFastleddKost;

            // 1. Spotpris
            const spotVareKost = (m.spot * kwh) * mvaSats;
            const spotTotal = spotVareKost + totalNettleieMnd;

            // 2. Strømstøtte
            let stotteSats = 0;
            if (m.spot > stotteTerskel) {
                stotteSats = (m.spot - stotteTerskel) * STOTTE_DEKNINGSGRAD;
            }
            const stotteFratrekk = stotteSats * kwh * mvaSats;
            const stotteTotal = spotTotal - stotteFratrekk;

            // 3. Norgespris
            const norgesprisVareKost = (m.norgespris * kwh) * mvaSats;
            const norgesprisTotal = norgesprisVareKost + totalNettleieMnd;

            sumSpot += spotTotal;
            sumStotte += stotteTotal;
            sumNorgespris += norgesprisTotal;

            return {
                ...m,
                spotTotal: Math.round(spotTotal),
                stotteTotal: Math.round(stotteTotal),
                norgesprisTotal: Math.round(norgesprisTotal),
            };
        });

        return {
            maaneder: data,
            totaler: {
                spot: Math.round(sumSpot),
                stotte: Math.round(sumStotte),
                norgespris: Math.round(sumNorgespris),
            },
        };
    }, [monthlyData, totalForbruk, nettleige, fastledd, mvaPa, stotteTerskel]);

    // --- HELPERS ---
    const updateMonth = (index: number, field: string, value: string) => {
        const newData = [...monthlyData];
        // @ts-ignore dynamic field access
        newData[index][field] = parseFloat(value) || 0;
        setMonthlyData(newData);
    };

    const formatNOK = (val: number) =>
        new Intl.NumberFormat("nb-NO", {
            style: "currency",
            currency: "NOK",
            maximumFractionDigits: 0,
        }).format(val);

    const sumAndel = monthlyData.reduce((acc, curr) => acc + curr.andel, 0);
    const is100Percent = Math.abs(sumAndel - 100) < 0.01;

    const totals = [
        { key: "spot", val: kalkulasjon.totaler.spot },
        { key: "stotte", val: kalkulasjon.totaler.stotte },
        { key: "norgespris", val: kalkulasjon.totaler.norgespris },
    ];
    const minVal = Math.min(...totals.map((t) => t.val));
    const cheapestKey = totals.find((t) => t.val === minVal)?.key;

    if (!mounted) return null;

    return (
        <div style={{ background: C.bg, minHeight: "100vh", paddingBottom: 60 }}>
            {/* INJECT CALC-SPECIFIC RESPONSIVE STYLES */}
            <style jsx global>{`
                input[type='range'] {
                    -webkit-appearance: none;
                    background: transparent;
                }
                input[type='range']::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    height: 16px;
                    width: 16px;
                    border-radius: 50%;
                    background: var(--ch-c1);
                    cursor: pointer;
                    margin-top: -6px;
                }
                input[type='range']::-webkit-slider-runnable-track {
                    width: 100%;
                    height: 4px;
                    cursor: pointer;
                    background: var(--t-border-strong);
                    border-radius: 2px;
                }
                .np-input {
                    width: 100%;
                    padding: 8px 12px;
                    background: var(--t-surface);
                    border: 1px solid var(--t-border-subtle);
                    border-radius: 4px;
                    color: var(--t-text);
                    outline: none;
                    transition: border-color 0.2s;
                    text-align: right;
                    font-weight: 600;
                }
                .np-input:focus {
                    border-color: var(--ch-c1);
                }
                .np-table-input {
                    width: 100%;
                    padding: 4px 8px;
                    background: var(--t-surface);
                    border: 1px solid var(--t-border-subtle);
                    border-radius: 2px;
                    color: var(--t-text);
                    outline: none;
                }
                .np-table-input:focus {
                    border-color: var(--ch-c1);
                }
                
                .np-kpi-grid { width: 100%; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
                
                @media (max-width: 1024px) {
                    .np-main-grid { display: flex !important; flex-direction: column !important; }
                    .np-col-wrapper { display: contents !important; }
                    .np-item-inputs { order: 1; margin-bottom: 16px; }
                    .np-item-kpis { order: 2; width: 100%; margin-bottom: 16px; }
                    .np-item-table { order: 4; width: 100%; margin-bottom: 16px; }
                    .np-item-chart { order: 3; width: 100%; margin-bottom: 16px; }
                    .np-kpi-grid { gap: 8px !important; margin-bottom: 0px !important; }
                    .np-price-card { padding: 12px 10px !important; }
                    .np-price-title { font-size: 10px !important; letter-spacing: 0px !important; }
                    .np-price-val { font-size: 16px !important; }
                    .np-price-sub { font-size: 9px !important; }
                    .recharts-responsive-container { min-width: 0 !important; }
                }
                @media (max-width: 640px) {
                    .np-input-card { padding: 16px !important; }
                    .np-input-grid { display: flex !important; flex-wrap: wrap !important; justify-content: space-between !important; gap: 8px !important; }
                    .np-input-label { font-size: 9px !important; text-align: center; }
                    .np-input { padding: 6px 4px !important; text-align: center; font-size: 12px !important; }
                    .np-input-wrap { flex: 1; min-width: 0; }
                    .np-kpi-grid { gap: 6px !important; }
                    .np-price-card { padding: 8px 6px !important; gap: 8px !important; }
                    .np-price-val { font-size: 13px !important; word-break: break-all; }
                    .np-chart-wrapper { height: 350px !important; flex: none !important; }
                }
            `}</style>

            <div className="mx-auto max-w-[90rem]" style={{ padding: "20px 16px", paddingTop: "calc(var(--nav-height) + 20px)", minWidth: 0, overflowX: "hidden" }}>

                {/* HEADER */}
                <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ background: C.c1, color: "#fff", padding: 8, borderRadius: 8 }}>
                            <Zap size={24} />
                        </div>
                        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: C.text }}>
                            Strømkalkulator <span style={{ fontWeight: 400, color: C.muted }}>| Norgespris</span>
                        </h1>
                    </div>
                </div>

                <div className="np-main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: 24, alignItems: "flex-start", minWidth: 0 }}>
                    {/* LEFT COL: INPUTS & TABLE (1/4) */}
                    <div className="np-col-wrapper" style={{ display: "flex", flexDirection: "column", gap: 24, minWidth: 0 }}>
                        <Card className="np-input-card np-item-inputs" style={{ padding: 24 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <Settings color={C.muted} size={18} />
                                    <h2 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: "0.05em" }}>Føresetnader</h2>
                                </div>
                                <div style={{ display: "flex", background: C.surface, padding: 2, borderRadius: 4, border: `1px solid ${C.border}` }}>
                                    <button
                                        onClick={() => setMvaPa(false)}
                                        style={{
                                            padding: "4px 8px", fontSize: 11, fontWeight: 600, borderRadius: 2,
                                            background: !mvaPa ? C.card : "transparent", color: !mvaPa ? C.text : C.muted,
                                            boxShadow: !mvaPa ? "0 1px 2px rgba(0,0,0,0.05)" : "none", border: "none", cursor: "pointer"
                                        }}
                                    >Eks. MVA</button>
                                    <button
                                        onClick={() => setMvaPa(true)}
                                        style={{
                                            padding: "4px 8px", fontSize: 11, fontWeight: 600, borderRadius: 2,
                                            background: mvaPa ? C.card : "transparent", color: mvaPa ? C.text : C.muted,
                                            boxShadow: mvaPa ? "0 1px 2px rgba(0,0,0,0.05)" : "none", border: "none", cursor: "pointer"
                                        }}
                                    >Inkl. MVA</button>
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 32, alignItems: "center", padding: "12px 0 0" }}>
                                {/* Top: Årsforbruk Slider (Centered) */}
                                <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <div style={{ display: "flex", alignItems: "center", marginBottom: 16, gap: 8, justifyContent: "center" }}>
                                        <label className="np-input-label" style={{ fontSize: 13, fontWeight: 700, color: C.muted, textTransform: "uppercase" }}>Årsforbruk</label>
                                        <div style={{ fontSize: 24, fontWeight: 800, color: C.c1, fontVariantNumeric: "tabular-nums" }}>
                                            {totalForbruk.toLocaleString("nb-NO")}
                                            <span style={{ fontSize: 15, fontWeight: 600, color: C.muted, marginLeft: 6 }}>kWh</span>
                                        </div>
                                    </div>
                                    <input type="range" min="5000" max="50000" step="1000" value={totalForbruk} onChange={(e) => setTotalForbruk(Number(e.target.value))} style={{ width: "100%", margin: "0 auto", accentColor: C.c1 }} />
                                </div>

                                {/* Bottom: 3 Small inputs side-by-side */}
                                <div className="np-input-grid" style={{ display: "flex", justifyContent: "space-between", gap: 12, width: "100%", maxWidth: "100%" }}>
                                    <div className="np-input-wrap" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                                        <label className="np-input-label" style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>Nettleige</label>
                                        <div style={{ position: "relative", width: "100%" }}>
                                            <input type="number" step="0.01" value={nettleige} onChange={(e) => setNettleige(Number(e.target.value))} className="np-input" style={{ width: "100%", padding: "8px 24px 8px 8px", fontSize: 14, textAlign: "center", fontWeight: 700, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, minWidth: 0 }} />
                                            <span style={{ position: "absolute", right: 8, top: 9, fontSize: 11, color: C.muted }}>kr</span>
                                        </div>
                                    </div>
                                    <div className="np-input-wrap" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                                        <label className="np-input-label" style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>Effektledd</label>
                                        <div style={{ position: "relative", width: "100%" }}>
                                            <input type="number" step="10" value={fastledd} onChange={(e) => setFastledd(Number(e.target.value))} className="np-input" style={{ width: "100%", padding: "8px 24px 8px 8px", fontSize: 14, textAlign: "center", fontWeight: 700, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, minWidth: 0 }} />
                                            <span style={{ position: "absolute", right: 8, top: 9, fontSize: 11, color: C.muted }}>kr</span>
                                        </div>
                                    </div>
                                    <div className="np-input-wrap" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                                        <label className="np-input-label" style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>Strømstøtte</label>
                                        <div style={{ position: "relative", width: "100%" }}>
                                            <input type="number" step="0.01" value={stotteTerskel} onChange={(e) => setStotteTerskel(Number(e.target.value))} className="np-input" style={{ width: "100%", padding: "8px 24px 8px 8px", fontSize: 14, textAlign: "center", fontWeight: 700, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, minWidth: 0 }} />
                                            <span style={{ position: "absolute", right: 8, top: 9, fontSize: 11, color: C.muted }}>kr</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* TABLE UNDER INPUTS */}
                        <Card className="np-item-table" style={{ display: "flex", flexDirection: "column", minWidth: 0, width: "100%", flex: 1, maxHeight: 600 }}>
                            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: C.surface, flexWrap: "wrap", gap: 8 }}>
                                <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: "0.05em" }}>Detaljert Datagrunnlag</h3>
                            </div>

                            <div style={{ flex: 1, overflowY: "auto", overflowX: "auto", minWidth: 0 }}>
                                <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse", minWidth: 280 }}>
                                    <thead style={{ position: "sticky", top: 0, zIndex: 10, background: C.surface, color: C.muted, fontSize: 10, textTransform: "uppercase" }}>
                                        <tr>
                                            <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600 }}>Mnd</th>
                                            <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600 }}>Spot</th>
                                            <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600 }}>Norg.pris</th>
                                            <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600 }}>Andel%</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {monthlyData.map((row, i) => (
                                            <tr key={row.mnd} style={{ borderBottom: `1px solid ${C.border}` }}>
                                                <td style={{ padding: "6px 12px", fontWeight: 600, color: C.text }}>{row.mnd}</td>
                                                <td style={{ padding: "6px 12px" }}>
                                                    <input type="number" step="0.01" value={row.spot} onChange={(e) => updateMonth(i, "spot", e.target.value)} className="np-table-input" style={{ textAlign: "right" }} />
                                                </td>
                                                <td style={{ padding: "6px 12px" }}>
                                                    <input type="number" step="0.001" value={row.norgespris} onChange={(e) => updateMonth(i, "norgespris", e.target.value)} className="np-table-input" style={{ textAlign: "right", borderColor: row.mnd === "Jan" ? C.c4 : C.border, color: row.mnd === "Jan" ? C.c4 : C.text, fontWeight: row.mnd === "Jan" ? 700 : 400 }} />
                                                </td>
                                                <td style={{ padding: "6px 12px" }}>
                                                    <input type="number" step="0.1" value={row.andel} onChange={(e) => updateMonth(i, "andel", e.target.value)} className="np-table-input" style={{ textAlign: "right" }} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot style={{
                                        position: "sticky", bottom: 0,
                                        background: is100Percent ? "color-mix(in srgb, var(--ch-positive) 15%, var(--t-surface))" : "color-mix(in srgb, var(--ch-negative) 15%, var(--t-surface))",
                                        color: is100Percent ? C.positive : C.negative, fontWeight: 700,
                                        borderTop: `1px solid ${is100Percent ? C.positive : C.negative}`
                                    }}>
                                        <tr>
                                            <td colSpan={3} style={{ padding: "8px 12px", textAlign: "right", fontSize: 11 }}>SUM ANDEL:</td>
                                            <td style={{ padding: "8px 12px", textAlign: "right", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 4, fontSize: 11 }}>
                                                {sumAndel.toFixed(2)}%
                                                {!is100Percent && <AlertCircle size={12} />}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </Card>
                    </div>

                    {/* RIGHT COL: CHARTS & KPIs (3/4) */}
                    <div className="np-col-wrapper" style={{ display: "flex", flexDirection: "column", gap: 24, minWidth: 0, height: "100%" }}>
                        {/* KPI CARDS */}
                        <div className="np-kpi-grid np-item-kpis">
                            <PriceCard
                                title="Spotpris"
                                value={formatNOK(kalkulasjon.totaler.spot)}
                                subValue={formatNOK(kalkulasjon.totaler.spot / 12)}
                                isCheapest={cheapestKey === "spot"}
                                colorVar={C.c5} // Steel Blue
                                diff={cheapestKey === "spot" ? null : kalkulasjon.totaler.spot - minVal}
                            />
                            <PriceCard
                                title="Med Strømstøtte"
                                value={formatNOK(kalkulasjon.totaler.stotte)}
                                subValue={formatNOK(kalkulasjon.totaler.stotte / 12)}
                                isCheapest={cheapestKey === "stotte"}
                                colorVar={C.c3} // Teal
                                diff={cheapestKey === "stotte" ? null : kalkulasjon.totaler.stotte - minVal}
                            />
                            <PriceCard
                                title="Norgespris"
                                value={formatNOK(kalkulasjon.totaler.norgespris)}
                                subValue={formatNOK(kalkulasjon.totaler.norgespris / 12)}
                                isCheapest={cheapestKey === "norgespris"}
                                colorVar={C.c1} // Purple
                                diff={cheapestKey === "norgespris" ? null : kalkulasjon.totaler.norgespris - minVal}
                            />
                        </div>

                        {/* CHART */}
                        <Card className="np-item-chart" style={{ padding: "20px 16px", overflowX: "auto", minWidth: 0, width: "100%", flex: 1, minHeight: 400, display: "flex", flexDirection: "column" }}>
                            <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: C.text }}>Månedlig kostnadsutvikling</h3>
                            <div className="np-chart-wrapper" style={{ width: "100%", flex: 1, minHeight: 350, position: "relative" }}>
                                {mounted && (
                                    <ResponsiveContainer width="99%" height="100%" minHeight={350} minWidth={100} style={{ backgroundColor: CH.bg, borderRadius: 4 }}>
                                        <BarChart data={kalkulasjon.maaneder} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CH.axisText} opacity={0.2} />
                                            <XAxis dataKey="mnd" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: CH.axisText }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: CH.axisText }} tickFormatter={(val) => `${val.toLocaleString("nb-NO")}`} width={55} dx={-10} />
                                            <Tooltip
                                                cursor={{ fill: "transparent" }}
                                                contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: 12, color: C.text, padding: "12px 16px" }}
                                                itemStyle={{ fontSize: 13, fontWeight: 600, padding: "2px 0" }}
                                                labelStyle={{ fontWeight: 700, marginBottom: 8, color: C.muted, textTransform: "uppercase", fontSize: 10, letterSpacing: "0.05em", borderBottom: `1px solid ${C.border}`, paddingBottom: 4 }}
                                                formatter={(value: any) => [`${Number(value).toLocaleString("nb-NO")} kr`, ""]}
                                            />
                                            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 20, color: C.muted }} iconType="circle" />

                                            <Bar dataKey="spotTotal" name="Spotpris inkl. avgifter" fill={C.c5} radius={[4, 4, 0, 0]} maxBarSize={40} />
                                            <Bar dataKey="stotteTotal" name="Etter Strømstøtte" fill={C.c3} radius={[4, 4, 0, 0]} maxBarSize={40} />
                                            <Bar dataKey="norgesprisTotal" name="Norgespris" fill={C.c1} radius={[4, 4, 0, 0]} maxBarSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
