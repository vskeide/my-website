"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import JSONstat from "jsonstat-toolkit";
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ReferenceLine,
    Cell,
    ResponsiveContainer,
} from "recharts";
import { TrendingUp, Settings, Info, Share2, Check } from "lucide-react";

/* ── Theme tokens (shared with the other calculators) ───────────────────── */
const C = {
    bg: "var(--t-bg)",
    surface: "var(--t-surface)",
    card: "var(--t-card)",
    border: "var(--t-border-subtle)",
    borderStrong: "var(--t-border-strong)",
    text: "var(--t-text)",
    muted: "var(--t-text-secondary)",
    faint: "var(--t-text-muted)",
    accent: "var(--ch-accent)",
    positive: "var(--ch-positive)",
    negative: "var(--ch-negative)",
    c1: "var(--ch-c1)", // blue
    c3: "var(--ch-c3)", // amber
    c5: "var(--ch-c5)", // green
    axisText: "var(--ch-axis-text)",
    chartBg: "var(--ch-bg)",
};

const tooltipStyle = {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    fontSize: 12,
    color: C.text,
    padding: "10px 14px",
} as React.CSSProperties;

/* ── Types ──────────────────────────────────────────────────────────────── */
type GranularityLevel = 0 | 1 | 2 | 3;
type InputMode = "nok" | "pct";

interface AppState {
    startYear: number;
    endYear: number;
    wageStart: number;
    wageEnd: number;
    level: GranularityLevel;
    inputMode: InputMode;
    weights: Record<string, number>;
}

interface CpiCode {
    code: string;
    label: string;
    level: GranularityLevel;
    parentCode: string | null;
}

interface SsbData {
    codes: CpiCode[];
    annualIndex: Record<string, Record<number, number>>;
    firstYear: number;
    lastYear: number;
    nationalWeights: Record<string, number>;
}

interface YearPoint {
    year: number;
    P: number;
    O: number;
    W: number;
    R: number;
    Ro: number;
}

interface ContributionItem {
    code: string;
    label: string;
    ci: number;
    share: number;
}

interface BasketItem {
    code: string;
    label: string;
    userShare: number;
    nationalShare: number;
    priceGrowth: number;
    weightGap: number;
}

interface CalcResult {
    yearPoints: YearPoint[];
    contributions: ContributionItem[];
    basketItems: BasketItem[];
    shares: Record<string, number>;
    personalInflation: number;
    officialInflation: number;
    wageGrowth: number;
    realWageChange: number;
    realWageChangeOfficial: number;
}

/* ── Formatters ─────────────────────────────────────────────────────────── */
const PCT_FMT = new Intl.NumberFormat("nb-NO", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    signDisplay: "exceptZero",
});
const PCT_FMT_NOSIGN = new Intl.NumberFormat("nb-NO", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
});
const NUM_FMT = new Intl.NumberFormat("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const fmtPct = (value: number, sign = true) => (sign ? PCT_FMT.format(value) : PCT_FMT_NOSIGN.format(value));
const fmtNum = (value: number, decimals = 1) =>
    new Intl.NumberFormat("nb-NO", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
const fmtIndex = (value: number) => NUM_FMT.format(value);

/* ── SSB data fetch ─────────────────────────────────────────────────────── */
const BASE = "https://data.ssb.no/api/pxwebapi/v2";
const TABLE = "14700";
const LANG = "no";
const DIM = "VareTjenesteGrp";
const CODELIST = "vs_CoiCop2018Kpi01";
const CONTENTS_INDEX = "KpiIndMnd";

const NATIONAL_WEIGHTS_DIVISION: Record<string, number> = {
    "01": 0.133, "02": 0.035, "03": 0.041, "04": 0.277, "05": 0.052, "06": 0.030,
    "07": 0.143, "08": 0.027, "09": 0.112, "10": 0.011, "11": 0.066, "12": 0.073,
};

function codeLevel(code: string): GranularityLevel {
    if (code === "00") return 0;
    if (/^\d{2}$/.test(code)) return 1;
    const dots = (code.match(/\./g) || []).length;
    if (dots === 1) return 2;
    return 3;
}

function parentOf(code: string): string | null {
    if (code === "00") return null;
    if (/^\d{2}$/.test(code)) return "00";
    const parts = code.split(".");
    if (parts.length === 2) return parts[0];
    return parts.slice(0, -1).join(".");
}

async function fetchSsbData(): Promise<SsbData> {
    let firstYear = 2015;
    let lastYear = new Date().getFullYear();

    try {
        const metaRes = await fetch(`${BASE}/tables/${TABLE}/metadata?lang=${LANG}`);
        if (metaRes.ok) {
            const meta = await metaRes.json();
            const vars = meta.variables ?? [];
            const tidVar = vars.find((v: { id?: string }) => v.id === "Tid");
            const firstPeriod = meta.firstPeriod ?? tidVar?.values?.[0];
            const lastPeriod = meta.lastPeriod ?? tidVar?.values?.[tidVar?.values?.length - 1];
            if (firstPeriod) firstYear = parseInt(firstPeriod.slice(0, 4));
            if (lastPeriod) lastYear = parseInt(lastPeriod.slice(0, 4));
        }
    } catch {
        // Non-fatal: fall back to default year range
    }

    const fromPeriod = `${firstYear}M01`;
    const dataUrl =
        `${BASE}/tables/${TABLE}/data?lang=${LANG}` +
        `&valueCodes[${DIM}]=*` +
        `&valueCodes[ContentsCode]=${CONTENTS_INDEX}` +
        `&valueCodes[Tid]=from(${fromPeriod})` +
        `&codelist[${DIM}]=${CODELIST}` +
        `&outputformat=json-stat2`;

    const dataRes = await fetch(dataUrl);
    if (!dataRes.ok) throw new Error(`Datafetch feilet: ${dataRes.status} ${dataRes.statusText}`);
    const rawJson = await dataRes.json();

    const ds = JSONstat(rawJson).Dataset(0);
    const groupDim = ds.Dimension(DIM);
    const timeDim = ds.Dimension("Tid");
    const groupIds: string[] = groupDim.id;
    const timeIds: string[] = timeDim.id;
    const flatValues: (number | null)[] = ds.value;
    const nTime = timeIds.length;

    if (groupIds.length === 0) {
        throw new Error("SSB-responsen inneholdt ingen varekoder. Sjekk API-tilgang.");
    }

    const codes: CpiCode[] = groupIds.map((code) => {
        const cat = groupDim.Category(code);
        return { code, label: cat?.label ?? code, level: codeLevel(code), parentCode: parentOf(code) };
    });

    if (timeIds.length > 0) {
        const yearFromData = parseInt(timeIds[timeIds.length - 1].slice(0, 4));
        if (yearFromData > lastYear) lastYear = yearFromData;
    }

    const annualIndex: Record<string, Record<number, number>> = {};
    const annualCount: Record<string, Record<number, number>> = {};

    groupIds.forEach((code, gi) => {
        annualIndex[code] = {};
        annualCount[code] = {};
        timeIds.forEach((period, ti) => {
            const val = flatValues[gi * nTime + ti];
            if (val === null || val === 0) return;
            const year = parseInt(period.slice(0, 4));
            annualIndex[code][year] = (annualIndex[code][year] ?? 0) + val;
            annualCount[code][year] = (annualCount[code][year] ?? 0) + 1;
        });
        for (const y of Object.keys(annualIndex[code])) {
            const yr = Number(y);
            annualIndex[code][yr] = annualIndex[code][yr] / annualCount[code][yr];
        }
    });

    const nationalWeights: Record<string, number> = { ...NATIONAL_WEIGHTS_DIVISION, "00": 1.0 };

    return { codes, annualIndex, firstYear, lastYear, nationalWeights };
}

/* ── Calculation ────────────────────────────────────────────────────────── */
function codesAtLevel(codes: CpiCode[], level: GranularityLevel): CpiCode[] {
    return codes.filter((c) => c.level === level);
}

function computeShares(
    selectedCodes: CpiCode[],
    weights: Record<string, number>,
    inputMode: InputMode,
): Record<string, number> {
    const total = selectedCodes.reduce((s, c) => s + (weights[c.code] ?? 0), 0);
    if (total <= 0) {
        const eq = 1 / selectedCodes.length;
        return Object.fromEntries(selectedCodes.map((c) => [c.code, eq]));
    }
    void inputMode; // both modes normalise the same way
    return Object.fromEntries(selectedCodes.map((c) => [c.code, (weights[c.code] ?? 0) / total]));
}

function interpWage(year: number, startYear: number, endYear: number, wageStart: number, wageEnd: number): number {
    if (startYear === endYear) return wageStart;
    const t = (year - startYear) / (endYear - startYear);
    return wageStart + t * (wageEnd - wageStart);
}

function calculate(state: AppState, data: SsbData): CalcResult | null {
    const { startYear, endYear, wageStart, wageEnd, level, inputMode, weights } = state;
    if (endYear <= startYear) return null;

    const selectedCodes = codesAtLevel(data.codes, level);
    if (selectedCodes.length === 0) return null;

    const shares = computeShares(selectedCodes, weights, inputMode);
    const { annualIndex } = data;
    const y0 = startYear;
    const y1 = endYear;

    const yearPoints: YearPoint[] = [];
    for (let y = y0; y <= y1; y++) {
        let P = 0;
        let validWeightSum = 0;
        for (const c of selectedCodes) {
            const Iy0 = annualIndex[c.code]?.[y0];
            const Iy = annualIndex[c.code]?.[y];
            if (Iy0 && Iy) {
                P += shares[c.code] * (Iy / Iy0);
                validWeightSum += shares[c.code];
            }
        }
        if (validWeightSum > 0 && validWeightSum < 1) P = P / validWeightSum;
        P *= 100;

        const totalI0 = annualIndex["00"]?.[y0];
        const totalIy = annualIndex["00"]?.[y];
        const O = totalI0 && totalIy ? 100 * (totalIy / totalI0) : 100;

        const wage0 = wageStart;
        const wageY = interpWage(y, y0, y1, wageStart, wageEnd);
        const W = 100 * (wageY / wage0);

        const R = P > 0 ? 100 * (W / P) : 0;
        const Ro = O > 0 ? 100 * (W / O) : 0;

        yearPoints.push({ year: y, P, O, W, R, Ro });
    }

    const finalP = yearPoints[yearPoints.length - 1]?.P ?? 100;
    const finalO = yearPoints[yearPoints.length - 1]?.O ?? 100;
    const finalW = yearPoints[yearPoints.length - 1]?.W ?? 100;

    const personalInflation = (finalP - 100) / 100;
    const officialInflation = (finalO - 100) / 100;
    const wageGrowth = (finalW - 100) / 100;
    const realWageChange = (finalP > 0 ? finalW / finalP : 1) - 1;
    const realWageChangeOfficial = (finalO > 0 ? finalW / finalO : 1) - 1;

    const contributions: ContributionItem[] = selectedCodes
        .map((c) => {
            const Iy0 = annualIndex[c.code]?.[y0];
            const Iy1 = annualIndex[c.code]?.[y1];
            const growth = Iy0 && Iy1 ? Iy1 / Iy0 - 1 : 0;
            return { code: c.code, label: c.label, ci: shares[c.code] * growth, share: shares[c.code] };
        })
        .sort((a, b) => Math.abs(b.ci) - Math.abs(a.ci));

    const basketItems: BasketItem[] = selectedCodes
        .filter((c) => data.nationalWeights[c.code] !== undefined)
        .map((c) => {
            const si = shares[c.code];
            const wi = data.nationalWeights[c.code] ?? 0;
            const Iy0 = annualIndex[c.code]?.[y0];
            const Iy1 = annualIndex[c.code]?.[y1];
            const priceGrowth = Iy0 && Iy1 ? (Iy1 / Iy0 - 1) * 100 : 0;
            const weightGap = (si - wi) * priceGrowth;
            return { code: c.code, label: c.label, userShare: si * 100, nationalShare: wi * 100, priceGrowth, weightGap };
        })
        .sort((a, b) => b.userShare - a.userShare);

    return {
        yearPoints, contributions, basketItems, shares,
        personalInflation, officialInflation, wageGrowth, realWageChange, realWageChangeOfficial,
    };
}

/* ── URL state ──────────────────────────────────────────────────────────── */
const DEFAULT_STATE: AppState = {
    startYear: 2019,
    endYear: 2024,
    wageStart: 600000,
    wageEnd: 700000,
    level: 1,
    inputMode: "pct",
    weights: {},
};

function encode(state: AppState): string {
    try {
        return btoa(encodeURIComponent(JSON.stringify(state)));
    } catch {
        return "";
    }
}
function decode(s: string): AppState | null {
    try {
        return JSON.parse(decodeURIComponent(atob(s))) as AppState;
    } catch {
        return null;
    }
}

/* ── Small UI helpers ───────────────────────────────────────────────────── */
const Card = ({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "var(--r-panel)", ...style }}>
        {children}
    </div>
);

function Toggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: "6px 14px",
                border: `1px solid ${active ? C.accent : C.border}`,
                background: active ? C.accent : C.card,
                color: active ? "#fff" : C.text,
                cursor: "pointer",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                transition: "all 0.15s",
            }}
        >
            {children}
        </button>
    );
}

const SectionTitle = ({ title, desc }: { title: string; desc?: string }) => (
    <>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: C.text, margin: "0 0 4px", fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}>
            {title}
        </h2>
        {desc && <p style={{ fontSize: 13, color: C.muted, margin: "0 0 14px", fontFamily: "var(--font-serif)", lineHeight: 1.5 }}>{desc}</p>}
    </>
);

const LEVEL_LABELS: Record<GranularityLevel, string> = {
    0: "Totalindeks",
    1: "Divisjonar (2-siffer)",
    2: "Grupper (3-siffer)",
    3: "Full detaljering",
};

function growthColor(growth: number, officialGrowth: number | null): string {
    if (officialGrowth === null) return C.faint;
    const diff = growth - officialGrowth;
    if (diff > 0.5) return C.negative;
    if (diff < -0.5) return C.positive;
    return C.faint;
}

/* ── Main page ──────────────────────────────────────────────────────────── */
export default function KpiKalkulator() {
    const [mounted, setMounted] = useState(false);
    const [state, setStateRaw] = useState<AppState>(DEFAULT_STATE);
    const [data, setData] = useState<SsbData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Read shared state from URL on mount (client only)
    useEffect(() => {
        setMounted(true);
        const params = new URLSearchParams(window.location.search);
        const s = params.get("s");
        if (s) {
            const decoded = decode(s);
            if (decoded) setStateRaw(decoded);
        }
    }, []);

    const setState = useCallback(
        (updater: AppState | ((prev: AppState) => AppState)) => setStateRaw(updater),
        [],
    );

    // Keep the shareable URL in sync with state — done in an effect (not inside the
    // state updater) so the history side effect never runs during render.
    useEffect(() => {
        if (!mounted) return;
        const encoded = encode(state);
        const url = encoded ? `?s=${encoded}` : window.location.pathname;
        window.history.replaceState({}, "", url);
    }, [state, mounted]);

    const copyShareLink = useCallback(() => {
        const encoded = encode(state);
        const url = `${window.location.origin}${window.location.pathname}?s=${encoded}`;
        navigator.clipboard
            .writeText(url)
            .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            })
            .catch(() => prompt("Kopier denne lenka:", url));
    }, [state]);

    useEffect(() => {
        setLoading(true);
        setError(null);
        fetchSsbData()
            .then((d) => {
                setData(d);
                setLoading(false);
            })
            .catch((e: Error) => {
                setError(e.message);
                setLoading(false);
            });
    }, []);

    const result = useMemo(() => (data ? calculate(state, data) : null), [state, data]);

    if (!mounted) return null;

    return (
        <div style={{ background: C.bg, minHeight: "100vh", paddingBottom: 60 }}>
            <style jsx global>{`
                .kpi-num {
                    width: 100%;
                    text-align: right;
                    font-size: 13px;
                    padding: 4px 6px;
                    background: var(--t-surface);
                    border: 1px solid var(--t-border-subtle);
                    border-radius: 4px;
                    color: var(--t-text);
                    outline: none;
                }
                .kpi-num:focus { border-color: var(--ch-accent); }
                .kpi-select {
                    font-size: 13px;
                    padding: 5px 8px;
                    background: var(--t-surface);
                    border: 1px solid var(--t-border-subtle);
                    border-radius: 6px;
                    color: var(--t-text);
                    outline: none;
                }
                .kpi-select:focus { border-color: var(--ch-accent); }
            `}</style>

            <div className="mx-auto max-w-[75rem]" style={{ padding: "20px 16px", paddingTop: "calc(var(--nav-height) + 20px)" }}>
                {/* HEADER */}
                <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ background: C.accent, color: "#fff", padding: 8, borderRadius: 10, display: "flex" }}>
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: C.text, fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>
                                Personleg KPI-kalkulator
                            </h1>
                            <p style={{ margin: "2px 0 0", fontSize: 14, color: C.muted, fontFamily: "var(--font-serif)" }}>
                                Vekt SSBs konsumprisindeks med di eiga forbrukskurv og sjå di personlege kjøpekraftsutvikling.
                            </p>
                        </div>
                    </div>
                </div>

                {loading && (
                    <Card style={{ padding: 40, textAlign: "center", color: C.muted }}>
                        <div style={{ fontSize: 20, marginBottom: 8 }}>⏳</div>
                        Hentar data frå SSB Statistikkbanken…
                    </Card>
                )}

                {error && (
                    <Card style={{ padding: 20, borderColor: C.negative, color: C.negative }}>
                        <strong>Feil ved henting av data frå SSB:</strong> {error}
                        <br />
                        <small style={{ color: C.muted }}>Sjekk nettverkstilkoplinga og prøv å laste sida på nytt.</small>
                    </Card>
                )}

                {!loading && !error && data && (
                    <>
                        <InputPanel state={state} data={data} onChange={setState} onCopyLink={copyShareLink} copied={copied} />

                        {state.endYear <= state.startYear && (
                            <Card style={{ padding: 12, borderColor: C.c3, marginBottom: 16, fontSize: 14, color: C.text }}>
                                ⚠ Sluttår må vere etter startår.
                            </Card>
                        )}

                        {result ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                                <SummaryCards result={result} />
                                <Card style={{ padding: "20px 16px" }}>
                                    <IndexChart yearPoints={result.yearPoints} />
                                </Card>
                                <Card style={{ padding: "20px 16px" }}>
                                    <BuyingPowerChart yearPoints={result.yearPoints} />
                                </Card>
                                <Card style={{ padding: "20px 16px" }}>
                                    <ContributionsChart contributions={result.contributions} />
                                </Card>
                                <Card style={{ padding: "20px 16px" }}>
                                    <BasketComparisonChart basketItems={result.basketItems} />
                                </Card>
                                <Card style={{ padding: "20px 16px" }}>
                                    <PriceRankingChart data={data} level={state.level} startYear={state.startYear} endYear={state.endYear} />
                                </Card>
                            </div>
                        ) : (
                            <Card style={{ padding: 24, textAlign: "center", color: C.muted }}>
                                Fyll inn kurvvekter og periode over for å sjå resultat.
                            </Card>
                        )}

                        <Footer />
                    </>
                )}

                <section className="py-6" style={{ marginTop: 24, borderTop: `1px solid ${C.border}` }}>
                    <Link href="/calculators" className="inline-flex items-center gap-1.5 text-xs font-medium hover:underline" style={{ color: C.accent }}>
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        Alle kalkulatorar
                    </Link>
                </section>
            </div>
        </div>
    );
}

/* ── Input panel ────────────────────────────────────────────────────────── */
interface PriceGrowth {
    total: number;
    annual: number;
}

function computePriceGrowth(
    codes: CpiCode[],
    annualIndex: Record<string, Record<number, number>>,
    y0: number,
    y1: number,
): Record<string, PriceGrowth> {
    if (y1 <= y0) return {};
    const n = y1 - y0;
    const out: Record<string, PriceGrowth> = {};
    for (const c of codes) {
        const I0 = annualIndex[c.code]?.[y0];
        const I1 = annualIndex[c.code]?.[y1];
        if (!I0 || !I1) continue;
        const ratio = I1 / I0;
        out[c.code] = { total: (ratio - 1) * 100, annual: (Math.pow(ratio, 1 / n) - 1) * 100 };
    }
    return out;
}

function fmtGrowthLabel(total: number, annual: number): string {
    const s = (v: number) => (v >= 0 ? "+" : "") + fmtNum(v, 1) + "%";
    return `${s(total)} tot. (${s(annual)} p.a.)`;
}

function InputPanel({
    state,
    data,
    onChange,
    onCopyLink,
    copied,
}: {
    state: AppState;
    data: SsbData;
    onChange: (updater: (prev: AppState) => AppState) => void;
    onCopyLink: () => void;
    copied: boolean;
}) {
    const { startYear, endYear, wageStart, wageEnd, level, inputMode, weights } = state;

    const years = useMemo(() => {
        const arr: number[] = [];
        for (let y = data.firstYear; y <= data.lastYear; y++) arr.push(y);
        return arr;
    }, [data]);

    const selectedCodes = useMemo(() => codesAtLevel(data.codes, level), [data, level]);
    const shares = useMemo(() => computeShares(selectedCodes, weights, inputMode), [selectedCodes, weights, inputMode]);
    const weightTotal = useMemo(() => selectedCodes.reduce((s, c) => s + (weights[c.code] ?? 0), 0), [selectedCodes, weights]);
    const sumOk = inputMode === "pct" ? Math.abs(weightTotal - 100) < 0.5 : weightTotal > 0;

    const officialGrowthPct = useMemo((): number | null => {
        if (endYear <= startYear) return null;
        const I0 = data.annualIndex["00"]?.[startYear];
        const I1 = data.annualIndex["00"]?.[endYear];
        if (!I0 || !I1) return null;
        return (I1 / I0 - 1) * 100;
    }, [data, startYear, endYear]);

    const priceGrowthByCode = useMemo(
        () => computePriceGrowth(selectedCodes, data.annualIndex, startYear, endYear),
        [data, selectedCodes, startYear, endYear],
    );

    function setWeight(code: string, val: string) {
        const num = parseFloat(val.replace(",", "."));
        onChange((prev) => ({ ...prev, weights: { ...prev.weights, [code]: isNaN(num) ? 0 : num } }));
    }
    function normalise() {
        if (weightTotal <= 0) return;
        const factor = inputMode === "pct" ? 100 / weightTotal : 1;
        onChange((prev) => {
            const newW: Record<string, number> = {};
            for (const c of selectedCodes) newW[c.code] = (prev.weights[c.code] ?? 0) * factor;
            return { ...prev, weights: newW };
        });
    }
    function useNational() {
        onChange((prev) => {
            const newW: Record<string, number> = {};
            for (const c of selectedCodes) {
                const natShare = data.nationalWeights[c.code] ?? 0;
                newW[c.code] = inputMode === "pct" ? natShare * 100 : natShare * 100000;
            }
            return { ...prev, weights: newW };
        });
    }
    function setLevel(newLevel: GranularityLevel) {
        onChange((prev) => ({ ...prev, level: newLevel, weights: {} }));
    }

    const inputLabel = inputMode === "nok" ? "NOK/mnd" : "%";
    const labelStrong = { fontSize: 13, fontWeight: 700, color: C.text, fontFamily: "var(--font-display)" } as React.CSSProperties;

    return (
        <Card style={{ padding: 20, marginBottom: 20 }}>
            {/* Period + Wages */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginBottom: 20 }}>
                <fieldset style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 16px", minWidth: 200 }}>
                    <legend style={{ ...labelStrong, padding: "0 4px" }}>Periode</legend>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <label style={{ fontSize: 13, color: C.muted }}>
                            Frå{" "}
                            <select value={startYear} onChange={(e) => onChange((p) => ({ ...p, startYear: Number(e.target.value) }))} className="kpi-select" style={{ marginLeft: 4 }}>
                                {years.map((y) => (<option key={y} value={y} disabled={y >= endYear}>{y}</option>))}
                            </select>
                        </label>
                        <label style={{ fontSize: 13, color: C.muted }}>
                            Til{" "}
                            <select value={endYear} onChange={(e) => onChange((p) => ({ ...p, endYear: Number(e.target.value) }))} className="kpi-select" style={{ marginLeft: 4 }}>
                                {years.map((y) => (<option key={y} value={y} disabled={y <= startYear}>{y}</option>))}
                            </select>
                        </label>
                    </div>
                </fieldset>

                <fieldset style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 16px", minWidth: 280 }}>
                    <legend style={{ ...labelStrong, padding: "0 4px" }}>Årslønn (NOK)</legend>
                    <div style={{ display: "flex", gap: 16 }}>
                        <label style={{ fontSize: 13, color: C.muted }}>
                            Startår{" "}
                            <input type="number" value={wageStart} min={0} step={10000} onChange={(e) => onChange((p) => ({ ...p, wageStart: Number(e.target.value) }))} className="kpi-num" style={{ width: 110, marginLeft: 4, display: "inline-block" }} />
                        </label>
                        <label style={{ fontSize: 13, color: C.muted }}>
                            Sluttår{" "}
                            <input type="number" value={wageEnd} min={0} step={10000} onChange={(e) => onChange((p) => ({ ...p, wageEnd: Number(e.target.value) }))} className="kpi-num" style={{ width: 110, marginLeft: 4, display: "inline-block" }} />
                        </label>
                    </div>
                </fieldset>
            </div>

            {/* Granularity */}
            <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <Settings size={16} color={C.muted} />
                    <span style={labelStrong}>Granularitetsnivå</span>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {([0, 1, 2, 3] as GranularityLevel[]).map((lvl) => (
                        <Toggle key={lvl} active={level === lvl} onClick={() => setLevel(lvl)}>{LEVEL_LABELS[lvl]}</Toggle>
                    ))}
                </div>
            </div>

            {/* Input mode */}
            <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={labelStrong}>Kurvvekter som:</span>
                <Toggle active={inputMode === "pct"} onClick={() => onChange((p) => ({ ...p, inputMode: "pct" }))}>Prosent (%)</Toggle>
                <Toggle active={inputMode === "nok"} onClick={() => onChange((p) => ({ ...p, inputMode: "nok" }))}>NOK/mnd</Toggle>
            </div>

            {/* Weight table */}
            {selectedCodes.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
                        <span style={labelStrong}>Di forbrukskurv</span>
                        {!sumOk && (
                            <span style={{ color: C.negative, fontSize: 13 }}>
                                ⚠ Sum = {fmtNum(weightTotal)}{inputMode === "pct" ? "%" : " NOK"} — bør vere {inputMode === "pct" ? "100%" : "> 0"}
                            </span>
                        )}
                        {!sumOk && <Toggle active={false} onClick={normalise}>Normaliser</Toggle>}
                        <Toggle active={false} onClick={useNational}>Bruk nasjonal kurv</Toggle>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "38px 1fr 174px 56px 80px 30px 54px", alignItems: "end", borderBottom: `2px solid ${C.borderStrong}`, paddingBottom: 4, marginBottom: 1, userSelect: "none" }}>
                            <div />
                            <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, paddingLeft: 2 }}>Kategori</div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: C.text, textAlign: "right", padding: "0 8px 0 0", lineHeight: 1.3 }}>
                                Prisendring
                                <div style={{ fontSize: 10, fontWeight: 400, color: C.faint }}>tot. &amp; p.a.</div>
                            </div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: C.faint, textAlign: "right", paddingRight: 4, lineHeight: 1.3 }} title="Nasjonale referansevekter (SSB 2024-basket)">
                                Ref.<div style={{ fontSize: 9, fontWeight: 400 }}>nasjonal</div>
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: C.text, textAlign: "right", paddingRight: 4 }}>Din andel</div>
                            <div />
                            <div style={{ fontSize: 11, fontWeight: 600, color: C.faint, textAlign: "right", paddingRight: 4 }}>{sumOk ? "Andel" : ""}</div>
                        </div>

                        {selectedCodes.map((c, idx) => {
                            const natShare = data.nationalWeights[c.code];
                            const pg = priceGrowthByCode[c.code];
                            const pgColor = pg ? growthColor(pg.total, officialGrowthPct) : C.faint;
                            const rowBg = idx % 2 === 0 ? "transparent" : "var(--t-surface)";
                            return (
                                <div key={c.code} style={{ display: "grid", gridTemplateColumns: "38px 1fr 174px 56px 80px 30px 54px", alignItems: "center", background: rowBg, borderBottom: `1px solid ${C.border}`, minHeight: 32 }}>
                                    <span style={{ fontSize: 10, color: C.faint, fontFamily: "monospace", paddingLeft: 2, whiteSpace: "nowrap" }}>{c.code}</span>
                                    <span style={{ fontSize: 13, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingLeft: 2, paddingRight: 10 }} title={c.label}>{c.label}</span>
                                    <div style={{ padding: "3px 8px", alignSelf: "stretch", display: "flex", alignItems: "center", justifyContent: "flex-end" }} title={pg ? `Totalt: ${fmtNum(pg.total, 1)}%, Annualisert: ${fmtNum(pg.annual, 1)}% p.a.` : ""}>
                                        <span style={{ fontSize: 11, color: pgColor, fontWeight: 600, whiteSpace: "nowrap" }}>{pg ? fmtGrowthLabel(pg.total, pg.annual) : "–"}</span>
                                    </div>
                                    <span style={{ fontSize: 11, color: C.faint, textAlign: "right", paddingRight: 4, whiteSpace: "nowrap" }}>{natShare !== undefined ? `${fmtNum(natShare * 100, 1)}%` : ""}</span>
                                    <input type="number" min={0} step={inputMode === "pct" ? 1 : 500} value={weights[c.code] ?? ""} placeholder="0" onChange={(e) => setWeight(c.code, e.target.value)} className="kpi-num" />
                                    <span style={{ fontSize: 11, color: C.faint, paddingLeft: 4, whiteSpace: "nowrap" }}>{inputLabel}</span>
                                    <span style={{ fontSize: 11, color: C.muted, textAlign: "right", paddingRight: 4, whiteSpace: "nowrap" }}>{sumOk ? fmtPct(shares[c.code] ?? 0, false) : ""}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Copy link */}
            <div style={{ marginTop: 12 }}>
                <button
                    onClick={onCopyLink}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", background: C.accent, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
                >
                    {copied ? <Check size={14} /> : <Share2 size={14} />}
                    {copied ? "Lenke kopiert!" : "Kopier delingslenke"}
                </button>
            </div>
        </Card>
    );
}

/* ── Summary cards ──────────────────────────────────────────────────────── */
function SummaryCards({ result }: { result: CalcResult }) {
    const { personalInflation, officialInflation, wageGrowth, realWageChange, realWageChangeOfficial } = result;
    const verdict: "positive" | "negative" | "neutral" = realWageChange > 0 ? "positive" : realWageChange < 0 ? "negative" : "neutral";

    const cards: { label: string; value: string; highlight: "positive" | "negative" | "neutral"; sub: string }[] = [
        { label: "Di personlege inflasjon", value: fmtPct(personalInflation), highlight: personalInflation > officialInflation ? "negative" : "positive", sub: "Basert på di kurv" },
        { label: "Offisiell KPI", value: fmtPct(officialInflation), highlight: "neutral", sub: "Totalindeks SSB" },
        { label: "Nominell lønnsvekst", value: fmtPct(wageGrowth), highlight: "neutral", sub: "Over perioden" },
        { label: "Realkjøpekraft (di kurv)", value: fmtPct(realWageChange), highlight: verdict, sub: realWageChange >= 0 ? "✓ Kjøpekraft auka" : "✗ Kjøpekraft fall" },
        { label: "Realkjøpekraft (offisiell)", value: fmtPct(realWageChangeOfficial), highlight: realWageChangeOfficial >= 0 ? "positive" : "negative", sub: "Med offisiell KPI" },
    ];

    const colorFor = (h: "positive" | "negative" | "neutral") => (h === "positive" ? C.positive : h === "negative" ? C.negative : C.text);

    return (
        <div>
            <SectionTitle title="Oppsummering" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 10 }}>
                {cards.map((c) => (
                    <Card key={c.label} style={{ padding: "16px 18px", borderTop: `3px solid ${colorFor(c.highlight)}` }}>
                        <div style={{ fontSize: 12, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }}>{c.label}</div>
                        <div style={{ fontSize: 26, fontWeight: 800, color: colorFor(c.highlight), fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-display)" }}>{c.value}</div>
                        <div style={{ fontSize: 12, color: C.faint, marginTop: 4 }}>{c.sub}</div>
                    </Card>
                ))}
            </div>
            <p style={{ fontSize: 13, color: C.muted, margin: 0, fontFamily: "var(--font-serif)" }}>
                {realWageChange > 0
                    ? `Kjøpekrafta di auka med ${fmtPct(realWageChange)} — lønna steig raskare enn di personlege inflasjon.`
                    : realWageChange < 0
                        ? `Kjøpekrafta di fall med ${fmtPct(Math.abs(realWageChange))} — prisane i di kurv steig raskare enn lønna.`
                        : "Kjøpekrafta di heldt seg stabil i perioden."}
            </p>
        </div>
    );
}

/* ── Charts ─────────────────────────────────────────────────────────────── */
function IndexChart({ yearPoints }: { yearPoints: YearPoint[] }) {
    if (yearPoints.length < 2) return null;
    return (
        <div>
            <SectionTitle title="Indeksar over tid (basis 100 ved startår)" desc="Personleg prisindeks, offisiell KPI og nominell lønnsindeks — alle rebaserte til 100 ved startår." />
            <ResponsiveContainer width="100%" height={320}>
                <LineChart data={yearPoints} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.axisText} opacity={0.2} />
                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: C.axisText }} />
                    <YAxis domain={["auto", "auto"]} tickFormatter={(v) => fmtIndex(v)} width={55} tick={{ fontSize: 11, fill: C.axisText }} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [fmtIndex(Number(value)), String(name)]} labelFormatter={(y) => `År ${y}`} />
                    <Legend wrapperStyle={{ fontSize: 12 }} iconType="plainline" />
                    <ReferenceLine y={100} stroke={C.faint} strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="W" name="Lønn" stroke={C.c5} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="P" name="Din prisindeks" stroke={C.c1} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="O" name="Offisiell KPI" stroke={C.c3} strokeWidth={2} strokeDasharray="5 3" dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

function BuyingPowerChart({ yearPoints }: { yearPoints: YearPoint[] }) {
    if (yearPoints.length < 2) return null;
    return (
        <div>
            <SectionTitle title="Reell kjøpekraft over tid" desc="Over 100 betyr at kjøpekrafta har auka samanlikna med startåret. Under 100 betyr at ho har falle." />
            <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={yearPoints} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <defs>
                        <linearGradient id="kpiGradR" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={C.c5} stopOpacity={0.18} />
                            <stop offset="95%" stopColor={C.c5} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="kpiGradRo" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={C.c1} stopOpacity={0.18} />
                            <stop offset="95%" stopColor={C.c1} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.axisText} opacity={0.2} />
                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: C.axisText }} />
                    <YAxis domain={["auto", "auto"]} tickFormatter={(v) => fmtIndex(v)} width={55} tick={{ fontSize: 11, fill: C.axisText }} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [fmtIndex(Number(value)), String(name)]} labelFormatter={(y) => `År ${y}`} />
                    <Legend wrapperStyle={{ fontSize: 12 }} iconType="plainline" />
                    <ReferenceLine y={100} stroke={C.faint} strokeDasharray="4 4" />
                    <Area type="monotone" dataKey="R" name="Di kjøpekraft" stroke={C.c5} fill="url(#kpiGradR)" strokeWidth={2} dot={false} />
                    <Area type="monotone" dataKey="Ro" name="Kjøpekraft (offisiell KPI)" stroke={C.c1} fill="url(#kpiGradRo)" strokeWidth={2} strokeDasharray="5 3" dot={false} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

function ContributionsChart({ contributions }: { contributions: ContributionItem[] }) {
    if (contributions.length === 0) return null;
    const data = contributions.slice(0, 20).map((c) => ({ ...c, color: c.ci >= 0 ? C.accent : C.negative }));
    const maxAbs = Math.max(...data.map((d) => Math.abs(d.ci)));
    const domain: [number, number] = [-maxAbs * 1.1, maxAbs * 1.1];
    return (
        <div>
            <SectionTitle title="Bidrag til personleg inflasjon per kategori" desc="Kvar søyle viser kor mykje ein kategori bidreg til den totale prisindeksen din (prosentpoeng)." />
            <ResponsiveContainer width="100%" height={Math.max(220, data.length * 28)}>
                <BarChart data={data} layout="vertical" margin={{ top: 0, right: 60, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.axisText} opacity={0.2} horizontal={false} />
                    <XAxis type="number" domain={domain} tickFormatter={(v) => fmtPct(v)} tick={{ fontSize: 11, fill: C.axisText }} />
                    <YAxis type="category" dataKey="label" width={280} tick={{ fontSize: 12, fill: C.axisText }} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(value) => [fmtPct(Number(value)), "Bidrag"]} />
                    <ReferenceLine x={0} stroke={C.muted} />
                    <Bar dataKey="ci" name="Bidrag" radius={[0, 3, 3, 0]}>
                        {data.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

function BasketComparisonChart({ basketItems }: { basketItems: BasketItem[] }) {
    if (basketItems.length === 0) return null;
    return (
        <div>
            <SectionTitle title="Di kurv vs. nasjonal kurv" desc="Samanliknar din vektdel per kategori (%) med SSBs nasjonale vekter." />
            <ResponsiveContainer width="100%" height={Math.max(220, basketItems.length * 30)}>
                <BarChart data={basketItems} layout="vertical" margin={{ top: 0, right: 80, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.axisText} opacity={0.2} horizontal={false} />
                    <XAxis type="number" tickFormatter={(v) => `${fmtNum(v)}%`} tick={{ fontSize: 11, fill: C.axisText }} />
                    <YAxis type="category" dataKey="label" width={280} tick={{ fontSize: 12, fill: C.axisText }} />
                    <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value, name, props) => {
                            const item = (props as { payload?: BasketItem }).payload;
                            const extra = name === "Din andel (%)" && item ? ` (prisvekst: ${fmtNum(item.priceGrowth)}%)` : "";
                            return [`${fmtNum(Number(value))}%${extra}`, String(name)];
                        }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
                    <Bar dataKey="userShare" name="Din andel (%)" fill={C.c5} radius={[0, 3, 3, 0]} />
                    <Bar dataKey="nationalShare" name="Nasjonal andel (%)" fill={C.c1} opacity={0.6} radius={[0, 3, 3, 0]} />
                </BarChart>
            </ResponsiveContainer>
            <p style={{ fontSize: 12, color: C.faint, marginTop: 8 }}>
                Nasjonale vekter er tilgjengelege på divisjonsnivå (COICOP 2-siffer). Finare granularitet viser berre di kurv.
            </p>
        </div>
    );
}

function PriceRankingChart({ data, level, startYear, endYear }: { data: SsbData; level: GranularityLevel; startYear: number; endYear: number }) {
    if (endYear <= startYear) return null;
    const n = endYear - startYear;
    const codes = codesAtLevel(data.codes, level);
    if (codes.length === 0) return null;

    const officialI0 = data.annualIndex["00"]?.[startYear];
    const officialI1 = data.annualIndex["00"]?.[endYear];
    const officialGrowthPct = officialI0 && officialI1 ? (officialI1 / officialI0 - 1) * 100 : null;

    const truncate = (s: string, max: number) => (s.length > max ? s.slice(0, max - 1) + "…" : s);

    const items = codes
        .map((c) => {
            const I0 = data.annualIndex[c.code]?.[startYear];
            const I1 = data.annualIndex[c.code]?.[endYear];
            if (!I0 || !I1) return null;
            const ratio = I1 / I0;
            return {
                code: c.code,
                label: c.label,
                shortLabel: truncate(c.label, level >= 2 ? 32 : 42),
                totalGrowthPct: (ratio - 1) * 100,
                annualGrowthPct: (Math.pow(ratio, 1 / n) - 1) * 100,
            };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null)
        .sort((a, b) => b.totalGrowthPct - a.totalGrowthPct);

    if (items.length === 0) return null;

    const BAR_H = level >= 2 ? 18 : 22;
    const chartHeight = items.length * BAR_H + 60;
    const labelWidth = level >= 2 ? 240 : 280;

    const barColor = (growth: number) => {
        if (officialGrowthPct === null) return C.faint;
        const diff = growth - officialGrowthPct;
        if (diff > 0.5) return C.negative;
        if (diff < -0.5) return C.positive;
        return C.faint;
    };

    return (
        <div>
            <SectionTitle
                title="Prisutvikling per kategori"
                desc={`Total prisvekst ${startYear}–${endYear} per kategori, sortert frå høgast til lågast.${officialGrowthPct !== null ? ` Stipla linje viser offisiell KPI-vekst. Raud = over KPI, grøn = under KPI.` : ""}`}
            />
            {items.length > 40 && (
                <p style={{ fontSize: 12, color: C.faint, marginBottom: 8 }}>Viser alle {items.length} kategoriar — rull for å sjå heile lista.</p>
            )}
            <div style={{ overflowY: "auto", maxHeight: 720 }}>
                <div style={{ height: chartHeight, minWidth: 500 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={items} layout="vertical" margin={{ top: 4, right: 70, left: 0, bottom: 4 }} barSize={BAR_H - 4}>
                            <CartesianGrid strokeDasharray="3 3" stroke={C.axisText} opacity={0.2} horizontal={false} />
                            <XAxis type="number" tickFormatter={(v) => `${v >= 0 ? "+" : ""}${fmtNum(v, 0)}%`} tick={{ fontSize: 11, fill: C.axisText }} />
                            <YAxis type="category" dataKey="shortLabel" width={labelWidth} tick={{ fontSize: 11, fill: C.axisText }} />
                            <Tooltip
                                contentStyle={tooltipStyle}
                                formatter={(value: unknown) => {
                                    const v = Number(value);
                                    return [`${v >= 0 ? "+" : ""}${fmtNum(v, 1)}%`, "Total prisvekst"];
                                }}
                                labelFormatter={(_label, payload) => {
                                    if (!payload?.length) return "";
                                    const item = payload[0].payload as { label: string; annualGrowthPct: number };
                                    const annStr = (item.annualGrowthPct >= 0 ? "+" : "") + fmtNum(item.annualGrowthPct, 1) + "% p.a.";
                                    return `${item.label} (${annStr})`;
                                }}
                            />
                            {officialGrowthPct !== null && (
                                <ReferenceLine
                                    x={officialGrowthPct}
                                    stroke={C.text}
                                    strokeDasharray="5 3"
                                    strokeWidth={1.5}
                                    label={{ value: `KPI ${(officialGrowthPct >= 0 ? "+" : "") + fmtNum(officialGrowthPct, 1)}%`, position: "top", fontSize: 11, fill: C.text }}
                                />
                            )}
                            <Bar dataKey="totalGrowthPct" name="Prisvekst" isAnimationActive={items.length < 60} radius={[0, 3, 3, 0]}>
                                {items.map((entry, i) => (<Cell key={`cell-${i}`} fill={barColor(entry.totalGrowthPct)} />))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

/* ── Footer ─────────────────────────────────────────────────────────────── */
function Footer() {
    return (
        <footer style={{ marginTop: 36, padding: "20px 0", borderTop: `1px solid ${C.border}`, fontSize: 13, color: C.muted, fontFamily: "var(--font-serif)", lineHeight: 1.55 }}>
            <p style={{ marginBottom: 6, display: "flex", alignItems: "flex-start", gap: 6 }}>
                <Info size={14} style={{ marginTop: 3, flexShrink: 0, color: C.faint }} />
                <span>
                    <strong style={{ color: C.text }}>Datakjelde:</strong> Statistisk sentralbyrå (SSB),{" "}
                    <a href="https://www.ssb.no/statbank/table/14700" target="_blank" rel="noopener noreferrer" style={{ color: C.accent }}>
                        Tabell 14700 — Konsumprisindeks etter vare- og tenestegruppe (COICOP), måned
                    </a>
                    . Lisens: CC BY 4.0.
                </span>
            </p>
            <p style={{ margin: 0 }}>
                <strong style={{ color: C.text }}>Metodekaveat:</strong> Berekningane bruker ei fast kurv (Laspeyres-type approksimering).
                Vektene held seg konstante over perioden, og substitusjon og kvalitetsendringar er ikkje tekne omsyn til.
                Resultatet er ein forenkla indikator, ikkje ei nøyaktig personleg prisvekstmåling.
            </p>
        </footer>
    );
}
