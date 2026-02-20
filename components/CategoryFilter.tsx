"use client";

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
    const btnStyle = (isActive: boolean) => ({
        background: isActive ? "var(--ch-accent)" : "var(--t-card)",
        color: isActive ? "#ffffff" : "var(--t-text-secondary)",
        border: `1px solid ${isActive ? "var(--ch-accent)" : "var(--t-border-subtle)"}`,
        borderRadius: 0,
    });

    return (
        <div className="flex flex-wrap gap-2">
            <button
                onClick={() => onSelect(null)}
                className="px-3 py-1.5 text-xs font-semibold transition-all duration-200"
                style={btnStyle(active === null)}
            >
                All
            </button>
            {categories.map((cat) => (
                <button
                    key={cat}
                    onClick={() => onSelect(cat)}
                    className="px-3 py-1.5 text-xs font-semibold transition-all duration-200"
                    style={btnStyle(active === cat)}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
}
