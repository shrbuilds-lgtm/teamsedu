import { Star } from "lucide-react";

export const StarRow = ({ rating = 5, size = 16 }: { rating?: number; size?: number }) => (
  <div className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={size}
        className={i < Math.round(rating) ? "fill-accent text-accent" : "text-muted-foreground/30"}
      />
    ))}
  </div>
);
