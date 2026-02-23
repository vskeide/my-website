export const CH_COLORS = [
    "var(--ch-c1)", "var(--ch-c2)", "var(--ch-c3)", "var(--ch-c4)",
    "var(--ch-c5)", "var(--ch-c6)", "var(--ch-c7)", "var(--ch-c8)"
];

export const categoryIndex: Record<string, number> = {
    "Investing & Finance": 0,
    "Personal Economy": 1,
    "Local Politics": 2,
    "Calculators": 3,
};

export function getCategoryBadgeStyle(cat: string) {
    const idx = categoryIndex[cat] ?? 4;
    const isCyan = (idx % CH_COLORS.length) === 2;
    return { bg: CH_COLORS[idx % CH_COLORS.length], text: isCyan ? "#000000" : "#ffffff" };
}
