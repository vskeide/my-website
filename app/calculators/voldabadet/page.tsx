"use client";

import { useState, useMemo, useEffect } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer, Cell, ReferenceLine,
    PieChart, Pie,
} from "recharts";
import { useTheme } from "@/components/ThemeProvider";

// ─── palette (CSS variables for DOM elements) ─────────────────────────────────
const C: Record<string, string> = {
    bg: "var(--ch-bg)",
    card: "var(--t-card)",
    border: "var(--t-border-strong)",
    c1: "var(--ch-c1)",
    c2: "var(--ch-c2)",
    c3: "var(--ch-c3)",
    c4: "var(--ch-c4)",
    c5: "var(--ch-c5)",
    c6: "var(--ch-c6)",
    c7: "var(--ch-c7)",
    c8: "var(--ch-c8)",
    text: "var(--t-text)",
    muted: "var(--t-text-secondary)",
    tooltipBg: "var(--ch-tooltip-bg)",
    axisText: "var(--ch-axis-text, #1f2937)",
    grid: "var(--t-border-subtle, #e2e8f0)",
};

// ─── constants ───────────────────────────────────────────────────────────────
const ADULTS = 8800;
const POPULATION = 11000;
const HOUSEHOLDS = 5200;
const LOAN_YEARS = 20;

const DEFAULT_INVESTMENT = 230;
const DEFAULT_RATE = 4.0;

const DRIFT_DEFAULTS = [
    { key: "strom", name: "Strøm", value: 3_000_000, colorKey: "c5" }, // yellow
    { key: "bad", name: "Badevakter", value: 2_400_000, colorKey: "c3" }, // cyan
    { key: "tilsette", name: "Andre tilsette", value: 4_200_000, colorKey: "c8" }, // grey
    { key: "kjemi", name: "Kjemikaliar mm", value: 500_000, colorKey: "c7" }, // purple
];
const DEFAULT_BILLETTSAL = 4_000_000;

const ARSKORT_MAP: Record<string, number> = {
    "Singel": 3600, "2 vaksne": 4680, "Vaksen+barn": 4680,
    "2v+1b": 5680, "2v+2b": 6680, "2v+3b": 7280,
    "2v+4b": 7880, "2v+5b": 8480,
};
const HH_CONFIG = [
    { type: "Singel", adults: 1, kids: 0 },
    { type: "2 vaksne", adults: 2, kids: 0 },
    { type: "Vaksen+barn", adults: 1, kids: 1 },
    { type: "2v+1b", adults: 2, kids: 1 },
    { type: "2v+2b", adults: 2, kids: 2 },
    { type: "2v+3b", adults: 2, kids: 3 },
    { type: "2v+4b", adults: 2, kids: 4 },
    { type: "2v+5b", adults: 2, kids: 5 },
];

// ─── household icon ──────────────────────────────────────────────────────────
const HouseholdIcon = ({ adults, kids, size = 44 }: { adults: number; kids: number; size?: number }) => {
    const figures = [
        ...Array(adults).fill("adult"),
        ...Array(kids).fill("child"),
    ];
    const total = figures.length;
    const slotW = size / Math.max(total, 3);
    const svgW = Math.max(size, total * slotW);

    return (
        <svg width={svgW} height={size} viewBox={`0 0 ${svgW} ${size}`}
            style={{ display: "block" }} aria-hidden="true">
            {figures.map((type, i) => {
                const isAdult = type === "adult";
                const cx = slotW * i + slotW / 2;
                const headR = isAdult ? 5 : 3.5;
                const bodyH = isAdult ? 14 : 10;
                const bodyW = isAdult ? 5 : 3.5;
                const topPad = isAdult ? 2 : 6;
                const headY = topPad + headR;
                const bodyY1 = headY + headR + 1;
                const color = isAdult ? "#94a3b8" : "#60a5fa";
                return (
                    <g key={i}>
                        <circle cx={cx} cy={headY} r={headR} fill={color} />
                        <rect x={cx - bodyW / 2} y={bodyY1} width={bodyW} height={bodyH} rx={bodyW / 2} fill={color} />
                    </g>
                );
            })}
        </svg>
    );
};

// ─── core calc ───────────────────────────────────────────────────────────────
function calcAll(investment: number, rate: number, netDrift: number) {
    const rente = investment * (rate / 100);
    const avskriving = investment / LOAN_YEARS;
    const kapital = rente + avskriving;
    const totalBurden = kapital * 1e6 + netDrift;
    const perAdult = totalBurden / ADULTS;
    const flatPerPerson = totalBurden / POPULATION;
    const kapFrac = (kapital * 1e6) / totalBurden;

    const households = HH_CONFIG.map(({ type, adults, kids }) => {
        const persons = adults + kids;
        const arskort = ARSKORT_MAP[type];
        const taxShare = adults * perAdult;
        const total = taxShare + arskort;
        const renteDel = Math.round(taxShare * kapFrac * (rente / kapital));
        const avskrivDel = Math.round(taxShare * kapFrac * (avskriving / kapital));
        const driftDel = Math.round(taxShare * (1 - kapFrac));
        const subsidiePerPers = Math.round(taxShare / persons - flatPerPerson);
        const subsidiePerHH = Math.round(taxShare - flatPerPerson * persons);
        return {
            type, adults, kids, persons, arskort,
            taxShare: Math.round(taxShare), renteDel, avskrivDel, driftDel,
            total: Math.round(total), subsidiePerPers, subsidiePerHH,
        };
    });

    return { rente, avskriving, kapital, perAdult, flatPerPerson, totalBurden, households };
}

// ─── helpers ─────────────────────────────────────────────────────────────────
const nok = (v: number) => Math.round(v).toLocaleString("nb-NO") + " kr";
const fmtM = (v: number) => (v / 1e6).toFixed(1);

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── tooltips ──────────────────────────────────────────────────────────────────
const DarkTip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: C.tooltipBg, border: `1px solid ${C.border}`, borderRadius: 0, padding: "10px 14px", maxWidth: 280 }}>
            <p style={{ color: C.text, fontWeight: 700, marginBottom: 6, fontSize: 13 }}>{label}</p>
            {payload.filter((p: any) => p.dataKey !== "_total").map((p: any, i: number) => (
                <p key={i} style={{ color: p.color || C.text, fontSize: 12, margin: "2px 0" }}>
                    {p.name}: {Math.round(p.value).toLocaleString("nb-NO")} kr
                </p>
            ))}
        </div>
    );
};

const SubsidieTip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const v = payload[0]?.value ?? 0;
    return (
        <div style={{ background: C.tooltipBg, border: `1px solid ${C.border}`, borderRadius: 0, padding: "10px 14px", maxWidth: 270 }}>
            <p style={{ color: C.text, fontWeight: 700, marginBottom: 4, fontSize: 13 }}>{label}</p>
            <p style={{ color: v > 0 ? C.c4 : v < 0 ? C.c6 : C.muted, fontSize: 12, margin: 0 }}>
                {v > 0 ? `Betalar ${Math.abs(v).toLocaleString("nb-NO")} kr meir per pers enn flat fordeling`
                    : v < 0 ? `Sparer ${Math.abs(v).toLocaleString("nb-NO")} kr per pers vs flat fordeling`
                        : "Lik flat fordeling"}
            </p>
        </div>
    );
};

const PieTip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: C.tooltipBg, border: `1px solid ${C.border}`, borderRadius: 0, padding: "10px 14px" }}>
            <p style={{ color: C.text, fontWeight: 700, fontSize: 13, margin: "0 0 3px" }}>{payload[0].name}</p>
            <p style={{ color: payload[0].payload.color, fontSize: 12, margin: 0 }}>
                {fmtM(payload[0].value)} MNOK ({(payload[0].payload.percent * 100).toFixed(1)}%)
            </p>
        </div>
    );
};

const TotalBarLabel = ({ x, y, width, value }: any) => {
    if (!value) return null;
    return (
        <text x={x + width / 2} y={y - 6} fill="#000000" textAnchor="middle" fontSize={11} fontWeight={700}>
            {Math.round(value).toLocaleString("nb-NO")}
        </text>
    );
};

// ─── Compact Slider ───────────────────────────────────────────────────────────
const Slider = ({ label, value, min, max, step, onChange, format, color }: {
    label: string; value: number; min: number; max: number; step: number;
    onChange: (v: number) => void; format: (v: number) => string; color?: string;
}) => (
    <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
            <span style={{ fontSize: 11, color: C.muted, lineHeight: 1.3 }}>{label}</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: color || C.accent, marginLeft: 10, whiteSpace: "nowrap" }}>
                {format(value)}
            </span>
        </div>
        <input type="range" min={min} max={max} step={step} value={value}
            onChange={e => onChange(Number(e.target.value))}
            style={{ width: "100%", accentColor: color || "var(--ch-accent)", cursor: "pointer", height: 4 }} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
            <span style={{ fontSize: 10, color: C.muted }}>{format(min)}</span>
            <span style={{ fontSize: 10, color: C.muted }}>{format(max)}</span>
        </div>
    </div>
);

// ─── Editable cost row ────────────────────────────────────────────────────────
const CostInput = ({ name, value, color, onChange, isIncome }: {
    name: string; value: number; color: string;
    onChange: (v: number) => void; isIncome?: boolean;
}) => {
    const [editing, setEditing] = useState(false);
    const [raw, setRaw] = useState("");

    const startEdit = () => { setRaw((value / 1_000_000).toFixed(2)); setEditing(true); };
    const commit = () => {
        const v = parseFloat(raw.replace(",", "."));
        if (!isNaN(v) && v >= 0) onChange(Math.round(v * 1_000_000));
        setEditing(false);
    };

    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 11 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: C.text }}>{name}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {isIncome && <span style={{ color: C.c6, fontSize: 12 }}>−</span>}
                {editing ? (
                    <input
                        autoFocus
                        value={raw}
                        onChange={e => setRaw(e.target.value)}
                        onBlur={commit}
                        onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
                        style={{
                            width: 72, background: C.tooltipBg, border: `1px solid ${C.border}`,
                            borderRadius: 5, color: C.text, fontSize: 13, fontWeight: 700,
                            padding: "3px 7px", textAlign: "right", outline: "none",
                        }}
                    />
                ) : (
                    <button onClick={startEdit} title="Klikk for å endre"
                        style={{
                            background: "transparent", border: `1px solid ${C.border}`, borderRadius: 5,
                            color: C.text, fontSize: 13, fontWeight: 700,
                            padding: "3px 10px", cursor: "pointer", transition: "border-color 0.15s",
                            minWidth: 72, textAlign: "right",
                        }}>
                        {fmtM(value)}
                    </button>
                )}
                <span style={{ color: C.muted, fontSize: 12 }}>MNOK</span>
            </div>
        </div>
    );
};

const InfoBox = ({ children, color = "59,130,246" }: { children: React.ReactNode; color?: string }) => (
    <div style={{
        background: `rgba(${color},0.07)`, border: `1px solid rgba(${color},0.22)`,
        borderRadius: 0, padding: "13px 16px", marginBottom: 20
    }}>
        <p style={{ margin: 0, fontSize: 13, color: C.muted, lineHeight: 1.75 }}>{children}</p>
    </div>
);

const StatCard = ({ label, val, sub, c }: { label: string; val: string; sub?: string; c: string }) => (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 0, padding: "10px 12px" }}>
        <p style={{ color: C.muted, fontSize: 9, margin: "0 0 3px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
        <p style={{ color: c, fontSize: 16, fontWeight: 800, margin: "0 0 2px" }}>{val}</p>
        {sub && <p style={{ color: C.muted, fontSize: 10, margin: 0 }}>{sub}</p>}
    </div>
);

// ─── main ─────────────────────────────────────────────────────────────────────
export default function VoldabadViz() {
    const CH = C;
    const [tab, setTab] = useState("overview");
    const [selected, setSelected] = useState<ReturnType<typeof calcAll>["households"][number] | null>(null);
    const [investment, setInvestment] = useState(DEFAULT_INVESTMENT);
    const [rate, setRate] = useState(DEFAULT_RATE);

    const [driftValues, setDriftValues] = useState(
        Object.fromEntries(DRIFT_DEFAULTS.map(d => [d.key, d.value]))
    );
    const [billettsal, setBillettsal] = useState(DEFAULT_BILLETTSAL);

    const updateDrift = (key: string, val: number) => setDriftValues(prev => ({ ...prev, [key]: val }));

    const grossDrift = Object.values(driftValues).reduce((a, b) => a + b, 0);
    const netDrift = grossDrift - billettsal;

    const isDefault = investment === DEFAULT_INVESTMENT && rate === DEFAULT_RATE
        && billettsal === DEFAULT_BILLETTSAL
        && DRIFT_DEFAULTS.every(d => driftValues[d.key] === d.value);

    const reset = () => {
        setInvestment(DEFAULT_INVESTMENT);
        setRate(DEFAULT_RATE);
        setBillettsal(DEFAULT_BILLETTSAL);
        setDriftValues(Object.fromEntries(DRIFT_DEFAULTS.map(d => [d.key, d.value])));
    };

    const { rente, avskriving, kapital, perAdult, flatPerPerson, totalBurden, households } =
        useMemo(() => calcAll(investment, rate, netDrift), [investment, rate, netDrift]);

    const totalBurdenMNOK = totalBurden / 1e6;
    const perPersonRounded = Math.round(flatPerPerson);
    const perAdultRounded = Math.round(perAdult);
    const Y_MAX = 25000;

    const pieData = [
        { name: "Renter", value: rente * 1e6, color: CH.c1, percent: 0, isIncome: false },
        { name: "Avskriving", value: avskriving * 1e6, color: CH.c2, percent: 0, isIncome: false },
        ...DRIFT_DEFAULTS.map(d => ({ name: d.name, value: driftValues[d.key], color: CH[d.colorKey], percent: 0, isIncome: false })),
        { name: "Billettsal (inntekt)", value: billettsal, color: CH.c6, percent: 0, isIncome: true },
    ];
    const totalCosts = pieData.filter(d => !d.isIncome).reduce((s, d) => s + d.value, 0);
    pieData.forEach(d => { d.percent = d.value / totalCosts; });
    const pieDataPositive = pieData.filter(d => !d.isIncome);

    const stackedData = households.map(h => ({
        type: h.type,
        "Renter (skatt)": h.renteDel,
        "Avskriving (skatt)": h.avskrivDel,
        "Netto drift (skatt)": h.driftDel,
        "Brukarbetaling": h.arskort,
        _total: h.total,
    }));

    const TABS = [
        { id: "overview", label: "Nøkkeltal" },
        { id: "household", label: "Husstandstypar" },
        { id: "costs", label: "Kostnadar" },
        { id: "subsidy", label: "Subsidie" },
    ];

    return (
        <div style={{ minHeight: "100vh", color: C.text }}>
            <style>{`
                @media (max-width: 1024px) {
                    .vb-main-layout { grid-template-columns: 1fr !important; }
                    .vb-grid-2 { grid-template-columns: 1fr !important; }
                }
                @media (max-width: 640px) {
                    .vb-grid-3 { grid-template-columns: repeat(auto-fit, minmax(90px,1fr)) !important; }
                    .vb-stat-grid { grid-template-columns: 1fr 1fr !important; }
                }
            `}</style>
            <div className="mx-auto max-w-[90rem]" style={{ padding: "20px 16px", paddingTop: "calc(var(--nav-height) + 20px)" }}>

                {/* header */}
                <div style={{ marginBottom: 22 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 5 }}>
                        <div style={{ width: 4, height: 28, background: C.c1, borderRadius: 2 }} />
                        <h1 style={{ fontSize: 21, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
                            Voldabadet — Kostnadsanalyse
                        </h1>
                    </div>
                    <p style={{ color: C.muted, margin: 0, fontSize: 13, paddingLeft: 16 }}>
                        Kva kostar symjeanlegget kvar innbyggar — gjennom kommuneskatten og som brukarbetaling?
                    </p>
                </div>

                <div className="vb-main-layout" style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: 20, alignItems: "flex-start" }}>

                    {/* Left Column: Inputs & Summary (1/4) */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {/* inputs */}
                        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 0, padding: "16px 20px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                                <div>
                                    <h3 style={{
                                        margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: C.text,
                                        textTransform: "uppercase", letterSpacing: "0.05em"
                                    }}>Juster føresetnadane</h3>
                                    <p style={{ color: C.muted, fontSize: 11, margin: 0 }}>Diagram oppdaterast automatisk.</p>
                                </div>
                                <button onClick={reset} disabled={isDefault}
                                    style={{
                                        background: isDefault ? "transparent" : "var(--t-text)",
                                        border: `1px solid ${isDefault ? "var(--t-border-subtle)" : "transparent"}`,
                                        color: isDefault ? "var(--t-text-muted)" : "var(--t-bg)",
                                        borderRadius: 4, padding: "4px 10px", fontSize: 10, fontWeight: 600,
                                        cursor: isDefault ? "default" : "pointer", transition: "all 0.15s",
                                    }}>
                                    ↩ Nullstill
                                </button>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 16 }}>
                                <Slider label="Investeringskost (MNOK)"
                                    value={investment} min={50} max={350} step={5}
                                    onChange={setInvestment} format={v => `${v}`} color={C.c2} />
                                <Slider label="Rente (%)" value={rate} min={2} max={8} step={0.25}
                                    onChange={setRate} format={v => `${v.toFixed(2)}%`} color={C.c1} />
                            </div>

                            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
                                <h4 style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Drift og Inntekter</h4>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    {DRIFT_DEFAULTS.map(d => (
                                        <CostInput key={d.key} name={d.name} value={driftValues[d.key]}
                                            color={C[d.colorKey]} onChange={val => updateDrift(d.key, val)} />
                                    ))}
                                    <CostInput name="Billettsal (inntekt)" value={billettsal}
                                        color={C.c6} onChange={setBillettsal} isIncome />
                                </div>
                            </div>
                        </div>

                        {/* Summary stat cards */}
                        <div className="vb-stat-grid" style={{ background: C.card, border: `1px solid ${C.border}`, padding: "16px 20px" }}>
                            <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.05em", color: C.text }}>Årleg samandrag</h3>

                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                <span style={{ fontSize: 13, color: C.muted }}>Kapitalkostnad</span>
                                <span style={{ fontSize: 13, fontWeight: 600 }}>{kapital.toFixed(1)} MNOK</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                <span style={{ fontSize: 13, color: C.muted }}>Netto drift</span>
                                <span style={{ fontSize: 13, fontWeight: 600 }}>{fmtM(netDrift)} MNOK</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                                <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Total byrde</span>
                                <span style={{ fontSize: 14, fontWeight: 800 }}>{totalBurdenMNOK.toFixed(1)} MNOK</span>
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, paddingTop: 16, borderTop: `1px dashed ${C.border}` }}>
                                <span style={{ fontSize: 12, color: C.muted }}>Per vaksen</span>
                                <span style={{ fontSize: 13, fontWeight: 600 }}>{perAdultRounded.toLocaleString("nb-NO")} kr</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                                <span style={{ fontSize: 12, color: C.muted }}>Per innb.</span>
                                <span style={{ fontSize: 13, fontWeight: 600 }}>{perPersonRounded.toLocaleString("nb-NO")} kr</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Tabs & Visualizations (3/4) */}
                    <div>
                        {/* tabs */}
                        <div style={{ background: "#000000", borderRadius: 4, marginBottom: 16, display: "flex", overflow: "hidden" }}>
                            {TABS.map(t => (
                                <button key={t.id} onClick={() => setTab(t.id)} style={{
                                    background: tab === t.id ? C.c1 : "transparent",
                                    border: "none",
                                    color: tab === t.id ? "#ffffff" : "#a1a1aa",
                                    fontWeight: tab === t.id ? 600 : 400,
                                    fontSize: 14, cursor: "pointer", padding: "12px 24px",
                                    transition: "all 0.15s",
                                    flex: "1 1 auto"
                                }}>{t.label}</button>
                            ))}
                        </div>

                        {/* tab content */}
                        <div style={{ minHeight: "400px" }}>
                            {/* ══ OVERVIEW ══ */}
                            {tab === "overview" && (
                                <div>
                                    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 0, padding: 24, marginBottom: 20 }}>
                                        <h3 style={{ margin: "0 0 5px", fontSize: 15, fontWeight: 700 }}>Total kostnad per husstandstype (kr/år)</h3>
                                        <p style={{ color: C.muted, fontSize: 12, margin: "0 0 20px" }}>
                                            Nedste tre delar = skatt (betalast uansett). Y-aksen er fast.
                                        </p>
                                        <div style={{ position: "relative" }}>
                                            <ResponsiveContainer width="100%" height={490} style={{ backgroundColor: CH.bg, borderRadius: 4 }}>
                                                <BarChart data={stackedData} margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                    <XAxis dataKey="type" tick={{ fill: CH.axisText, fontSize: 11 }} />
                                                    <YAxis domain={[0, Y_MAX]} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fill: CH.axisText, fontSize: 11 }} />

                                                    <Bar dataKey="Renter (skatt)" stackId="a" fill={CH.c1} isAnimationActive={false} />
                                                    <Bar dataKey="Avskriving (skatt)" stackId="a" fill={CH.c2} isAnimationActive={false} />
                                                    <Bar dataKey="Netto drift (skatt)" stackId="a" fill={CH.c3} isAnimationActive={false} />
                                                    <Bar dataKey="Brukarbetaling" stackId="a" fill={CH.c4} radius={[4, 4, 0, 0]}
                                                        isAnimationActive={false} label={<TotalBarLabel />} />
                                                </BarChart>
                                            </ResponsiveContainer>

                                            <div style={{ position: "absolute", top: 20, left: 80, backgroundColor: "transparent", pointerEvents: "none", zIndex: 10 }}>
                                                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                                                    <li style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
                                                        <div style={{ width: 12, height: 12, backgroundColor: CH.c4, marginRight: 8, borderRadius: 2 }} />
                                                        <span style={{ color: CH.axisText, fontSize: 11, fontWeight: 600 }}>Brukarbetaling</span>
                                                    </li>
                                                    <li style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
                                                        <div style={{ width: 12, height: 12, backgroundColor: CH.c3, marginRight: 8, borderRadius: 2 }} />
                                                        <span style={{ color: CH.axisText, fontSize: 11, fontWeight: 600 }}>Netto drift (skatt)</span>
                                                    </li>
                                                    <li style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
                                                        <div style={{ width: 12, height: 12, backgroundColor: CH.c2, marginRight: 8, borderRadius: 2 }} />
                                                        <span style={{ color: CH.axisText, fontSize: 11, fontWeight: 600 }}>Avskriving (skatt)</span>
                                                    </li>
                                                    <li style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
                                                        <div style={{ width: 12, height: 12, backgroundColor: CH.c1, marginRight: 8, borderRadius: 2 }} />
                                                        <span style={{ color: CH.axisText, fontSize: 11, fontWeight: 600 }}>Renter (skatt)</span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <InfoBox>
                                        <strong style={{ color: C.text }}>Kva betalar du uansett?</strong> Kapitalkostnaden (renter + avskriving) og netto driftsunderskot vert dekte over <strong style={{ color: C.text }}>kommunebudsjettet</strong>.
                                    </InfoBox>
                                </div>
                            )}

                            {/* ══ HOUSEHOLD ══ */}
                            {tab === "household" && (
                                <div>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(125px,1fr))", gap: 10, marginBottom: 20 }}>
                                        {households.map((h, i) => (
                                            <div key={i} onClick={() => setSelected(selected?.type === h.type ? null : h)}
                                                style={{
                                                    background: selected?.type === h.type ? C.bg : C.card,
                                                    border: `1px solid ${selected?.type === h.type ? C.c4 : C.border}`,
                                                    borderRadius: 0, padding: 15, cursor: "pointer", transition: "all 0.15s"
                                                }}>
                                                <div style={{ marginBottom: 10 }}><HouseholdIcon adults={h.adults} kids={h.kids} size={36} /></div>
                                                <p style={{ fontWeight: 700, margin: "0 0 2px", fontSize: 13 }}>{h.type}</p>
                                                <p style={{ color: C.muted, fontSize: 11, margin: "0 0 8px" }}>{h.persons} personar</p>
                                                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>
                                                    <p style={{ fontSize: 15, fontWeight: 800, color: C.text, margin: 0 }}>{h.total.toLocaleString("nb-NO")} kr</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {selected && (
                                        <div style={{ background: C.card, border: `1px solid ${C.c4}`, borderRadius: 0, padding: 20 }}>
                                            <h3 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700 }}>Detaljar: {selected.type}</h3>
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                                {[
                                                    { label: "Skatt", val: selected.taxShare, c: C.text },
                                                    { label: "Brukarbetaling", val: selected.arskort, c: C.c4 },
                                                ].map((item, i) => (
                                                    <div key={i} style={{ borderLeft: `3px solid ${item.c}`, paddingLeft: 10 }}>
                                                        <p style={{ color: C.muted, fontSize: 11, margin: "0 0 2px" }}>{item.label}</p>
                                                        <p style={{ color: item.c, fontSize: 16, fontWeight: 700, margin: 0 }}>{nok(item.val)}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ══ COSTS ══ */}
                            {tab === "costs" && (
                                <div>
                                    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 0, padding: 24 }}>
                                        <div className="vb-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "center" }}>
                                            <ResponsiveContainer width="100%" height={420} style={{ backgroundColor: CH.bg, borderRadius: 4 }}>
                                                <PieChart>
                                                    <Pie data={pieDataPositive} cx="50%" cy="50%" outerRadius={90}
                                                        innerRadius={40} dataKey="value" isAnimationActive={false}
                                                        label={({ percent }: any) => (percent ?? 0) > 0.05 ? `${((percent ?? 0) * 100).toFixed(0)}%` : null}
                                                        labelLine={false}>
                                                        {pieDataPositive.map((d, i) => <Cell key={i} fill={d.color} />)}
                                                    </Pie>
                                                    <Tooltip content={<PieTip />} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div>
                                                {pieDataPositive.map((d, i) => (
                                                    <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                            <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color }} />
                                                            <span style={{ fontSize: 12, color: C.text }}>{d.name}</span>
                                                        </div>
                                                        <span style={{ fontWeight: 700, fontSize: 12 }}>{fmtM(d.value)}M</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ══ SUBSIDY ══ */}
                            {tab === "subsidy" && (
                                <div>
                                    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 0, padding: 24 }}>
                                        <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700 }}>Subsidie per husstand (kr/år)</h3>
                                        <ResponsiveContainer width="100%" height={420} style={{ backgroundColor: CH.bg, borderRadius: 4 }}>
                                            <BarChart data={households} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                <XAxis dataKey="type" tick={{ fill: CH.axisText, fontSize: 10 }} />
                                                <YAxis tickFormatter={(v: number) => v.toLocaleString("nb-NO")} tick={{ fill: CH.axisText, fontSize: 10 }} />
                                                <Tooltip content={<SubsidieTip />} />
                                                <ReferenceLine y={0} stroke={CH.axisText} strokeWidth={1} />
                                                <Bar dataKey="subsidiePerHH" name="Subsidie" radius={[4, 4, 0, 0]}>
                                                    {households.map((h, i) => <Cell key={i} fill={h.subsidiePerHH > 0 ? CH.c4 : CH.c6} />)}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* footer */}
                        <div style={{ marginTop: 24, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                            <p style={{ color: C.muted, fontSize: 10, margin: 0, lineHeight: 1.5 }}>
                                Investeringskost {investment} MNOK. Rente {rate.toFixed(1)}%. Driftskostnadar {fmtM(grossDrift)} MNOK.
                                Billettsal {fmtM(billettsal)} MNOK. {POPULATION.toLocaleString("nb-NO")} innb.
                            </p>
                        </div>
                    </div>
                </div>            </div>
        </div>
    );
}
