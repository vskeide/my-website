"use client";

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    Cell, ResponsiveContainer, Legend, ReferenceLine
} from "recharts";

const RED    = "#E05A3A";
const GREEN  = "#00B050";
const BLUE   = "#0070C0";
const VIOLET = "#8B3DD0";
const GRAY   = "#938AA6";
const TEAL   = "#4E9A90";
const PALE   = "#90C4BD";

const panelStyle: React.CSSProperties = {
    background: "var(--t-card)",
    border: "1px solid var(--t-border-subtle)",
    borderRadius: "var(--r-panel)",
    padding: "1.25rem 1rem 1rem",
    margin: "2rem 0 2.5rem",
};
const titleStyle: React.CSSProperties = {
    fontWeight: 700,
    fontSize: "0.875rem",
    color: "var(--t-text)",
    marginBottom: "0.2rem",
    fontFamily: "var(--font-display)",
};
const subStyle: React.CSSProperties = {
    fontSize: "0.7rem",
    color: "var(--t-text-muted)",
    marginBottom: "1rem",
    fontFamily: "monospace",
};
const capStyle: React.CSSProperties = {
    fontSize: "0.72rem",
    color: "var(--t-text-muted)",
    marginTop: "0.75rem",
    lineHeight: 1.5,
};
const tooltipStyle: React.CSSProperties = {
    background: "var(--t-card)",
    border: "1px solid var(--t-border-subtle)",
    borderRadius: 8,
    fontSize: "0.75rem",
    color: "var(--t-text)",
    padding: "6px 10px",
};

/* ── 1. Cost development ─────────────────────────────────────────────────── */
export function KostnadChart() {
    const data = [
        { year: "1985",         val: 0.09 },
        { year: "2013 NTP",     val: 2.1  },
        { year: "2018 KS2",     val: 3.8  },
        { year: "2020",         val: 3.45 },
        { year: "2021 vedtak",  val: 4.09 },
        { year: "2023",         val: 5.7  },
        { year: "2025 tilbod",  val: 9.6  },
        { year: "2026 vedteke", val: 8.6  },
    ];
    const colors = [GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, RED, VIOLET];

    return (
        <div style={panelStyle}>
            <div style={titleStyle}>Kostnadsutviklinga 1985–2026</div>
            <div style={subStyle}>Milliardar kroner, nominelt</div>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} margin={{ top: 20, right: 16, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--t-border-subtle)" vertical={false} />
                    <XAxis dataKey="year" tick={{ fontSize: 10, fill: "var(--t-text-muted)" }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={v => v + " mrd"} tick={{ fontSize: 10, fill: "var(--t-text-muted)" }} axisLine={false} tickLine={false} domain={[0, 11]} />
                    <Tooltip
                        contentStyle={tooltipStyle}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={(v: any) => [v + " mrd. kr", ""]}
                        cursor={{ fill: "rgba(0,0,0,0.04)" }}
                    />
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <Bar dataKey="val" radius={[3, 3, 0, 0]} maxBarSize={52} label={{ position: "top", fontSize: 10, fill: "var(--t-text-muted)", formatter: (v: any) => v + " mrd." }}>
                        {data.map((_, i) => <Cell key={i} fill={colors[i]} />)}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            <div style={capStyle}>
                Frå 0,09 mrd. på 1980-talet til vedteken ramme på 8,6 mrd. i juni 2026. Tilbodsprisane frå 2025 (9,6 mrd.) viser kva marknaden faktisk prisa prosjektet til. Kjelder: Kystverket, regjeringen.no, KS2.
            </div>
        </div>
    );
}

/* ── 2. Cost vs benefit ──────────────────────────────────────────────────── */
export function NytteChart() {
    const data = [
        { name: "Investerings-\nkostnad", kostnad: -8.6, steinmassar: 0, ventetid: 0, drivstoff: 0, netto: 0 },
        { name: "Prissett nytte\ntotalt",    kostnad: 0, steinmassar: 1.166, ventetid: 0.476, drivstoff: 0.173, netto: 0 },
        { name: "Netto\nsamfunnsnytte",      kostnad: 0, steinmassar: 0, ventetid: 0, drivstoff: 0, netto: -5.9 },
    ];

    return (
        <div style={panelStyle}>
            <div style={titleStyle}>Kostnad mot prissett nytte</div>
            <div style={subStyle}>Milliardar kroner, noverdi over 75 år · investeringskostnad ekskl. drift og vedlikehald</div>
            <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data} margin={{ top: 20, right: 16, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--t-border-subtle)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--t-text-muted)" }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={v => v + " mrd"} tick={{ fontSize: 10, fill: "var(--t-text-muted)" }} axisLine={false} tickLine={false} domain={[-10, 3]} />
                    <ReferenceLine y={0} stroke="var(--t-border-strong)" />
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: any, name: any) => [v + " mrd. kr", name]} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                    <Legend wrapperStyle={{ fontSize: "0.72rem", color: "var(--t-text-muted)" }} iconSize={10} />
                    <Bar dataKey="kostnad" name="Investeringskostnad" fill={VIOLET} stackId="a" maxBarSize={64} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="steinmassar" name="Steinmassar" fill={GREEN} stackId="a" maxBarSize={64} />
                    <Bar dataKey="ventetid" name="Spart ventetid" fill={TEAL} stackId="a" maxBarSize={64} />
                    <Bar dataKey="drivstoff" name="Drivstoff" fill={PALE} stackId="a" maxBarSize={64} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="netto" name="Netto samfunnsnytte" fill={RED} stackId="a" maxBarSize={64} radius={[3, 3, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
            <div style={capStyle}>
                Sjølve kjerneargumentet for tunnelen — tryggare seglas — er verd om lag 0,65 mrd. i prissett form (ventetid + drivstoff). Det er under 8 % av investeringa. Kjelde: Regjeringas avgjerdsgrunnlag, mai 2026.
            </div>
        </div>
    );
}

/* ── 3. Hypothetical toll ────────────────────────────────────────────────── */
export function AvgiftChart() {
    const data = [
        { name: "Konservativt\n7 skip/døgn",    rente0: 84149,  rente4: 170055 },
        { name: "Forventa\n11 skip/døgn",        rente0: 53549,  rente4: 108217 },
        { name: "Maks kapasitet\n100 skip/døgn", rente0: 5890,   rente4: 11904  },
    ];

    const fmt = (v: number) => v.toLocaleString("nb-NO") + " kr";

    return (
        <div style={panelStyle}>
            <div style={titleStyle}>Kva måtte ei passering ha kosta?</div>
            <div style={subStyle}>Kroner per passering ved full brukarfinansiering over 40 år (berre investeringskostnad)</div>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} margin={{ top: 10, right: 16, left: 16, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--t-border-subtle)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--t-text-muted)" }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={v => (v / 1000).toFixed(0) + "k"} tick={{ fontSize: 10, fill: "var(--t-text-muted)" }} axisLine={false} tickLine={false} domain={[0, 195000]} />
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: any, name: any) => [fmt(v), name]} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                    <Legend wrapperStyle={{ fontSize: "0.72rem", color: "var(--t-text-muted)" }} iconSize={10} />
                    <Bar dataKey="rente0" name="0 % rente" fill={GRAY} maxBarSize={48} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="rente4" name="4 % rente" fill={RED} maxBarSize={48} radius={[3, 3, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
            <div style={capStyle}>
                Sjølv ved teknisk maksimal utnytting (100 skip i døgnet — ni gonger forventa trafikk) blir prisen 6 000–12 000 kr per passering. Driftskostnader kjem i tillegg.
            </div>
        </div>
    );
}

/* ── 4. Opportunity cost (horizontal) ───────────────────────────────────── */
export function AltChart() {
    const data = [
        { name: "Drift Volda sjukehus (~1,26 mrd/år)",           val: 6.8,  color: RED    },
        { name: "Fylkesveg-vedlikehald (1 mrd/år)",               val: 8.6,  color: BLUE   },
        { name: "Kollektivsatsing, billegare månadskort (~1 mrd/år)", val: 8.6, color: BLUE },
        { name: "Karbonfangst-løyvinga (1 mrd)",                  val: 8.6,  color: BLUE   },
        { name: "Jernbanefornying og -vedlikehald (300 mill/år)",  val: 28.7, color: VIOLET },
        { name: "Naturrestaurering (65 mill/år)",                  val: 132,  color: GRAY   },
    ];

    return (
        <div style={panelStyle}>
            <div style={titleStyle}>Kor mange årlege satsingar svarar 8,6 milliardar til?</div>
            <div style={subStyle}>Antal gonger tunnelramma rommar kvar av desse årlege løyvingane frå same budsjettforlik</div>
            <ResponsiveContainer width="100%" height={340}>
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 5, right: 50, left: 8, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--t-border-subtle)" horizontal={false} />
                    <XAxis
                        type="number"
                        tick={{ fontSize: 10, fill: "var(--t-text-muted)" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={v => v + "×"}
                        domain={[0, 145]}
                    />
                    <YAxis
                        type="category"
                        dataKey="name"
                        width={180}
                        tick={{ fontSize: 9, fill: "var(--t-text-muted)" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        contentStyle={tooltipStyle}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={(v: any) => [v.toFixed(1) + "×", "Tunnelramma rommar løyvinga"]}
                        cursor={{ fill: "rgba(0,0,0,0.04)" }}
                    />
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <Bar dataKey="val" maxBarSize={20} radius={[0, 3, 3, 0]} label={{ position: "right", fontSize: 9, fill: "var(--t-text-muted)", formatter: (v: any) => v.toFixed(1) + "×" }}>
                        {data.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            <div style={capStyle}>
                Alle samanlikningar er mot løyvingar i revidert nasjonalbudsjett 2026, same forlik som vedtok tunnelen. Volda sjukehus-driften er anslått til ~15 % av HMR-totalbudsjettet på 8,4 mrd.
            </div>
        </div>
    );
}

/* ── 5. The øyre grid (100 dots) ─────────────────────────────────────────── */
export function OyreGrid() {
    const rowStyle: React.CSSProperties = {
        display: "flex",
        justifyContent: "space-between",
        fontSize: "0.72rem",
        color: "var(--t-text-muted)",
        fontFamily: "monospace",
        marginBottom: "0.2rem",
    };
    const valStyle: React.CSSProperties = { color: "var(--t-text-secondary)", fontWeight: 600 };
    const redVal: React.CSSProperties = { ...valStyle, color: RED };
    const greenVal: React.CSSProperties = { ...valStyle, color: GREEN };

    return (
        <div style={{ ...panelStyle, margin: "2rem 0 1.5rem" }}>
            <div style={titleStyle}>Kva får samfunnet att per investert krone?</div>
            <div style={subStyle}>
                Netto nytte per budsjettkrone (NNB) = −0,95 · Kjelde: Kystverkets analyse (omtalt av NRK, april 2025)
            </div>

            {/* Calculation breakdown */}
            <div style={{ margin: "0 0 1rem", padding: "0.75rem 1rem", background: "var(--t-surface)", borderRadius: "var(--r-panel)", fontSize: "0.72rem", fontFamily: "monospace" }}>
                <div style={rowStyle}>
                    <span>Investeringskostnad</span>
                    <span style={redVal}>−7,0 mrd.</span>
                </div>
                <div style={rowStyle}>
                    <span>+ Skattefinansieringskostnad (20 % av invest.)</span>
                    <span style={redVal}>−1,4 mrd.</span>
                </div>
                <div style={{ ...rowStyle }}>
                    <span>+ Andre kostnadspostar (ikkje spesifisert i kjelde)</span>
                    <span style={redVal}>≈ −0,25 mrd.</span>
                </div>
                <div style={{ ...rowStyle, borderTop: "1px solid var(--t-border-subtle)", paddingTop: "0.3rem", marginTop: "0.1rem" }}>
                    <span>= Samla kostnad</span>
                    <span style={redVal}>−8,65 mrd.</span>
                </div>
                <div style={{ ...rowStyle, marginTop: "0.4rem" }}>
                    <span>Prissett nytte (steinmassar, ventetid, drivstoff m.m.)</span>
                    <span style={greenVal}>+2,0 mrd.</span>
                </div>
                <div style={{ ...rowStyle, borderTop: "1px solid var(--t-border-subtle)", paddingTop: "0.3rem", marginTop: "0.1rem", fontWeight: 700 }}>
                    <span>= Netto samfunnsøkonomisk tap</span>
                    <span style={redVal}>−6,65 mrd.</span>
                </div>
                <div style={{ ...rowStyle, marginTop: "0.5rem", color: "var(--t-text-muted)" }}>
                    <span>NNB = netto tap / investeringskostnad</span>
                    <span style={redVal}>−6,65 / 7,0 = −0,95</span>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(20, 1fr)", gap: 5, margin: "0.5rem 0 0.75rem" }}>
                {Array.from({ length: 100 }).map((_, i) => (
                    <div
                        key={i}
                        style={{
                            aspectRatio: "1/1",
                            borderRadius: "50%",
                            background: i < 95 ? RED : GREEN,
                        }}
                    />
                ))}
            </div>
            <div style={capStyle}>
                <span style={{ display: "inline-block", width: 9, height: 9, borderRadius: "50%", background: RED, verticalAlign: "middle", marginRight: 5 }} />
                <strong>95 øre</strong> i rekna velferdstap per krone &nbsp;·&nbsp;
                <span style={{ display: "inline-block", width: 9, height: 9, borderRadius: "50%", background: GREEN, verticalAlign: "middle", marginRight: 5 }} />
                <strong>5 øre</strong> netto att til samfunnet. Kvar sirkel er eitt øre av ei investert krone.
                {" "}Skattefinansieringskostnaden på 20 % reflekterer at kvar krone staten bruker kostar meir enn ein krone å krevje inn — eit standardkrav i norsk samfunnsøkonomisk analyse (NOU 2012:16). Kystverkets fullstendige rapport er ikkje offentleggjord.
            </div>
        </div>
    );
}

/* ── Note box ─────────────────────────────────────────────────────────────── */
export function Merk({ children }: { children: React.ReactNode }) {
    return (
        <div style={{
            background: "var(--t-card)",
            border: "1px solid var(--t-border-subtle)",
            borderLeft: `3px solid ${GREEN}`,
            borderRadius: "0 var(--r-panel) var(--r-panel) 0",
            padding: "1rem 1.25rem",
            margin: "1.5rem 0",
            fontSize: "0.875rem",
            color: "var(--t-text-secondary)",
            lineHeight: 1.65,
        }}>
            {children}
        </div>
    );
}
