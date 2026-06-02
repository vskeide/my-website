"use client";

import { getCategoryBadgeStyle } from "@/lib/categories";

interface CategoryFilterProps {
    categories: string[];
    active: string | null;
    onSelect: (category: string | null) => void;
}

export default function CategoryFilter({ categories, active, onSelect }: CategoryFilterProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {/* "All" pill — neutral */}
            <button
                onClick={() => onSelect(null)}
                className="px-3 py-1.5 text-xs font-semibold transition-all duration-200"
                style={{
                    background: active === null ? "var(--t-text)" : "var(--t-card)",
                    color: active === null ? "var(--t-bg)" : "var(--t-text-muted)",
                    border: `1px solid ${active === null ? "var(--t-text)" : "var(--t-border-medium)"}`,
                    borderRadius: 0,
                }}
            >
                All
            </button>

            {categories.map((cat) => {
                const s = getCategoryBadgeStyle(cat);
                const isActive = active === cat;
                return (
                    <button
                        key={cat}
                        onClick={() => onSelect(cat)}
                        className="px-3 py-1.5 text-xs font-semibold transition-all duration-200"
                        style={{
                            /* Always tinted; fully saturated when active */
                            background: isActive
                                ? s.bg
                                : `color-mix(in srgb, ${s.bg} 13%, var(--t-card))`,
                            color: isActive ? s.text : s.bg,
                            border: `1px solid color-mix(in srgb, ${s.bg} 35%, transparent)`,
                            borderRadius: 0,
                        }}
                    >
                        {cat}
                    </button>
                );
            })}
        </div>
    );
}
