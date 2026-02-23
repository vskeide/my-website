"use client";

import { getCategoryBadgeStyle } from "@/lib/categories";

interface CategoryFilterProps {
    categories: string[];
    active: string | null;
    onSelect: (category: string | null) => void;
}

export default function CategoryFilter({
    categories,
    active,
    onSelect,
}: CategoryFilterProps) {
    return (
        <div className="flex flex-wrap gap-2">
            <button
                onClick={() => onSelect(null)}
                className="px-3 py-1.5 text-xs font-semibold transition-all duration-200"
                style={{
                    background: active === null ? getCategoryBadgeStyle("All").bg : "var(--t-card)",
                    color: active === null ? getCategoryBadgeStyle("All").text : "var(--t-text-secondary)",
                    border: `1px solid ${active === null ? getCategoryBadgeStyle("All").bg : "var(--t-border-subtle)"}`,
                    borderRadius: 0,
                }}
            >
                All
            </button>
            {categories.map((cat) => (
                <button
                    key={cat}
                    onClick={() => onSelect(cat)}
                    className="px-3 py-1.5 text-xs font-semibold transition-all duration-200"
                    style={{
                        background: active === cat ? getCategoryBadgeStyle(cat).bg : "var(--t-card)",
                        color: active === cat ? getCategoryBadgeStyle(cat).text : "var(--t-text-secondary)",
                        border: `1px solid ${active === cat ? getCategoryBadgeStyle(cat).bg : "var(--t-border-subtle)"}`,
                        borderRadius: 0,
                    }}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
}
