import { Link } from "react-router-dom";

export const Logo = ({ className = "" }: { className?: string }) => (
  <Link to="/" className={`flex items-center gap-2 group ${className}`} aria-label="TEAMS Tuition Center home">
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-display font-extrabold shadow-soft">
      T
    </span>
    <div className="leading-tight">
      <div className="font-display font-extrabold text-base tracking-tight text-primary">
        TEAMS<span className="text-accent">.</span>
      </div>
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Tuition · Tumakuru
      </div>
    </div>
  </Link>
);
