"use client";
import { useEffect } from "react";

export default function DatawrapperResizer() {
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
    return null;
}
