/**
 * Labels for an article that exists in only one language.
 *
 * Lives in its own module because client components need it as a value, and
 * `lib/articles.ts` reads the filesystem — importing that from the client
 * would drag `fs` into the browser bundle.
 */

/** Badge text: "this article is not in the language you are reading". */
export function onlyInLabel(fallbackLocale: string, pageLocale: string): string {
    if (pageLocale === "no") return "Berre på engelsk";
    return fallbackLocale === "no" ? "Norwegian only" : "English only";
}

/** Longer form, for the featured card and the article page itself. */
export function onlyInNotice(fallbackLocale: string, pageLocale: string): string {
    if (pageLocale === "no") return "Denne artikkelen finst berre på engelsk.";
    return fallbackLocale === "no"
        ? "This article is available in Norwegian only."
        : "This article is available in English only.";
}
