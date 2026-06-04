export const CH_COLORS = [
    "var(--ch-c1)", "var(--ch-c2)", "var(--ch-c3)", "var(--ch-c4)",
    "var(--ch-c5)", "var(--ch-c6)", "var(--ch-c7)", "var(--ch-c8)"
];

export const categoryIndex: Record<string, number> = {
    "Investing & Finance": 0,   // #0070C0 blue
    "Personal Economy":    7,   // #00B0F0 cyan  (swapped)
    "Local Politics":      2,   // #FFC000 gold
    "Calculators":         3,   // #7030A0 purple
    "AI":                  4,   // #00B050 green
    "China":               1,   // #FF3333 red   (swapped)
    // Norwegian equivalents
    "Investering og finans": 0,
    "Personlig økonomi":     7,
    "Lokalpolitikk":         2,
    "Kina":                  1,
};

// Positions whose background colour is too light for white text
const NEEDS_DARK_TEXT = new Set([2, 7]); // gold (#FFC000), cyan (#00B0F0)

export function getCategoryBadgeStyle(cat: string) {
    const idx = (categoryIndex[cat] ?? 3) % CH_COLORS.length;
    return {
        bg: CH_COLORS[idx],
        text: NEEDS_DARK_TEXT.has(idx) ? "#000000" : "#ffffff",
    };
}
