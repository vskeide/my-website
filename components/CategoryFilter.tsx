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
    return (
        <div className="flex flex-wrap gap-2">
            <button
                onClick={() => onSelect(null)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${active === null
                        ? "bg-accent text-white shadow-md shadow-accent/25"
                        : "bg-surface-secondary text-text-secondary hover:bg-surface-card-hover hover:text-text-primary border border-border-subtle"
                    }`}
            >
                All
            </button>
            {categories.map((cat) => (
                <button
                    key={cat}
                    onClick={() => onSelect(cat)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${active === cat
                            ? "bg-accent text-white shadow-md shadow-accent/25"
                            : "bg-surface-secondary text-text-secondary hover:bg-surface-card-hover hover:text-text-primary border border-border-subtle"
                        }`}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
}
