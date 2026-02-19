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
}

const PALETTE = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];

/* eslint-disable @typescript-eslint/no-explicit-any */
function ChartTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div
            style={{
                background: "#151d35",
                border: "1px solid rgba(148,163,184,0.2)",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 12,
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}
        >
            {label !== undefined && label !== null && (
                <p style={{ color: "#f1f5f9", fontWeight: 600, marginBottom: 4 }}>
                    {label}
                </p>
            )}
            {payload.map((entry: any, i: number) => (
                <p key={i} style={{ color: entry.color || "#94a3b8", margin: "2px 0" }}>
                    {entry.name}:{" "}
                    {typeof entry.value === "number"
                        ? entry.value.toLocaleString(undefined, { maximumFractionDigits: 1 })
                        : entry.value}
                </p>
            ))}
        </div>
    );
}

export default function Chart({ config, compact = false, height: heightProp }: ChartProps) {
    const { type, data, xKey, yKey, yKeys, colors } = config;
    const palette = colors ?? PALETTE;
    const h = heightProp ?? (compact ? 220 : 340);
    const margin = { top: 8, right: 16, bottom: 4, left: 0 };

    const axisProps: any = {
        tick: { fontSize: 11, fill: "#64748b" },
        axisLine: { stroke: "rgba(148,163,184,0.15)" },
        tickLine: { stroke: "rgba(148,163,184,0.15)" },
    };

    const grid = (
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
    );

    switch (type) {
        case "line":
            return (
                <ResponsiveContainer width="100%" height={h}>
                    <LineChart data={data} margin={margin}>
                        {grid}
                        <XAxis dataKey={xKey} {...axisProps} />
                        <YAxis {...axisProps} />
                        <Tooltip content={<ChartTooltip />} />
                        <Line
                            type="monotone"
                            dataKey={yKey}
                            stroke={palette[0]}
                            strokeWidth={2}
                            dot={{ fill: palette[0], r: compact ? 2 : 3 }}
                            activeDot={{ r: compact ? 4 : 6, stroke: palette[0], strokeWidth: 2, fill: "#0a0f1e" }}
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
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey={yKey} radius={[4, 4, 0, 0]}>
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
                        <Tooltip content={<ChartTooltip />} />
                        <Legend
                            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                            formatter={(value: string) => (
                                <span style={{ color: "#94a3b8" }}>{value}</span>
                            )}
                        />
                        {keys.map((key, i) => (
                            <Bar
                                key={key}
                                dataKey={key}
                                stackId="a"
                                fill={palette[i % palette.length]}
                                radius={i === keys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
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
                        <Tooltip content={<ChartTooltip />} cursor={{ strokeDasharray: "3 3", stroke: "rgba(148,163,184,0.2)" }} />
                        <Scatter data={data} fill={palette[0]}>
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
}
