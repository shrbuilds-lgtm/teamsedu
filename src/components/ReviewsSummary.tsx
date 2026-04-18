import { ExternalLink } from "lucide-react";
import { SITE } from "@/config/site";
import { StarRow } from "./StarRow";

const distribution = [
  { stars: 5, pct: 92 },
  { stars: 4, pct: 6 },
  { stars: 3, pct: 1 },
  { stars: 2, pct: 0 },
  { stars: 1, pct: 1 },
];

const topics = ["teachers", "teaching methods", "understand", "tuition centre"];

export const ReviewsSummary = () => (
  <div className="rounded-2xl border border-border bg-card shadow-card p-6 md:p-8 grid gap-8 md:grid-cols-[auto_1fr]">
    <div className="text-center md:text-left">
      <div className="font-display text-5xl md:text-6xl font-extrabold text-primary leading-none">
        {SITE.googleRating.toFixed(1)}
      </div>
      <div className="mt-2 flex justify-center md:justify-start">
        <StarRow rating={5} size={20} />
      </div>
      <div className="mt-2 text-sm text-muted-foreground">
        Based on <span className="font-semibold text-foreground">{SITE.googleReviewCount}</span> Google reviews
      </div>
      <a
        href={SITE.googleReviewsUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        View on Google <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>

    <div>
      <div className="space-y-2">
        {distribution.map((d) => (
          <div key={d.stars} className="flex items-center gap-3 text-sm">
            <span className="w-3 text-muted-foreground">{d.stars}</span>
            <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-amber-gradient rounded-full"
                style={{ width: `${d.pct}%` }}
                aria-hidden
              />
            </div>
            <span className="w-10 text-right text-muted-foreground tabular-nums">{d.pct}%</span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {topics.map((t) => (
          <span
            key={t}
            className="inline-flex items-center rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-xs font-medium text-primary"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  </div>
);
