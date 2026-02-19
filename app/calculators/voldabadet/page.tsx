"use client";

import { useState, useMemo, useEffect } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer, Cell, ReferenceLine,
    PieChart, Pie,
} from "recharts";
import { useTheme } from "@/components/ThemeProvider";

// ─── palette (CSS variables for DOM elements) ─────────────────────────────────
const C = {
    bg: "var(--t-bg)",
    card: "var(--t-card)",
    border: "var(--t-border-strong)",
    accent: "var(--color-accent)",
    green: "var(--color-accent-green)",
    amber: "var(--color-accent-amber)",
    red: "var(--color-accent-red)",
    purple: "var(--color-accent-purple)",
    cyan: "var(--color-accent-cyan)",
    lime: "var(--color-accent-lime)",
    text: "var(--t-text)",
    muted: "var(--t-text-secondary)",
    tooltipBg: "var(--ch-tooltip-bg)",
};

// Recharts needs resolved hex — read from CSS --ch-* variables
function useChartColors() {
    const { theme } = useTheme();
    const [colors, setColors] = useState({
        accent: "#3b82f6", red: "#ef4444", amber: "#f59e0b",
        green: "#10b981", purple: "#8b5cf6", cyan: "#06b6d4",
        lime: "#84cc16", text: "#f1f5f9", muted: "#94a3b8",
        border: "#263356", tooltipBg: "#0a1628",
    });
    useEffect(() => {
        const s = getComputedStyle(document.documentElement);
        setColors({
            accent: s.getPropertyValue("--ch-accent").trim() || "#3b82f6",
            red: s.getPropertyValue("--ch-red").trim() || "#ef4444",
            amber: s.getPropertyValue("--ch-amber").trim() || "#f59e0b",
            green: s.getPropertyValue("--ch-green").trim() || "#10b981",
            purple: s.getPropertyValue("--ch-purple").trim() || "#8b5cf6",
            cyan: s.getPropertyValue("--ch-cyan").trim() || "#06b6d4",
            lime: s.getPropertyValue("--ch-lime").trim() || "#84cc16",
            text: s.getPropertyValue("--ch-text").trim() || "#f1f5f9",
            muted: s.getPropertyValue("--ch-muted").trim() || "#94a3b8",
            border: s.getPropertyValue("--ch-border").trim() || "#263356",
            tooltipBg: s.getPropertyValue("--ch-tooltip-bg").trim() || "#0a1628",
        });
    }, [theme]);
    return colors;
}

// ─── constants ───────────────────────────────────────────────────────────────
const ADULTS = 8800;
const POPULATION = 11000;
const HOUSEHOLDS = 5200;
const LOAN_YEARS = 20;

const DEFAULT_INVESTMENT = 230;
const DEFAULT_RATE = 4.0;

const DRIFT_DEFAULTS = [
    { key: "strom", name: "Strøm", value: 3_000_000, colorKey: "accent" as const },
    { key: "bad", name: "Badevakter", value: 2_400_000, colorKey: "cyan" as const },
    { key: "tilsette", name: "Andre tilsette", value: 4_200_000, colorKey: "amber" as const },
    { key: "kjemi", name: "Kjemikaliar mm", value: 500_000, colorKey: "lime" as const },
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
        <div style={{ background: C.tooltipBg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", maxWidth: 280 }}>
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
        <div style={{ background: C.tooltipBg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", maxWidth: 270 }}>
            <p style={{ color: C.text, fontWeight: 700, marginBottom: 4, fontSize: 13 }}>{label}</p>
            <p style={{ color: v > 0 ? C.red : v < 0 ? C.green : C.muted, fontSize: 12, margin: 0 }}>
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
        <div style={{ background: C.tooltipBg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px" }}>
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
        <text x={x + width / 2} y={y - 6} fill="var(--ch-text)" textAnchor="middle" fontSize={11} fontWeight={700}>
            {Math.round(value).toLocaleString("nb-NO")}
        </text>
    );
};

// ─── Slider ──────────────────────────────────────────────────────────────────
const Slider = ({ label, value, min, max, step, onChange, format, color }: {
    label: string; value: number; min: number; max: number; step: number;
    onChange: (v: number) => void; format: (v: number) => string; color?: string;
}) => (
    <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: C.muted, lineHeight: 1.4 }}>{label}</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: color || C.accent, marginLeft: 12, whiteSpace: "nowrap" }}>
                {format(value)}
            </span>
        </div>
        <input type="range" min={min} max={max} step={step} value={value}
            onChange={e => onChange(Number(e.target.value))}
            style={{ width: "100%", accentColor: color || "var(--ch-accent)", cursor: "pointer", height: 6 }} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
            <span style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>{format(min)}</span>
            <span style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>{format(max)}</span>
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
                <span style={{ fontSize: 13, color: isIncome ? C.green : C.text }}>{name}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {isIncome && <span style={{ color: C.green, fontSize: 12 }}>−</span>}
                {editing ? (
                    <input
                        autoFocus
                        value={raw}
                        onChange={e => setRaw(e.target.value)}
                        onBlur={commit}
                        onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
                        style={{
                            width: 72, background: C.tooltipBg, border: `1px solid ${C.accent}`,
                            borderRadius: 5, color: C.text, fontSize: 13, fontWeight: 700,
                            padding: "3px 7px", textAlign: "right", outline: "none",
                        }}
                    />
                ) : (
                    <button onClick={startEdit} title="Klikk for å endre"
                        style={{
                            background: "transparent", border: `1px solid ${C.border}`, borderRadius: 5,
                            color: isIncome ? C.green : color || C.text, fontSize: 13, fontWeight: 700,
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
        borderRadius: 8, padding: "13px 16px", marginBottom: 20
    }}>
        <p style={{ margin: 0, fontSize: 13, color: C.muted, lineHeight: 1.75 }}>{children}</p>
    </div>
);

const StatCard = ({ label, val, sub, c }: { label: string; val: string; sub?: string; c: string }) => (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "15px 18px" }}>
        <p style={{ color: C.muted, fontSize: 10, margin: "0 0 5px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
        <p style={{ color: c, fontSize: 20, fontWeight: 800, margin: "0 0 3px" }}>{val}</p>
        {sub && <p style={{ color: C.muted, fontSize: 11, margin: 0 }}>{sub}</p>}
    </div>
);

// ─── main ─────────────────────────────────────────────────────────────────────
export default function VoldabadViz() {
    const CH = useChartColors();
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
        { name: "Renter", value: rente * 1e6, color: CH.red, percent: 0, isIncome: false },
        { name: "Avskriving", value: avskriving * 1e6, color: CH.amber, percent: 0, isIncome: false },
        ...DRIFT_DEFAULTS.map(d => ({ name: d.name, value: driftValues[d.key], color: CH[d.colorKey], percent: 0, isIncome: false })),
        { name: "Billettsal (inntekt)", value: billettsal, color: CH.green, percent: 0, isIncome: true },
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
            <div style={{ maxWidth: "96rem", margin: "0 auto", padding: "24px 28px" }}>

                {/* header */}
                <div style={{ marginBottom: 22 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 5 }}>
                        <div style={{ width: 4, height: 28, background: C.accent, borderRadius: 2 }} />
                        <h1 style={{ fontSize: 21, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
                            Voldabadet — Kostnadsanalyse
                        </h1>
                    </div>
                    <p style={{ color: C.muted, margin: 0, fontSize: 13, paddingLeft: 16 }}>
                        Kva kostar symjeanlegget kvar innbyggar — gjennom kommuneskatten og som brukarbetaling?
                    </p>
                </div>

                {/* sliders */}
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, marginBottom: 22 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                        <div>
                            <h3 style={{
                                margin: "0 0 2px", fontSize: 12, fontWeight: 700, color: C.accent,
                                textTransform: "uppercase", letterSpacing: "0.07em"
                            }}>Juster føresetnadane</h3>
                            <p style={{ color: C.muted, fontSize: 12, margin: 0 }}>Alle tal og diagram oppdaterast automatisk.</p>
                        </div>
                        <button onClick={reset} disabled={isDefault}
                            style={{
                                background: isDefault ? "transparent" : `rgba(59,130,246,0.12)`,
                                border: `1px solid ${isDefault ? C.border : C.accent}`,
                                color: isDefault ? C.border : C.accent,
                                borderRadius: 6, padding: "6px 16px", fontSize: 12, fontWeight: 600,
                                cursor: isDefault ? "default" : "pointer", transition: "all 0.15s",
                            }}>
                            ↩ Tilbakestill
                        </button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 40px" }}>
                        <Slider label="Investeringskost (MNOK, ex mva og spelemidlar)"
                            value={investment} min={50} max={350} step={5}
                            onChange={setInvestment} format={v => `${v} MNOK`} color={C.amber} />
                        <Slider label="Rente (%)" value={rate} min={2} max={8} step={0.25}
                            onChange={setRate} format={v => `${v.toFixed(2)}%`} color={C.red} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                        {[
                            { label: "Rentekostnad/år", val: rente.toFixed(2) + " MNOK", c: C.red },
                            { label: "Avskriving/år (20 år)", val: avskriving.toFixed(2) + " MNOK", c: C.amber },
                            { label: "Total kapitalkost/år", val: kapital.toFixed(2) + " MNOK", c: C.text },
                        ].map((f, i) => (
                            <div key={i} style={{ background: C.bg, borderRadius: 8, padding: "12px 16px", borderLeft: `3px solid ${f.c}` }}>
                                <p style={{ color: C.muted, fontSize: 10, margin: "0 0 3px", textTransform: "uppercase" }}>{f.label}</p>
                                <p style={{ color: f.c, fontSize: 17, fontWeight: 800, margin: 0 }}>{f.val}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* tabs */}
                <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: `1px solid ${C.border}` }}>
                    {TABS.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)} style={{
                            background: "none", border: "none",
                            color: tab === t.id ? C.accent : C.muted,
                            fontWeight: tab === t.id ? 700 : 400,
                            fontSize: 14, cursor: "pointer", padding: "8px 18px",
                            borderBottom: tab === t.id ? `2px solid ${C.accent}` : "2px solid transparent",
                            marginBottom: -1, transition: "color 0.15s",
                        }}>{t.label}</button>
                    ))}
                </div>

                {/* ══ OVERVIEW ══ */}
                {tab === "overview" && (
                    <div>
                        <InfoBox>
                            <strong style={{ color: C.text }}>Kva betalar du uansett?</strong>{" "}
                            Kapitalkostnaden (renter + avskriving) og netto driftsunderskot vert dekte over{" "}
                            <strong style={{ color: C.text }}>kommunebudsjettet</strong> — gjennom kommuneskatten din.
                            Du betalar dette <strong style={{ color: C.text }}>uavhengig av om du badar eller ikkje</strong>.
                            Brukarbetalinga (årskortet) kjem <strong style={{ color: C.text }}>i tillegg</strong> for dei som nyttar anlegget.
                        </InfoBox>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(195px,1fr))", gap: 13, marginBottom: 22 }}>
                            <StatCard label="Investeringskost" val={investment + " MNOK"} sub="Ex mva og spelemidlar" c={C.amber} />
                            <StatCard label="Kapitalkost/år" val={kapital.toFixed(1) + " MNOK"} sub={`Renter ${rente.toFixed(1)} + avskr. ${avskriving.toFixed(1)}`} c={C.red} />
                            <StatCard label="Netto driftsunderskot/år" val={fmtM(netDrift) + " MNOK"} sub={`Drift ${fmtM(grossDrift)} − billettsal ${fmtM(billettsal)}`} c={C.purple} />
                            <StatCard label="Total skattebelasting/år" val={totalBurdenMNOK.toFixed(1) + " MNOK"} sub="Kapital + netto drift" c={C.text} />
                            <StatCard label="Per vaksen/år (skatt)" val={perAdultRounded.toLocaleString("nb-NO") + " kr"} sub="8 800 vaksne" c={C.accent} />
                            <StatCard label="Flat per innbyggar/år" val={perPersonRounded.toLocaleString("nb-NO") + " kr"} sub="Om fordelt på 11 000 innb." c={C.green} />
                        </div>
                        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
                            <h3 style={{ margin: "0 0 5px", fontSize: 15, fontWeight: 700 }}>Total kostnad per husstandstype (kr/år)</h3>
                            <p style={{ color: C.muted, fontSize: 12, margin: "0 0 20px" }}>
                                Nedste tre delar = skatt (betalast uansett). Blå = brukarbetaling for dei som badar. Y-aksen er fast.
                            </p>
                            <ResponsiveContainer width="100%" height={380}>
                                <BarChart data={stackedData} margin={{ top: 28, right: 20, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={CH.border} />
                                    <XAxis dataKey="type" tick={{ fill: CH.muted, fontSize: 11 }} />
                                    <YAxis domain={[0, Y_MAX]} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fill: CH.muted, fontSize: 11 }} />
                                    <Tooltip content={<DarkTip />} />
                                    <Legend wrapperStyle={{ color: CH.muted, fontSize: 12 }} />
                                    <Bar dataKey="Renter (skatt)" stackId="a" fill={CH.red} isAnimationActive={false} />
                                    <Bar dataKey="Avskriving (skatt)" stackId="a" fill={CH.amber} isAnimationActive={false} />
                                    <Bar dataKey="Netto drift (skatt)" stackId="a" fill={CH.purple} isAnimationActive={false} />
                                    <Bar dataKey="Brukarbetaling" stackId="a" fill={CH.accent} radius={[4, 4, 0, 0]}
                                        isAnimationActive={false} label={<TotalBarLabel />} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* ══ HOUSEHOLD ══ */}
                {tab === "household" && (
                    <div>
                        <InfoBox>
                            <strong style={{ color: C.text }}>Skatteandelen</strong> vert fordelt på dei{" "}
                            <strong style={{ color: C.text }}>8 800 vaksne</strong> — born betalar ingenting over budsjettet.
                            Brukarbetaling kjem i tillegg. Klikk for detaljar.
                        </InfoBox>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(162px,1fr))", gap: 11, marginBottom: 22 }}>
                            {households.map((h, i) => (
                                <div key={i} onClick={() => setSelected(selected?.type === h.type ? null : h)}
                                    style={{
                                        background: selected?.type === h.type ? C.bg : C.card,
                                        border: `1px solid ${selected?.type === h.type ? C.accent : C.border}`,
                                        borderRadius: 10, padding: 15, cursor: "pointer", transition: "all 0.15s"
                                    }}>
                                    <div style={{ marginBottom: 10 }}><HouseholdIcon adults={h.adults} kids={h.kids} size={40} /></div>
                                    <p style={{ fontWeight: 700, margin: "0 0 2px", fontSize: 14 }}>{h.type}</p>
                                    <p style={{ color: C.muted, fontSize: 11, margin: "0 0 10px" }}>{h.persons} person{h.persons > 1 ? "ar" : ""}</p>
                                    <p style={{ fontSize: 10, color: C.muted, margin: "0 0 1px", textTransform: "uppercase" }}>Skatt/år</p>
                                    <p style={{ fontSize: 15, fontWeight: 700, color: C.red, margin: "0 0 6px" }}>{h.taxShare.toLocaleString("nb-NO")} kr</p>
                                    <p style={{ fontSize: 10, color: C.muted, margin: "0 0 1px", textTransform: "uppercase" }}>+ Brukarbetaling</p>
                                    <p style={{ fontSize: 15, fontWeight: 700, color: C.accent, margin: "0 0 8px" }}>{h.arskort.toLocaleString("nb-NO")} kr</p>
                                    <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>
                                        <p style={{ fontSize: 10, color: C.muted, margin: "0 0 1px", textTransform: "uppercase" }}>Total (badar du)</p>
                                        <p style={{ fontSize: 17, fontWeight: 800, color: C.text, margin: 0 }}>{h.total.toLocaleString("nb-NO")} kr</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {selected && (
                            <div style={{ background: C.card, border: `1px solid ${C.accent}`, borderRadius: 12, padding: 22 }}>
                                <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700 }}>Detaljar: {selected.type}</h3>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 }}>
                                    {[
                                        { label: "Rentedel (skatt)", val: selected.renteDel, c: C.red },
                                        { label: "Avskrivingsdel (skatt)", val: selected.avskrivDel, c: C.amber },
                                        { label: "Driftsandel (skatt)", val: selected.driftDel, c: C.purple },
                                        { label: "Sum skattebelasting", val: selected.taxShare, c: C.text },
                                        { label: "Brukarbetaling (årskort)", val: selected.arskort, c: C.accent },
                                        { label: "Total om du badar", val: selected.total, c: C.text },
                                    ].map((item, i) => (
                                        <div key={i} style={{ borderLeft: `3px solid ${item.c}`, paddingLeft: 11 }}>
                                            <p style={{ color: C.muted, fontSize: 11, margin: "0 0 3px" }}>{item.label}</p>
                                            <p style={{ color: item.c, fontSize: 17, fontWeight: 700, margin: 0 }}>{nok(item.val)}</p>
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
                        <InfoBox>
                            Klikk på eit tal for å endre det. Alle berekningar oppdaterast i sanntid.
                            Kapitalkostnadane er reaktive til sliders øvst.
                        </InfoBox>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                            {/* Capital */}
                            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 22 }}>
                                <h3 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700 }}>Kapitalkostnadar/år</h3>
                                <p style={{ color: C.muted, fontSize: 12, margin: "0 0 16px" }}>Reaktiv til sliders over.</p>
                                {[
                                    { label: "Renter", val: rente * 1e6, color: CH.red, pct: (rente / kapital * 100).toFixed(0) + "%" },
                                    { label: `Avskriving (${LOAN_YEARS} år)`, val: avskriving * 1e6, color: CH.amber, pct: (avskriving / kapital * 100).toFixed(0) + "%" },
                                ].map((item, i, arr) => (
                                    <div key={i} style={{
                                        display: "flex", justifyContent: "space-between", alignItems: "center",
                                        marginBottom: i < arr.length - 1 ? 14 : 0, paddingBottom: i < arr.length - 1 ? 14 : 0,
                                        borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none"
                                    }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <div style={{ width: 12, height: 12, borderRadius: 3, background: item.color }} />
                                            <div>
                                                <p style={{ fontSize: 13, color: C.text, margin: 0 }}>{item.label}</p>
                                                <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{item.pct} av kapital</p>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <p style={{ fontWeight: 700, fontSize: 14, color: item.color, margin: 0 }}>{fmtM(item.val)} MNOK</p>
                                            <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>
                                                {Math.round(item.val / POPULATION).toLocaleString("nb-NO")} kr/innb.
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div style={{
                                    background: C.bg, borderRadius: 8, padding: "11px 14px", marginTop: 16,
                                    display: "flex", justifyContent: "space-between"
                                }}>
                                    <span style={{ fontWeight: 700, fontSize: 14 }}>Sum kapital</span>
                                    <span style={{ fontWeight: 800, fontSize: 14, color: C.red }}>{kapital.toFixed(2)} MNOK</span>
                                </div>
                            </div>

                            {/* Drift — editable */}
                            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 22 }}>
                                <h3 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700 }}>Reine driftskostnadar/år</h3>
                                <p style={{ color: C.muted, fontSize: 12, margin: "0 0 16px" }}>
                                    Klikk på eit tal for å endre det.
                                </p>
                                {DRIFT_DEFAULTS.map(d => (
                                    <CostInput key={d.key} name={d.name} value={driftValues[d.key]}
                                        color={CH[d.colorKey]} onChange={val => updateDrift(d.key, val)} />
                                ))}
                                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, marginBottom: 10 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                                        <span style={{ fontSize: 13, color: C.muted }}>Sum driftskostnadar</span>
                                        <span style={{ fontWeight: 700, fontSize: 13 }}>{fmtM(grossDrift)} MNOK</span>
                                    </div>
                                    <CostInput name="Billettsal (inntekt)" value={billettsal}
                                        color={CH.green} onChange={setBillettsal} isIncome />
                                </div>
                                <div style={{
                                    background: C.bg, borderRadius: 8, padding: "11px 14px",
                                    display: "flex", justifyContent: "space-between"
                                }}>
                                    <span style={{ fontWeight: 700, fontSize: 14 }}>Netto driftsunderskot</span>
                                    <span style={{ fontWeight: 800, fontSize: 14, color: C.purple }}>{fmtM(netDrift)} MNOK</span>
                                </div>
                            </div>
                        </div>

                        {/* Total summary bar */}
                        <div style={{
                            background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10,
                            padding: "14px 20px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center"
                        }}>
                            <div>
                                <p style={{ margin: 0, color: C.muted, fontSize: 12 }}>Total belasting over kommunebudsjettet</p>
                                <p style={{ margin: "3px 0 0", color: C.muted, fontSize: 11 }}>
                                    Kapital {kapital.toFixed(1)} MNOK + netto drift {fmtM(netDrift)} MNOK
                                </p>
                            </div>
                            <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.red }}>
                                {totalBurdenMNOK.toFixed(1)} MNOK/år
                            </p>
                        </div>

                        {/* Pie chart */}
                        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
                            <h3 style={{ margin: "0 0 5px", fontSize: 14, fontWeight: 700 }}>Kostnadsfordeling (brutto, ex. billettsal)</h3>
                            <p style={{ color: C.muted, fontSize: 12, margin: "0 0 16px" }}>
                                Viser kapital og drift som del av totale bruttokostnadar ({(kapital + grossDrift / 1e6).toFixed(1)} MNOK).
                                Billettsal på {fmtM(billettsal)} MNOK kjem til frå og reduserer netto belastning.
                            </p>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "center" }}>
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart>
                                        <Pie data={pieDataPositive} cx="50%" cy="50%" outerRadius={100}
                                            innerRadius={40} dataKey="value" isAnimationActive={false}
                                            label={({ percent }: { percent?: number }) => (percent ?? 0) > 0.06 ? `${((percent ?? 0) * 100).toFixed(0)}%` : ""}
                                            labelLine={false}>
                                            {pieDataPositive.map((d, i) => <Cell key={i} fill={d.color} />)}
                                        </Pie>
                                        <Tooltip content={<PieTip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div>
                                    {pieDataPositive.map((d, i) => (
                                        <div key={i} style={{
                                            display: "flex", justifyContent: "space-between",
                                            alignItems: "center", marginBottom: 10
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                                                <div style={{ width: 12, height: 12, borderRadius: 3, background: d.color, flexShrink: 0 }} />
                                                <span style={{ fontSize: 13, color: C.text }}>{d.name}</span>
                                            </div>
                                            <div style={{ textAlign: "right", marginLeft: 12 }}>
                                                <span style={{ fontWeight: 700, fontSize: 13, color: d.color }}>
                                                    {fmtM(d.value)} MNOK
                                                </span>
                                                <span style={{ fontSize: 11, color: C.muted, marginLeft: 6 }}>
                                                    ({(d.percent * 100).toFixed(0)}%)
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    <div style={{
                                        borderTop: `1px solid ${C.border}`, paddingTop: 10, marginTop: 4,
                                        display: "flex", justifyContent: "space-between"
                                    }}>
                                        <span style={{ fontWeight: 700, fontSize: 13 }}>Brutto total</span>
                                        <span style={{ fontWeight: 800, color: C.red, fontSize: 13 }}>
                                            {(kapital + grossDrift / 1e6).toFixed(1)} MNOK
                                        </span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                                        <span style={{ fontSize: 12, color: C.green }}>− Billettsal</span>
                                        <span style={{ fontWeight: 700, color: C.green, fontSize: 12 }}>
                                            {fmtM(billettsal)} MNOK
                                        </span>
                                    </div>
                                    <div style={{
                                        display: "flex", justifyContent: "space-between", marginTop: 6,
                                        paddingTop: 8, borderTop: `1px solid ${C.border}`
                                    }}>
                                        <span style={{ fontWeight: 700, fontSize: 13 }}>Netto skattebyrde</span>
                                        <span style={{ fontWeight: 800, color: C.red, fontSize: 13 }}>
                                            {totalBurdenMNOK.toFixed(1)} MNOK
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ══ SUBSIDY ══ */}
                {tab === "subsidy" && (
                    <div>
                        <InfoBox color="239,68,68">
                            <strong style={{ color: C.text }}>Kva betyr subsidie her?</strong> Kommunekostnaden (kapital + netto drift)
                            vert fordelt på dei <strong style={{ color: C.text }}>8 800 vaksne</strong> — born betalar ingenting over
                            budsjettet. Om vi i staden fordelte same kostnad <strong style={{ color: C.text }}>flatt per person</strong>{" "}
                            (11 000 innb.) ville kostnaden per person vore{" "}
                            <strong style={{ color: C.text }}>{perPersonRounded.toLocaleString("nb-NO")} kr/år</strong> mot{" "}
                            <strong style={{ color: C.text }}>{perAdultRounded.toLocaleString("nb-NO")} kr/år</strong> per vaksen.
                            Husstandar med born betalar <strong style={{ color: C.green }}>mindre per person</strong> enn flat fordeling
                            — subsidierte av vaksne utan born. Merk: årskortet er ikkje med i subsidieberekningane, men inneheld
                            si eiga innebygde subsidie gjennom kvantumsrabatt for familier.
                        </InfoBox>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
                                <h3 style={{ margin: "0 0 5px", fontSize: 14, fontWeight: 700 }}>Subsidie per person (kr/år)</h3>
                                <p style={{ color: C.muted, fontSize: 12, margin: "0 0 16px" }}>
                                    Raudt = betalar meir enn flat fordeling. Grønt = subsidiert.
                                </p>
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={households} margin={{ top: 8, right: 10, left: 10, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={CH.border} />
                                        <XAxis dataKey="type" tick={{ fill: CH.muted, fontSize: 10 }} />
                                        <YAxis tickFormatter={(v: number) => v.toLocaleString("nb-NO")} tick={{ fill: CH.muted, fontSize: 10 }} />
                                        <Tooltip content={<SubsidieTip />} />
                                        <ReferenceLine y={0} stroke={CH.muted} strokeWidth={1.5} />
                                        <Bar dataKey="subsidiePerPers" name="Subsidie per person" radius={[4, 4, 0, 0]}>
                                            {households.map((h, i) => <Cell key={i} fill={h.subsidiePerPers > 0 ? CH.red : CH.green} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
                                <h3 style={{ margin: "0 0 5px", fontSize: 14, fontWeight: 700 }}>Subsidie per husstand (kr/år)</h3>
                                <p style={{ color: C.muted, fontSize: 12, margin: "0 0 16px" }}>
                                    Totalt avvik frå flat fordeling for heile husstanden.
                                </p>
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={households} margin={{ top: 8, right: 10, left: 10, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={CH.border} />
                                        <XAxis dataKey="type" tick={{ fill: CH.muted, fontSize: 10 }} />
                                        <YAxis tickFormatter={(v: number) => v.toLocaleString("nb-NO")} tick={{ fill: CH.muted, fontSize: 10 }} />
                                        <Tooltip content={<SubsidieTip />} />
                                        <ReferenceLine y={0} stroke={CH.muted} strokeWidth={1.5} />
                                        <Bar dataKey="subsidiePerHH" name="Subsidie per husstand" radius={[4, 4, 0, 0]}>
                                            {households.map((h, i) => <Cell key={i} fill={h.subsidiePerHH > 0 ? CH.red : CH.green} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                                <thead>
                                    <tr style={{ background: C.bg }}>
                                        {["Husstandstype", "Skatt/år (vaksne)", "Flat per pers", "Subsidie/pers", "Subsidie/husstand"].map((h, i) => (
                                            <th key={i} style={{
                                                padding: "10px 14px", textAlign: i === 0 ? "left" : "right",
                                                color: C.muted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em"
                                            }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {households.map((h, i) => (
                                        <tr key={i} style={{
                                            borderTop: `1px solid ${C.border}`,
                                            background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)"
                                        }}>
                                            <td style={{ padding: "10px 14px", fontWeight: 600 }}>{h.type}</td>
                                            <td style={{ padding: "10px 14px", textAlign: "right", color: C.red }}>{h.taxShare.toLocaleString("nb-NO")}</td>
                                            <td style={{ padding: "10px 14px", textAlign: "right", color: C.muted }}>{perPersonRounded.toLocaleString("nb-NO")}</td>
                                            <td style={{
                                                padding: "10px 14px", textAlign: "right", fontWeight: 700,
                                                color: h.subsidiePerPers > 0 ? C.red : C.green
                                            }}>
                                                {h.subsidiePerPers > 0 ? "+" : ""}{h.subsidiePerPers.toLocaleString("nb-NO")}
                                            </td>
                                            <td style={{
                                                padding: "10px 14px", textAlign: "right", fontWeight: 700,
                                                color: h.subsidiePerHH > 0 ? C.red : C.green
                                            }}>
                                                {h.subsidiePerHH > 0 ? "+" : ""}{h.subsidiePerHH.toLocaleString("nb-NO")}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* footer */}
                <div style={{ marginTop: 32, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                    <p style={{ color: C.muted, fontSize: 11, margin: 0, lineHeight: 1.6 }}>
                        Kjelde: Eigen kalkyle. Investeringskost {investment} MNOK ex mva og spelemidlar. Rente {rate.toFixed(2)}%,
                        avskrivingstid {LOAN_YEARS} år. Driftskostnadar {fmtM(grossDrift)} MNOK, billettsal {fmtM(billettsal)} MNOK,
                        netto drift {fmtM(netDrift)} MNOK. {POPULATION.toLocaleString("nb-NO")} innbyggarar,
                        {ADULTS.toLocaleString("nb-NO")} vaksne, {HOUSEHOLDS.toLocaleString("nb-NO")} husstandar.
                    </p>
                </div>
            </div>
        </div>
    );
}
