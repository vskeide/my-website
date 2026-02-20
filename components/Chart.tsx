"use client";

import {
    ResponsiveContainer,
    LineChart, Line,
    BarChart, Bar,
    ScatterChart, Scatter,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell,
} from "recharts";

export interface ChartConfig {
    id: string;
    title: string;
    type: "line" | "bar" | "stackedBar" | "scatter";
    data: Record<string, number | string>[];
    xKey: string;
    yKey: string;
    yKeys?: string[];
    colors?: string[];
    pin?: boolean;
}

interface ChartProps {
    config: ChartConfig;
    compact?: boolean;
    height?: number | `${number}%`;
    /** When true, renders without interactivity (inline in article body) */
    static?: boolean;
}

const PALETTE = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];

/* eslint-disable @typescript-eslint/no-explicit-any */
function ChartTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div
            style={{
                background: "var(--ch-tooltip-bg)",
                border: "1px solid var(--t-border-medium)",
                borderRadius: 0,
                padding: "8px 12px",
                fontSize: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
        >
            {label !== undefined && label !== null && (
                <p style={{ color: "var(--t-text)", fontWeight: 600, marginBottom: 4 }}>
                    {label}
                </p>
            )}
            {payload.map((entry: any, i: number) => (
                <p key={i} style={{ color: entry.color || "var(--t-text-secondary)", margin: "2px 0" }}>
                    {entry.name}:{" "}
                    {typeof entry.value === "number"
                        ? entry.value.toLocaleString(undefined, { maximumFractionDigits: 1 })
                        : entry.value}
                </p>
            ))}
        </div>
    );
}

/* Wrapper that gives charts a white/light background */
function ChartBackground({ children, h }: { children: React.ReactNode; h: number | string }) {
    return (
        <div
            style={{
                background: "var(--ch-tooltip-bg)",
                border: "1px solid var(--t-border-subtle)",
                padding: "8px 4px 4px",
                width: "100%",
                height: typeof h === "number" ? h + 16 : h,
            }}
        >
            {children}
        </div>
    );
}

export default function Chart({ config, compact = false, height: heightProp, static: isStatic = false }: ChartProps) {
    const { type, data, xKey, yKey, yKeys, colors } = config;
    const palette = colors ?? PALETTE;
    const h = heightProp ?? (compact ? 200 : 320);
    const margin = { top: 8, right: 16, bottom: 4, left: 0 };

    const axisProps: any = {
        tick: { fontSize: 11, fill: "var(--ch-muted)" },
        axisLine: { stroke: "var(--t-border-subtle)" },
        tickLine: { stroke: "var(--t-border-subtle)" },
    };

    const grid = (
        <CartesianGrid strokeDasharray="3 3" stroke="var(--t-border-subtle)" />
    );

    const tooltip = isStatic ? undefined : <Tooltip content={<ChartTooltip />} />;

    const renderChart = () => {
        switch (type) {
            case "line":
                return (
                    <ResponsiveContainer width="100%" height={h}>
                        <LineChart data={data} margin={margin}>
                            {grid}
                            <XAxis dataKey={xKey} {...axisProps} />
                            <YAxis {...axisProps} />
                            {tooltip}
                            <Line
                                type="monotone"
                                dataKey={yKey}
                                stroke={palette[0]}
                                strokeWidth={2}
                                dot={{ fill: palette[0], r: compact ? 2 : 3 }}
                                activeDot={isStatic ? false : { r: compact ? 4 : 6, stroke: palette[0], strokeWidth: 2, fill: "var(--ch-tooltip-bg)" }}
                                isAnimationActive={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                );

            case "bar":
                return (
                    <ResponsiveContainer width="100%" height={h}>
                        <BarChart data={data} margin={margin}>
                            {grid}
                            <XAxis dataKey={xKey} {...axisProps} />
                            <YAxis {...axisProps} />
                            {tooltip}
                            <Bar dataKey={yKey} radius={[0, 0, 0, 0]} isAnimationActive={false}>
                                {data.map((_, i) => (
                                    <Cell key={i} fill={palette[i % palette.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                );

            case "stackedBar": {
                const keys = yKeys ?? [yKey];
                return (
                    <ResponsiveContainer width="100%" height={h}>
                        <BarChart data={data} margin={margin}>
                            {grid}
                            <XAxis dataKey={xKey} {...axisProps} />
                            <YAxis {...axisProps} />
                            {tooltip}
                            <Legend
                                wrapperStyle={{ fontSize: 11, paddingTop: 8, color: "var(--ch-muted)" }}
                                formatter={(value: string) => (
                                    <span style={{ color: "var(--ch-muted)" }}>{value}</span>
                                )}
                            />
                            {keys.map((key, i) => (
                                <Bar
                                    key={key}
                                    dataKey={key}
                                    stackId="a"
                                    fill={palette[i % palette.length]}
                                    radius={[0, 0, 0, 0]}
                                    isAnimationActive={false}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                );
            }

            case "scatter":
                return (
                    <ResponsiveContainer width="100%" height={h}>
                        <ScatterChart margin={margin}>
                            {grid}
                            <XAxis type="number" dataKey={xKey} name={xKey} {...axisProps} />
                            <YAxis type="number" dataKey={yKey} name={yKey} {...axisProps} />
                            {tooltip}
                            <Scatter data={data} fill={palette[0]} isAnimationActive={false}>
                                {data.map((_, i) => (
                                    <Cell key={i} fill={palette[0]} opacity={0.8} />
                                ))}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                );

            default:
                return null;
        }
    };

    return (
        <ChartBackground h={h}>
            {renderChart()}
        </ChartBackground>
    );
}
