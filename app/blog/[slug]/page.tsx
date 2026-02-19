import Link from "next/link";
import ArticleLayout from "@/components/ArticleLayout";
import { silverPriceAnalysis } from "@/lib/articles/silver-price-analysis";

// ---------- Text-only articles ----------
const textArticles: Record<
    string,
    { title: string; date: string; category: string; content: string }
> = {
    "understanding-index-funds": {
        title: "Understanding Index Funds: A Beginner's Guide to Passive Investing",
        date: "Feb 15, 2026",
        category: "Investing & Finance",
        content: `Index funds are a type of mutual fund or exchange-traded fund (ETF) designed to track a specific market index, such as the S&P 500 or the MSCI World. Rather than relying on a fund manager to pick individual stocks, an index fund simply holds all (or a representative sample of) the securities in its target index.

This approach offers several key advantages. First, the fees are significantly lower than actively managed funds. Second, research consistently shows that the majority of active fund managers fail to outperform their benchmark indices over extended periods.

For a beginning investor, index funds provide instant diversification across hundreds or thousands of companies, reducing the risk associated with any single stock. You gain broad market exposure with a single purchase.

The most popular index funds track well-known benchmarks: the S&P 500 (large US companies), the total stock market (all US-listed companies), or international indices covering developed and emerging markets. Many investors create a simple two-or-three-fund portfolio using index funds.

When selecting an index fund, focus on the expense ratio—the annual fee expressed as a percentage of your investment. The lowest-cost options from major providers charge as little as 0.03% per year, meaning you keep virtually all of your returns.

Dollar-cost averaging—investing a fixed amount at regular intervals—is an effective strategy to pair with index fund investing. This approach removes the temptation to time the market and ensures you buy more shares when prices are low and fewer when prices are high.`,
    },
    "budgeting-50-30-20-rule": {
        title: "The 50/30/20 Rule: A Simple Framework for Managing Your Money",
        date: "Feb 8, 2026",
        category: "Personal Economy",
        content: `The 50/30/20 rule is one of the simplest and most effective budgeting frameworks available. It divides your after-tax income into three categories: 50% for needs, 30% for wants, and 20% for savings and debt repayment.

Needs include housing, utilities, groceries, transportation, insurance, and minimum debt payments—anything you must pay to survive and work. Wants cover everything else you spend money on that isn't strictly necessary: dining out, entertainment, hobbies, and subscriptions. Savings include retirement contributions, emergency fund deposits, and extra debt payments beyond minimums.

The beauty of this framework is its simplicity. You don't need to track every purchase in granular detail. Instead, you set up your accounts to automatically route money according to these percentages, then spend freely within each category.

Of course, these percentages are guidelines, not rigid rules. In high-cost-of-living areas, housing alone might consume 40% of your income, pushing needs above 50%. In that case, adjust the other categories accordingly while keeping savings above 15% if possible.

The key insight is that savings should be treated as a non-negotiable expense—pay yourself first. Set up automatic transfers to your savings and investment accounts on payday, and build your spending around what remains.`,
    },
    "local-infrastructure-spending": {
        title: "Where Does Your Municipality Spend Its Infrastructure Budget?",
        date: "Jan 29, 2026",
        category: "Local Politics",
        content: `Municipal infrastructure spending is one of the most impactful areas of local government, yet most residents have little understanding of how these funds are allocated. Understanding the breakdown can help you engage more effectively in local politics and anticipate changes to your neighborhood.

Water and sewer systems typically consume the largest share—often 30-40% of infrastructure budgets. These underground systems require constant maintenance and periodic replacement, and the costs are largely invisible until something fails. Road maintenance and construction usually accounts for another 25-35%, covering everything from pothole repairs to new road construction projects.

Public transportation infrastructure, including bus stops, transit stations, and dedicated lanes, varies significantly by municipality. Urban areas might spend 15-20% on transit, while suburban communities allocate much less. Parks and recreational facilities generally receive 5-10%, though this varies based on community priorities.

Recent trends show increasing allocation toward stormwater management and climate adaptation infrastructure. Many municipalities are investing in green infrastructure—bioswales, permeable pavement, and urban tree canopies—that serve multiple purposes while reducing long-term costs.

When your municipality publishes its annual budget, look for the capital improvement plan (CIP). This multi-year document outlines planned projects and their funding sources, giving you a preview of what's coming to your area.`,
    },
};

// ---------- Chart articles ----------
const chartArticles: Record<string, typeof silverPriceAnalysis> = {
    "silver-price-analysis": silverPriceAnalysis,
};

// Fallback
const fallbackArticle = {
    title: "Article Title",
    date: "2026",
    category: "General",
    content:
        "This is a placeholder article. Replace with real content by adding MDX files to the content/blog directory.",
};

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function ArticlePage({ params }: PageProps) {
    const { slug } = await params;

    // Chart article → ArticleLayout
    if (chartArticles[slug]) {
        const a = chartArticles[slug];
        return (
            <ArticleLayout
                title={a.title}
                date={a.date}
                category={a.category}
                sections={a.sections}
            />
        );
    }

    // Text-only article → simple layout
    const article = textArticles[slug] ?? fallbackArticle;
    const categoryColors: Record<string, string> = {
        "Investing & Finance": "bg-accent/15 text-accent-hover",
        "Personal Economy": "bg-emerald-500/15 text-emerald-400",
        "Local Politics": "bg-accent-amber/15 text-accent-amber",
    };
    const tagStyle =
        categoryColors[article.category] ?? "bg-accent/15 text-accent-hover";

    return (
        <main className="mx-auto max-w-3xl px-4 pt-20 sm:px-6">
            <nav className="pb-4 text-xs text-text-muted">
                <Link href="/" className="transition-colors hover:text-text-secondary">Home</Link>
                <span className="mx-2">/</span>
                <Link href="/blog" className="transition-colors hover:text-text-secondary">Blog</Link>
                <span className="mx-2">/</span>
                <span className="text-text-secondary">{article.title}</span>
            </nav>

            <header className="pb-6">
                <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${tagStyle} mb-3`}>
                    {article.category}
                </span>
                <h1 className="mb-3 text-2xl font-bold leading-tight tracking-tight text-text-primary sm:text-3xl">
                    {article.title}
                </h1>
                <time className="text-sm text-text-muted">{article.date}</time>
            </header>

            <article className="pb-12">
                {article.content.split("\n\n").map((paragraph, i) => (
                    <p key={i} className="mb-4 text-sm leading-7 text-text-secondary">
                        {paragraph}
                    </p>
                ))}
            </article>

            <div className="border-t border-border-subtle py-6">
                <Link href="/blog" className="inline-flex items-center gap-1.5 text-xs font-medium text-accent transition-colors hover:text-accent-hover">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to all articles
                </Link>
            </div>
        </main>
    );
}
