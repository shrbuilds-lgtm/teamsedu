import { StarRow } from "./StarRow";
import type { Testimonial } from "@/data/testimonials";

const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const TestimonialCard = ({ t }: { t: Testimonial }) => (
  <article className="h-full rounded-2xl border border-border bg-card p-6 shadow-card flex flex-col">
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground inline-flex items-center justify-center font-semibold">
        {initials(t.name)}
      </div>
      <div>
        <div className="font-semibold text-sm">{t.name}</div>
        <div className="text-xs text-muted-foreground">{t.when}</div>
      </div>
    </div>
    <div className="mt-3"><StarRow rating={t.rating} /></div>
    <p className="mt-3 text-sm text-foreground/80 leading-relaxed flex-1">{t.text}</p>
  </article>
);
