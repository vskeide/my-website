"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

/* ── Formatters ─────────────────────────────────────────────────────────── */
const kr = (n: number) => {
    const abs = Math.abs(n);
    if (abs >= 1e6) return (n / 1e6).toLocaleString("nb-NO", { maximumFractionDigits: 2 }) + " mill";
    return Math.round(n).toLocaleString("nb-NO") + " kr";
};
const pct = (n: number) =>
    n.toLocaleString("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " %";

/* ── Slider component ───────────────────────────────────────────────────── */
function Slider({
    label,
    value,
    min,
    max,
    step,
    display,
    onChange,
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    display: string;
    onChange: (v: number) => void;
}) {
    const pct = ((value - min) / (max - min)) * 100;
    return (
        <div className="mb-5">
            <div className="mb-1.5 flex items-baseline justify-between">
                <label className="text-xs font-medium" style={{ color: "var(--t-text-secondary)" }}>
                    {label}
                </label>
                <span
                    className="text-xs font-bold tabular-nums"
                    style={{ color: "var(--ch-accent)", fontFamily: "var(--font-mono, monospace)" }}
                >
                    {display}
                </span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(+e.target.value)}
                className="w-full"
                style={{
                    background: `linear-gradient(to right, var(--ch-accent) 0%, var(--ch-accent) ${pct}%, var(--t-border-strong) ${pct}%, var(--t-border-strong) 100%)`,
                }}
            />
        </div>
    );
}

/* ── KPI card ───────────────────────────────────────────────────────────── */
function KpiCard({
    label,
    value,
    sub,
    dotColor,
}: {
    label: string;
    value: string;
    sub: string;
    dotColor: string;
}) {
    return (
        <div className="p-4" style={{ background: "var(--t-card)", border: "1px solid var(--t-border-subtle)" }}>
            <div className="mb-2 flex items-center gap-1.5">
                <div className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: dotColor }} />
                <p className="text-xs" style={{ color: "var(--t-text-muted)" }}>{label}</p>
            </div>
            <p className="text-lg font-bold leading-none" style={{ color: "var(--t-text)" }}>{value}</p>
            <p className="mt-1 text-xs" style={{ color: "var(--t-text-muted)" }}>{sub}</p>
        </div>
    );
}

/* ── Main page ──────────────────────────────────────────────────────────── */
export default function SparingPage() {
    const [start, setStart] = useState(500_000);
    const [save, setSave] = useState(100_000);
    const [years, setYears] = useState(25);
    const [ret, setRet] = useState(7);
    const [cost, setCost] = useState(1);
    const [inf, setInf] = useState(2.5);
    const [mode, setMode] = useState<"flat" | "indexed">("flat");

    /* ── Simulation ─────────────────────────────────────────────────────── */
    const { rows, fGross, fNet, fReal, fCont, gNet, infR } = useMemo(() => {
        const r = ret / 100;
        const c = cost / 100;
        const infR = inf / 100;
        const gNet = (1 + r) * (1 - c) - 1;
        const gGross = r;
        let bNet = start, bGross = start, contributed = start;
        const rows = [{ year: 0, gross: start, net: start, real: start, cont: start }];
        for (let t = 1; t <= years; t++) {
            const Ct = mode === "indexed" ? save * Math.pow(1 + infR, t - 1) : save;
            bNet = (bNet + Ct) * (1 + gNet);
            bGross = (bGross + Ct) * (1 + gGross);
            contributed += Ct;
            rows.push({
                year: t,
                gross: bGross,
                net: bNet,
                real: bNet / Math.pow(1 + infR, t),
                cont: contributed,
            });
        }
        return {
            rows,
            fGross: bGross,
            fNet: bNet,
            fReal: bNet / Math.pow(1 + infR, years),
            fCont: contributed,
            gNet,
            infR,
        };
    }, [start, save, years, ret, cost, inf, mode]);

    /* ── Derived ────────────────────────────────────────────────────────── */
    const realKeep = Math.max(fReal, 0);
    const infLoss = Math.max(fNet - fReal, 0);
    const costLoss = Math.max(fGross - fNet, 0);
    const tot = realKeep + infLoss + costLoss || 1;
    const realGain = fReal - fCont;
    const netRatePct = gNet * 100;
    const realRatePct = ((1 + gNet) / (1 + infR) - 1) * 100;

    /* ── Hint text ──────────────────────────────────────────────────────── */
    const saveHint =
        mode === "indexed"
            ? `Same kjøpekraft kvart år — nominelt beløp veks med inflasjon`
            : "Same nominelle beløp kvart år; kjøpekrafta fell over tid";

    const fmtKr = (v: number) => Math.round(v).toLocaleString("nb-NO") + " kr";

    return (
        <main className="mx-auto max-w-[90rem] px-4 sm:px-6" style={{ paddingTop: "var(--nav-height)" }}>
            {/* Header */}
            <section className="pb-6 pt-8">
                <p
                    className="mb-1 text-xs font-bold uppercase tracking-widest"
                    style={{ color: "var(--ch-accent)", fontFamily: "var(--font-mono, monospace)" }}
                >
                    Sparing · kostnad · realavkastning
                </p>
                <h1 className="mb-2 text-xl font-bold tracking-tight" style={{ color: "var(--t-text)" }}>
                    Kva kostnader og inflasjon gjer med sluttverdien
                </h1>
                <p className="max-w-2xl text-xs leading-relaxed" style={{ color: "var(--t-text-secondary)" }}>
                    Dra i parametrane og sjå korleis startkapital, sparing, avkastning, gebyr og inflasjon
                    formar det du faktisk sit att med — i nominelle og reelle kroner.
                </p>
            </section>

            {/* Main grid */}
            <div className="pb-12 lg:grid lg:grid-cols-[300px_1fr] lg:gap-5">
                {/* ── Left panel ── */}
                <div
                    className="mb-5 p-5 lg:mb-0"
                    style={{ background: "var(--t-card)", border: "1px solid var(--t-border-subtle)" }}
                >
                    <p
                        className="mb-5 text-xs uppercase tracking-widest"
                        style={{ color: "var(--t-text-muted)", fontFamily: "var(--font-mono, monospace)" }}
                    >
                        Parametrar
                    </p>

                    <Slider
                        label="Startkapital"
                        value={start}
                        min={0}
                        max={5_000_000}
                        step={50_000}
                        display={fmtKr(start)}
                        onChange={setStart}
                    />

                    <div className="mb-5">
                        <Slider
                            label={mode === "indexed" ? "Sparebeløp per år (dagens kr)" : "Sparebeløp per år (fast nominelt)"}
                            value={save}
                            min={0}
                            max={500_000}
                            step={5_000}
                            display={fmtKr(save)}
                            onChange={setSave}
                        />
                        <p className="mb-2 text-xs" style={{ color: "var(--t-text-muted)" }}>{saveHint}</p>
                        {/* Mode toggle */}
                        <div
                            className="flex gap-1 p-0.5"
                            style={{ background: "var(--t-surface)", border: "1px solid var(--t-border-subtle)" }}
                        >
                            {(["flat", "indexed"] as const).map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setMode(m)}
                                    className="flex-1 py-1.5 text-xs font-semibold transition-all"
                                    style={{
                                        background: mode === m ? "var(--t-card)" : "transparent",
                                        color: mode === m ? "var(--ch-accent)" : "var(--t-text-muted)",
                                        boxShadow: mode === m ? "0 1px 3px rgba(0,0,0,.1)" : "none",
                                    }}
                                >
                                    {m === "flat" ? "Fast nominelt" : "Dagens kroner"}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Slider
                        label="Antall år"
                        value={years}
                        min={1}
                        max={50}
                        step={1}
                        display={years + " år"}
                        onChange={setYears}
                    />
                    <Slider
                        label="Snittavkastning (nominell)"
                        value={ret}
                        min={0}
                        max={15}
                        step={0.1}
                        display={pct(ret)}
                        onChange={setRet}
                    />
                    <Slider
                        label="Kostnadsprosent (årleg)"
                        value={cost}
                        min={0}
                        max={3}
                        step={0.05}
                        display={pct(cost)}
                        onChange={setCost}
                    />
                    <Slider
                        label="Inflasjon"
                        value={inf}
                        min={0}
                        max={10}
                        step={0.1}
                        display={pct(inf)}
                        onChange={setInf}
                    />

                    {/* Rate summary */}
                    <div
                        className="mt-1 grid grid-cols-2 gap-4 pt-4"
                        style={{ borderTop: "1px solid var(--t-border-subtle)" }}
                    >
                        <div>
                            <p className="mb-1 text-xs" style={{ color: "var(--t-text-muted)" }}>Netto avkastning</p>
                            <p className="text-xl font-bold" style={{ color: "var(--ch-accent)" }}>
                                {pct(netRatePct)}
                            </p>
                            <p className="text-xs" style={{ color: "var(--t-text-muted)" }}>nominell</p>
                        </div>
                        <div>
                            <p className="mb-1 text-xs" style={{ color: "var(--t-text-muted)" }}>Realavkastning</p>
                            <p className="text-xl font-bold" style={{ color: "var(--ch-c5)" }}>
                                {pct(realRatePct)}
                            </p>
                            <p className="text-xs" style={{ color: "var(--t-text-muted)" }}>etter inflasjon</p>
                        </div>
                    </div>
                </div>

                {/* ── Right panel ── */}
                <div className="flex flex-col gap-4">
                    {/* Chart */}
                    <div
                        className="p-4"
                        style={{ background: "var(--t-card)", border: "1px solid var(--t-border-subtle)" }}
                    >
                        <ResponsiveContainer width="100%" height={340}>
                            <LineChart data={rows} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="var(--t-border-subtle)"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="year"
                                    tick={{ fontSize: 11, fill: "var(--ch-axis-text)" }}
                                    tickLine={false}
                                    axisLine={false}
                                    label={{ value: "År", position: "insideBottom", offset: -2, fontSize: 11, fill: "var(--ch-axis-text)" }}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: "var(--ch-axis-text)" }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(v) =>
                                        v >= 1e6
                                            ? (v / 1e6).toLocaleString("nb-NO", { maximumFractionDigits: 1 }) + "M"
                                            : (v / 1e3).toFixed(0) + "k"
                                    }
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: "var(--ch-tooltip-bg)",
                                        border: "1px solid var(--ch-border)",
                                        borderRadius: 0,
                                        fontSize: 12,
                                    }}
                                    labelFormatter={(v) => `År ${v}`}
                                    formatter={(v, name) => [kr(v as number), name]}
                                />
                                <Legend
                                    wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                                    iconType="plainline"
                                />
                                <Line
                                    dataKey="gross"
                                    name="Brutto (utan kostnad)"
                                    stroke="#9CA3AF"
                                    strokeDasharray="6 4"
                                    strokeWidth={1.5}
                                    dot={false}
                                />
                                <Line
                                    dataKey="net"
                                    name="Netto (med kostnad)"
                                    stroke="var(--ch-c1)"
                                    strokeWidth={2.5}
                                    dot={false}
                                />
                                <Line
                                    dataKey="real"
                                    name="Realverdi (dagens kroner)"
                                    stroke="var(--ch-c5)"
                                    strokeWidth={2.5}
                                    dot={false}
                                />
                                <Line
                                    dataKey="cont"
                                    name="Innskutt kapital"
                                    stroke="var(--ch-c8)"
                                    strokeDasharray="2 3"
                                    strokeWidth={1.5}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* KPIs */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <KpiCard label="Brutto (utan kostnad)" value={kr(fGross)} sub="nominell" dotColor="#9CA3AF" />
                        <KpiCard label="Netto (med kostnad)" value={kr(fNet)} sub="nominell" dotColor="var(--ch-c1)" />
                        <KpiCard label="Realverdi" value={kr(fReal)} sub="i dagens kroner" dotColor="var(--ch-c5)" />
                        <KpiCard label="Innskutt kapital" value={kr(fCont)} sub="utan avkastning" dotColor="var(--ch-c8)" />
                    </div>

                    {/* Composition bar */}
                    <div
                        className="p-4"
                        style={{ background: "var(--t-card)", border: "1px solid var(--t-border-subtle)" }}
                    >
                        <p
                            className="mb-3 text-xs uppercase tracking-widest"
                            style={{ color: "var(--t-text-muted)", fontFamily: "var(--font-mono, monospace)" }}
                        >
                            Slik fordeler bruttoverdien seg ved slutten
                        </p>
                        <div
                            className="flex h-10 overflow-hidden"
                            style={{ border: "1px solid var(--t-border-subtle)" }}
                        >
                            <div
                                style={{
                                    width: `${(realKeep / tot) * 100}%`,
                                    background: "var(--ch-c5)",
                                    transition: "width .4s ease",
                                }}
                            />
                            <div
                                style={{
                                    width: `${(infLoss / tot) * 100}%`,
                                    background: "var(--ch-c3)",
                                    transition: "width .4s ease",
                                }}
                            />
                            <div
                                style={{
                                    width: `${(costLoss / tot) * 100}%`,
                                    background: "var(--ch-c2)",
                                    transition: "width .4s ease",
                                }}
                            />
                        </div>
                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs">
                            {[
                                { color: "var(--ch-c5)", text: "Realverdi du sit att med", val: kr(fReal) },
                                { color: "var(--ch-c3)", text: "Tapt kjøpekraft (inflasjon)", val: kr(infLoss) },
                                { color: "var(--ch-c2)", text: "Tapt til kostnader", val: kr(costLoss) },
                            ].map(({ color, text, val }) => (
                                <div key={text} className="flex items-center gap-1.5">
                                    <div className="h-3 w-3 flex-shrink-0" style={{ background: color }} />
                                    <span style={{ color: "var(--t-text-secondary)" }}>
                                        {text}:{" "}
                                        <strong style={{ color: "var(--t-text)" }}>{val}</strong>
                                    </span>
                                </div>
                            ))}
                        </div>
                        <p className="mt-2 text-xs" style={{ color: "var(--t-text-muted)" }}>
                            Av realverdien er{" "}
                            <strong style={{ color: "var(--t-text)" }}>
                                {kr(Math.min(fCont, fReal))}
                            </strong>{" "}
                            innskoten kapital og{" "}
                            <strong style={{ color: realGain >= 0 ? "var(--ch-c5)" : "var(--ch-c2)" }}>
                                {(realGain >= 0 ? "+" : "") + kr(realGain)}
                            </strong>{" "}
                            reell avkastning.
                        </p>
                    </div>

                    {/* Notes */}
                    <div
                        className="p-4 text-xs leading-relaxed"
                        style={{
                            background: "var(--t-surface)",
                            border: "1px solid var(--t-border-subtle)",
                            color: "var(--t-text-secondary)",
                        }}
                    >
                        <strong style={{ color: "var(--t-text)" }}>Føresetnader:</strong>{" "}
                        Sparebeløpet går inn ved starten av kvart år.{" "}
                        Kostnad er ein årleg prosent av forvaltningskapitalen:{" "}
                        <code>netto = (1+avk)·(1−kost) − 1</code>.{" "}
                        Realverdi = <code>nominell / (1+inflasjon)^år</code>.{" "}
                        Konstant snittavkastning — ingen volatilitet eller sekvensrisiko.{" "}
                        <strong>Skatt er ikkje inkludert.</strong>
                    </div>
                </div>
            </div>

            {/* Back */}
            <section className="py-4" style={{ borderTop: "1px solid var(--t-border-subtle)" }}>
                <Link
                    href="/calculators"
                    className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:underline"
                    style={{ color: "var(--ch-accent)" }}
                >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    All calculators
                </Link>
            </section>
        </main>
    );
}
