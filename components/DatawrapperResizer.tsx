"use client";
import { useEffect } from "react";
import { useTheme } from "./ThemeProvider";

export default function DatawrapperResizer() {
    const { theme } = useTheme();

    useEffect(() => {
        function handleMessage(e: MessageEvent) {
            if (typeof e.data?.["datawrapper-height"] === "undefined") return;
            const iframes = document.querySelectorAll<HTMLIFrameElement>("iframe");
            for (const id in e.data["datawrapper-height"]) {
                for (const iframe of iframes) {
                    if (iframe.contentWindow === e.source) {
                        iframe.style.height = e.data["datawrapper-height"][id] + "px";
                    }
                }
            }
        }
        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);

    useEffect(() => {
        const isDark = theme === "dark";
        const iframes = document.querySelectorAll<HTMLIFrameElement>("iframe");
        for (const iframe of iframes) {
            const src = iframe.getAttribute("src");
            if (!src || !src.includes("datawrapper.dwcdn.net")) continue;
            const url = new URL(src, window.location.origin);
            url.searchParams.set("dark", String(isDark));
            url.searchParams.set("transparent", "true");
            const newSrc = url.toString();
            if (iframe.src !== newSrc) {
                iframe.setAttribute("allowTransparency", "true");
                iframe.style.background = "transparent";
                iframe.src = newSrc;
            }
        }
    }, [theme]);

    return null;
}
