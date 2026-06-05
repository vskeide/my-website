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
            <button
                onClick={() => onSelect(null)}
                className="px-4 py-1.5 text-xs font-semibold transition-all duration-200"
                style={{
                    background: active === null ? "var(--t-text)" : "transparent",
                    color: active === null ? "var(--t-bg)" : "var(--t-text-muted)",
                    border: `1.5px solid ${active === null ? "var(--t-text)" : "var(--t-border-medium)"}`,
                    borderRadius: "var(--r-pill)",
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
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold transition-all duration-200"
                        style={{
                            background: isActive ? s.bg : "transparent",
                            color: isActive ? s.text : "var(--t-text-muted)",
                            border: `1.5px solid ${isActive ? s.bg : "var(--t-border-medium)"}`,
                            borderRadius: "var(--r-pill)",
                        }}
                    >
                        <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: s.bg }} />
                        {cat}
                    </button>
                );
            })}
        </div>
    );
}
