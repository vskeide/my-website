"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
    theme: Theme;
    toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
    theme: "dark",
    toggle: () => { },
});

export function useTheme() {
    return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("dark");
    const [mounted, setMounted] = useState(false);

    // Read saved preference on mount
    useEffect(() => {
        const saved = localStorage.getItem("theme") as Theme | null;
        if (saved === "light" || saved === "dark") {
            setTheme(saved);
            document.documentElement.setAttribute("data-theme", saved);
        }
        setMounted(true);
    }, []);

    // Sync attribute + localStorage on change
    useEffect(() => {
        if (!mounted) return;
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme, mounted]);

    const toggle = useCallback(() => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, toggle }}>
            {children}
        </ThemeContext.Provider>
    );
}
