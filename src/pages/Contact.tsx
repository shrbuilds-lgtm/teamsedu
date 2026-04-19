import { useState } from "react";
import { z } from "zod";
import { MapPin, Phone, MessageCircle, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SITE, buildWhatsAppLink } from "@/config/site";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(80),
  studentClass: z.string().trim().min(1, "Please select a class").max(20),
  phone: z.string().trim().min(7, "Enter a valid phone").max(20),
  message: z.string().trim().min(5, "Add a short message").max(600),
});

const Contact = () => {
  const [form, setForm] = useState({ name: "", studentClass: "8", phone: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (k: keyof typeof form, v: string) => setForm({ ...form, [k]: v });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((i) => (errs[i.path[0] as string] = i.message));
      setErrors(errs);
      return;
    }
    setErrors({});
    const text =
      `Hello TEAMS Tuition Center,\n\n` +
      `Name: ${result.data.name}\n` +
      `Class: ${result.data.studentClass}\n` +
      `Phone: ${result.data.phone}\n\n` +
      `${result.data.message}`;
    window.open(buildWhatsAppLink(text), "_blank", "noopener");
    toast.success("Opening WhatsApp…");
  };

  return (
    <div className="container py-10 md:py-14">
      <div className="max-w-2xl">
        <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight">Get in touch</h1>
        <p className="mt-3 text-muted-foreground">
          Have a question about classes, fees or timings? Send us a message — it opens WhatsApp directly.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {/* LEFT — info */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="font-display font-bold text-lg">Visit us</h2>
            <ul className="mt-4 space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <span className="h-9 w-9 rounded-lg bg-primary-soft text-primary inline-flex items-center justify-center"><MapPin className="h-4 w-4" /></span>
                <div>
                  <div className="font-semibold">Address</div>
                  <div className="text-muted-foreground">{SITE.city}, Karnataka, India</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-9 w-9 rounded-lg bg-primary-soft text-primary inline-flex items-center justify-center"><Phone className="h-4 w-4" /></span>
                <div>
                  <div className="font-semibold">Phone</div>
                  <a href={`tel:${SITE.phone.replace(/\s/g,"")}`} className="text-muted-foreground hover:text-primary">{SITE.phone}</a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-9 w-9 rounded-lg bg-accent-soft text-accent inline-flex items-center justify-center"><MessageCircle className="h-4 w-4" /></span>
                <div>
                  <div className="font-semibold">WhatsApp</div>
                  <a href={buildWhatsAppLink("Hello TEAMS!")} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary">Chat now</a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-9 w-9 rounded-lg bg-primary-soft text-primary inline-flex items-center justify-center"><Clock className="h-4 w-4" /></span>
                <div>
                  <div className="font-semibold">Hours</div>
                  <div className="text-muted-foreground">Mon – Sun · Evenings</div>
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-card">
            <iframe
              title="TEAMS Tuition Center location"
              src="https://www.google.com/maps?q=Tumakuru,+Karnataka&output=embed"
              width="100%"
              height="280"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block w-full"
            />
          </div>
        </div>

        {/* RIGHT — form */}
        <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
          <h2 className="font-display font-bold text-lg">Send us a message</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Your name</span>
              <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Full name" />
              {errors.name && <span className="text-destructive text-xs">{errors.name}</span>}
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Class</span>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={form.studentClass}
                onChange={(e) => update("studentClass", e.target.value)}
              >
                <option value="8">Class 8</option>
                <option value="9">Class 9</option>
                <option value="10">Class 10</option>
                <option value="Other">Other</option>
              </select>
              {errors.studentClass && <span className="text-destructive text-xs">{errors.studentClass}</span>}
            </label>
          </div>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Parent / student phone</span>
            <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 ..." />
            {errors.phone && <span className="text-destructive text-xs">{errors.phone}</span>}
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Message</span>
            <Textarea
              rows={5}
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              placeholder="Tell us how we can help…"
            />
            {errors.message && <span className="text-destructive text-xs">{errors.message}</span>}
          </label>
          <Button type="submit" size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            <Send className="h-4 w-4 mr-1" /> Send via WhatsApp
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Submitting opens WhatsApp to {SITE.phone}. We don't store this message.
          </p>
        </form>
      </div>
    </div>
  );
};

export default Contact;
