export const CH_COLORS = [
    "var(--ch-c1)", "var(--ch-c2)", "var(--ch-c3)", "var(--ch-c4)",
    "var(--ch-c5)", "var(--ch-c6)", "var(--ch-c7)", "var(--ch-c8)"
];

/**
 * The site's full category vocabulary, per locale, in display order.
 *
 * These strings must match the `category:` frontmatter values EXACTLY —
 * filtering compares them literally, so a typo here silently yields an
 * always-empty chip.
 *
 * Categories stay listed whether or not any article currently uses them, so
 * the filter chips are stable as articles come and go.
 */
export const CATEGORIES: Record<string, string[]> = {
    no: ["Investering og finans", "Personleg økonomi", "Lokalpolitikk", "AI", "Kina", "Kalkulatorar"],
    en: ["Investing & Finance", "Personal Economy", "Local Politics", "AI", "China", "Calculators"],
};

/**
 * Translate a category name into `locale`'s wording.
 *
 * The per-locale arrays in CATEGORIES are index-aligned, so position is the
 * equivalence: no[i] and en[i] are the same category. Needed because a
 * single-language article keeps its own category string, and an English page
 * listing a Nynorsk article would otherwise grow a duplicate "Lokalpolitikk"
 * chip alongside "Local Politics".
 *
 * An unrecognised category is returned unchanged.
 */
export function localizeCategory(cat: string, locale: string): string {
    const target = CATEGORIES[locale] ?? CATEGORIES.en;
    for (const list of Object.values(CATEGORIES)) {
        const i = list.indexOf(cat);
        if (i !== -1) return target[i] ?? cat;
    }
    return cat;
}

/**
 * The canonical list for a locale, plus any category an article actually uses
 * that is missing from it — so a new category never goes unlisted by accident.
 */
export function categoriesForLocale(locale: string, present: readonly string[] = []): string[] {
    const base = CATEGORIES[locale] ?? CATEGORIES.en;
    return [...base, ...[...new Set(present)].filter((c) => !base.includes(c))];
}

export const categoryIndex: Record<string, number> = {
    "Investing & Finance": 0,   // #0070C0 blue
    "Personal Economy":    3,   // #7030A0 purple
    "Local Politics":      2,   // #FFC000 gold
    "Calculators":         3,   // #7030A0 purple
    "AI":                  4,   // #00B050 green
    "China":               1,   // #FF3333 red   (swapped)
    // Norwegian equivalents
    "Investering og finans": 0,
    "Personlig økonomi":     3,   // bokmål spelling, kept for old content
    "Personleg økonomi":     3,
    "Lokalpolitikk":         2,
    "Kalkulatorar":          3,
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
