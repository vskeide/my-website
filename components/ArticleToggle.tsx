"use client";

import { useState } from "react";

interface Props {
    defaultLocale: string;
    otherLocale: string;
    currentContent: React.ReactNode;
    otherContent: React.ReactNode | null;
    isFallback?: boolean;
    fallbackMessage?: string;
}

export default function ArticleToggle({
    defaultLocale,
    otherLocale,
    currentContent,
    otherContent,
    isFallback,
    fallbackMessage,
}: Props) {
    const [showOther, setShowOther] = useState(false);

    const currentLabel = defaultLocale === "no" ? "NO" : "EN";
    const otherLabel = otherLocale === "no" ? "NO" : "EN";
    const activeLabel = showOther ? otherLabel : currentLabel;
    const inactiveLabel = showOther ? currentLabel : otherLabel;

    return (
        <>
            {isFallback && (
                <div className="mb-6 rounded px-4 py-3 text-xs" style={{ background: "var(--t-surface)", border: "1px solid var(--t-border-subtle)", color: "var(--t-text-muted)" }}>
                    {fallbackMessage}
                </div>
            )}

            {otherContent && (
                <div className="mb-6 flex items-center gap-2">
                    <span className="text-xs" style={{ color: "var(--t-text-muted)" }}>
                        {defaultLocale === "no" ? "Vis artikkel på:" : "Read article in:"}
                    </span>
                    <button
                        onClick={() => setShowOther(false)}
                        className="px-2 py-0.5 text-xs font-semibold transition-colors"
                        style={{
                            background: !showOther ? "var(--ch-accent)" : "var(--t-surface)",
                            color: !showOther ? "#fff" : "var(--t-text-muted)",
                            border: "1px solid var(--t-border-subtle)",
                            borderRadius: "var(--r-pill)",
                        }}
                    >
                        {currentLabel}
                    </button>
                    <button
                        onClick={() => setShowOther(true)}
                        className="px-2 py-0.5 text-xs font-semibold transition-colors"
                        style={{
                            background: showOther ? "var(--ch-accent)" : "var(--t-surface)",
                            color: showOther ? "#fff" : "var(--t-text-muted)",
                            border: "1px solid var(--t-border-subtle)",
                            borderRadius: "var(--r-pill)",
                        }}
                    >
                        {otherLabel}
                    </button>
                </div>
            )}

            <div style={{ display: showOther ? "none" : "block" }}>{currentContent}</div>
            {otherContent && <div style={{ display: showOther ? "block" : "none" }}>{otherContent}</div>}
        </>
    );
}
