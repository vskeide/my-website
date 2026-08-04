import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            // Statiske under-sider under public/ har ingen mappeindeks, så
            // /treverket ville gitt 404. Denne peikar stien til fila.
            { source: "/treverket", destination: "/treverket/index.html" },
        ];
    },
};

export default withNextIntl(nextConfig);
