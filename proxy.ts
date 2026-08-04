import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
    matcher: [
        // «treverket» er ei statisk under-side i public/ og skal ikkje få
        // språkprefiks lagt på av i18n-middlewaren.
        "/((?!api|_next|_vercel|favicon\\.ico|images|fonts|treverket|.*\\..*).*)",
    ],
};
