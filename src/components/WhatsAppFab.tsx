import { MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "@/config/site";

export const WhatsAppFab = () => (
  <a
    href={buildWhatsAppLink("Hello TEAMS, I'd like to enquire about classes.")}
    target="_blank"
    rel="noreferrer"
    aria-label="Chat on WhatsApp"
    className="fixed bottom-5 left-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(145_63%_42%)] text-white shadow-soft hover:scale-105 transition-transform"
  >
    <MessageCircle className="h-6 w-6" />
  </a>
);
