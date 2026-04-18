import { Link } from "react-router-dom";
import { Phone, MapPin, MessageCircle } from "lucide-react";
import { SITE, buildWhatsAppLink } from "@/config/site";
import { Logo } from "./Logo";

export const Footer = () => (
  <footer className="border-t border-border bg-secondary/40 mt-20">
    <div className="container py-12 grid gap-8 md:grid-cols-3">
      <div>
        <Logo />
        <p className="mt-4 text-sm text-muted-foreground max-w-xs">
          Coaching students of Class 8–10 in Maths, Physics, Chemistry and Biology
          across Tumakuru since years.
        </p>
      </div>

      <div>
        <h3 className="font-display font-bold text-sm uppercase tracking-wider text-primary">
          Quick Links
        </h3>
        <ul className="mt-4 space-y-2 text-sm">
          <li><Link to="/" className="hover:text-primary">Home</Link></li>
          <li><Link to="/timetable" className="hover:text-primary">Timetable</Link></li>
          <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
        </ul>
      </div>

      <div>
        <h3 className="font-display font-bold text-sm uppercase tracking-wider text-primary">
          Reach us
        </h3>
        <ul className="mt-4 space-y-3 text-sm">
          <li className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 text-accent" />
            <span>{SITE.city}, Karnataka</span>
          </li>
          <li>
            <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-primary">
              <Phone className="h-4 w-4 text-accent" /> {SITE.phone}
            </a>
          </li>
          <li>
            <a
              href={buildWhatsAppLink("Hello TEAMS, I'd like to know more.")}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 hover:text-primary"
            >
              <MessageCircle className="h-4 w-4 text-accent" /> WhatsApp us
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div className="border-t border-border">
      <div className="container py-4 text-xs text-muted-foreground flex flex-col sm:flex-row justify-between gap-2">
        <span>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</span>
        <span>Made with care in {SITE.city}.</span>
      </div>
    </div>
  </footer>
);
