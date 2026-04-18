import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle, GraduationCap, BookOpen, Lightbulb, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReviewsSummary } from "@/components/ReviewsSummary";
import { TestimonialCard } from "@/components/TestimonialCard";
import { TESTIMONIALS } from "@/data/testimonials";
import { SITE, buildWhatsAppLink } from "@/config/site";

const features = [
  { icon: GraduationCap, title: "Experienced teachers", body: "Subject specialists who break down concepts step by step." },
  { icon: BookOpen, title: "Concept clarity", body: "Doubts cleared in class — you leave understanding, not memorising." },
  { icon: Lightbulb, title: "Smart shortcuts", body: "Problem-solving techniques that save time in exams." },
  { icon: Users, title: "Personal attention", body: "Small batches so every student gets time and care." },
];

const subjects = [
  { name: "Mathematics", color: "bg-subject-maths" },
  { name: "Physics", color: "bg-subject-physics" },
  { name: "Chemistry", color: "bg-subject-chemistry" },
  { name: "Biology", color: "bg-subject-biology" },
];

const Home = () => {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-hero text-primary-foreground">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-accent/30 blur-3xl" aria-hidden />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-primary-glow/40 blur-3xl" aria-hidden />

        <div className="container relative py-20 md:py-28 grid md:grid-cols-2 gap-10 items-center">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-3 py-1 text-xs font-medium ring-1 ring-white/20">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Tumakuru's trusted coaching
            </span>
            <h1 className="mt-5 font-display font-extrabold text-4xl sm:text-5xl md:text-6xl leading-[1.05] tracking-tight">
              Master Maths & Science in <span className="text-accent">Tumakuru</span>.
            </h1>
            <p className="mt-5 text-lg text-primary-foreground/85 max-w-xl">
              Focused coaching for Classes 8, 9 and 10. Strong fundamentals, daily practice, and friendly teachers
              who make tough topics simple.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to="/timetable">View Timetable <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white/10 text-primary-foreground border-white/30 hover:bg-white/20">
                <a href={buildWhatsAppLink("Hello TEAMS, I'd like to enquire about admissions.")} target="_blank" rel="noreferrer">
                  <MessageCircle className="mr-1 h-4 w-4" /> WhatsApp Us
                </a>
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-4 text-sm text-primary-foreground/85">
              <div className="flex -space-x-2">
                {["A","R","S","M"].map((c) => (
                  <span key={c} className="h-8 w-8 rounded-full bg-white text-primary text-xs font-bold inline-flex items-center justify-center ring-2 ring-primary">{c}</span>
                ))}
              </div>
              <span><strong className="text-white">{SITE.googleRating}★</strong> from {SITE.googleReviewCount} Google reviews</span>
            </div>
          </div>

          <div className="relative animate-fade-up">
            <div className="rounded-3xl bg-white/5 backdrop-blur ring-1 ring-white/15 p-6 md:p-8 shadow-soft">
              <div className="grid grid-cols-3 gap-3">
                {[8, 9, 10].map((cls) => (
                  <div key={cls} className="rounded-xl bg-white text-primary p-4 text-center">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Class</div>
                    <div className="font-display text-3xl font-extrabold">{cls}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {subjects.map((s) => (
                  <div key={s.name} className="flex items-center gap-2 rounded-lg bg-white/10 ring-1 ring-white/15 p-3">
                    <span className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
                    <span className="text-sm font-medium">{s.name}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-xl bg-amber-gradient text-accent-foreground p-4">
                <div className="text-xs font-semibold uppercase tracking-wider opacity-80">Now enrolling</div>
                <div className="font-display font-bold text-lg">Limited seats — 2024–25 batch</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY TEAMS */}
      <section className="container py-16 md:py-20">
        <div className="max-w-2xl">
          <h2 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight">Why parents and students choose TEAMS</h2>
          <p className="mt-3 text-muted-foreground">Built around clear teaching, regular practice and personal attention.</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-soft transition-shadow">
              <div className="h-11 w-11 rounded-xl bg-primary-soft text-primary inline-flex items-center justify-center">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display font-bold text-lg">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SUBJECTS */}
      <section className="bg-secondary/40 border-y border-border">
        <div className="container py-16 md:py-20">
          <h2 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight">Subjects we teach</h2>
          <p className="mt-3 text-muted-foreground">For Classes 8, 9 and 10.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {subjects.map((s) => (
              <div key={s.name} className="group rounded-2xl bg-card border border-border p-6 shadow-card relative overflow-hidden">
                <div className={`absolute -top-8 -right-8 h-24 w-24 rounded-full ${s.color} opacity-15 group-hover:opacity-25 transition-opacity`} />
                <div className={`h-2 w-10 rounded-full ${s.color}`} />
                <h3 className="mt-4 font-display font-bold text-xl">{s.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">Class 8 · 9 · 10</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS SUMMARY */}
      <section className="container py-16 md:py-20">
        <div className="max-w-2xl">
          <h2 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight">Loved on Google</h2>
          <p className="mt-3 text-muted-foreground">Real ratings from students and parents in Tumakuru.</p>
        </div>
        <div className="mt-10">
          <ReviewsSummary />
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container pb-16 md:pb-20">
        <h2 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight">What our students say</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <TestimonialCard key={t.name} t={t} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-hero text-primary-foreground p-8 md:p-12">
          <div className="absolute -top-16 -right-12 h-56 w-56 rounded-full bg-accent/30 blur-3xl" aria-hidden />
          <div className="relative grid md:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <h3 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight">
                Join TEAMS — limited seats for this batch
              </h3>
              <p className="mt-2 text-primary-foreground/85">Talk to us on WhatsApp and reserve your spot today.</p>
            </div>
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <a href={buildWhatsAppLink("Hi TEAMS, I want to join the new batch.")} target="_blank" rel="noreferrer">
                <MessageCircle className="mr-1 h-4 w-4" /> Chat on WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
