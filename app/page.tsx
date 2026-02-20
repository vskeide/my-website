import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";

const latestArticles = [
  {
    slug: "understanding-index-funds",
    title: "Understanding Index Funds: A Beginner's Guide to Passive Investing",
    excerpt:
      "Index funds have transformed how ordinary people build wealth. Here's what you need to know before you start investing passively.",
    date: "Feb 15, 2026",
    category: "Investing & Finance",
    thumbnailColor: "#2563eb",
  },
  {
    slug: "budgeting-50-30-20-rule",
    title: "The 50/30/20 Rule: A Simple Framework for Managing Your Money",
    excerpt:
      "Not sure where your money is going? This budgeting framework makes it easy to allocate your income effectively.",
    date: "Feb 8, 2026",
    category: "Personal Economy",
    thumbnailColor: "#059669",
  },
  {
    slug: "local-infrastructure-spending",
    title: "Where Does Your Municipality Spend Its Infrastructure Budget?",
    excerpt:
      "A breakdown of local government spending priorities and how they affect your daily life and property values.",
    date: "Jan 29, 2026",
    category: "Local Politics",
    thumbnailColor: "#d97706",
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-[90rem] px-4 sm:px-6" style={{ paddingTop: "var(--nav-height)" }}>
      {/* Intro */}
      <section className="pb-8 pt-8">
        <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: "var(--t-text)" }}>
          Personal Finance &amp; Economics
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed" style={{ color: "var(--t-text-secondary)" }}>
          Independent analysis and practical insights on investing, personal
          economy, and local economic policy. Cut through the noise and make
          better financial decisions.
        </p>
      </section>

      {/* Latest Articles */}
      <section className="pb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold" style={{ color: "var(--t-text)" }}>
            Latest Articles
          </h2>
          <Link
            href="/blog"
            className="text-xs font-medium transition-colors hover:underline"
            style={{ color: "var(--ch-accent)" }}
          >
            View all →
          </Link>
        </div>
        <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {latestArticles.map((article) => (
            <div key={article.slug} className="animate-fade-in-up">
              <ArticleCard {...article} />
            </div>
          ))}
        </div>
      </section>

      {/* Featured Calculator */}
      <section className="pb-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold" style={{ color: "var(--t-text)" }}>
            Featured Calculator
          </h2>
          <Link
            href="/calculators"
            className="text-xs font-medium transition-colors hover:underline"
            style={{ color: "var(--ch-accent)" }}
          >
            All calculators →
          </Link>
        </div>
        <Link href="/calculators" className="group block">
          <div
            className="overflow-hidden transition-all duration-200 hover:shadow-lg"
            style={{
              background: "var(--t-card)",
              border: "1px solid var(--t-border-subtle)",
              borderRadius: 0,
            }}
          >
            <div className="flex flex-col sm:flex-row">
              {/* Left: visual */}
              <div
                className="flex h-36 items-center justify-center sm:h-auto sm:w-64"
                style={{ background: "linear-gradient(135deg, #1e40af33, #0f172a)" }}
              >
                <div className="text-center">
                  <div className="text-4xl font-black" style={{ color: "var(--ch-accent)" }}>%</div>
                  <p className="mt-1 text-xs font-medium" style={{ color: "var(--t-text-muted)" }}>
                    Compound Interest
                  </p>
                </div>
              </div>
              {/* Right: content */}
              <div className="flex-1 p-5">
                <h3
                  className="mb-1.5 text-sm font-semibold transition-colors group-hover:underline"
                  style={{ color: "var(--t-text)" }}
                >
                  Compound Interest Calculator
                </h3>
                <p className="mb-3 text-xs leading-relaxed" style={{ color: "var(--t-text-secondary)" }}>
                  See how your investments grow over time with the power of
                  compound interest. Adjust principal, rate, and time to
                  visualize your wealth-building potential.
                </p>
                <span
                  className="inline-flex items-center gap-1 text-xs font-medium transition-colors"
                  style={{ color: "var(--ch-accent)" }}
                >
                  Try it now
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </Link>
      </section>
    </main>
  );
}
