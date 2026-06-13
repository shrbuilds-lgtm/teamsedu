import { useEffect, useMemo, useRef, useState } from "react";
import {
  Loader2,
  LogIn,
  LogOut,
  Plus,
  Save,
  Trash2,
  Pencil,
  Printer,
  Download,
  Share2,
  Search,
  CalendarDays,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Toggle } from "@/components/ui/toggle";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { buildWhatsAppLink } from "@/config/site";

type Subject = "Maths" | "Physics" | "Chemistry" | "Biology" | "Break" | "Other";

type Slot = {
  id: string;
  class_level: number;
  day_of_week: number;
  time_slot: string;
  slot_order: number;
  subject: Subject;
  teacher: string | null;
};

const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAYS_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SUBJECTS: Subject[] = ["Maths", "Physics", "Chemistry", "Biology", "Break", "Other"];

const subjectClass: Record<Subject, string> = {
  Maths: "bg-subject-maths/15 text-subject-maths ring-subject-maths/30",
  Physics: "bg-subject-physics/15 text-subject-physics ring-subject-physics/30",
  Chemistry: "bg-subject-chemistry/15 text-subject-chemistry ring-subject-chemistry/30",
  Biology: "bg-subject-biology/15 text-subject-biology ring-subject-biology/30",
  Break: "bg-subject-break/15 text-subject-break ring-subject-break/30",
  Other: "bg-subject-other/15 text-subject-other ring-subject-other/30",
};

const subjectDot: Record<Subject, string> = {
  Maths: "bg-subject-maths",
  Physics: "bg-subject-physics",
  Chemistry: "bg-subject-chemistry",
  Biology: "bg-subject-biology",
  Break: "bg-subject-break",
  Other: "bg-subject-other",
};

// JS Sunday=0 → our Mon=1..Sat=6, Sun=7
const todayIndex = (() => {
  const d = new Date().getDay();
  return d === 0 ? 7 : d;
})();

const Timetable = () => {
  const { user, isAdmin, signInWithGoogle, signOut, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeClass, setActiveClass] = useState<number>(8);
  const [editing, setEditing] = useState<Slot | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<Set<Subject>>(new Set());
  const printRef = useRef<HTMLDivElement>(null);

  const fetchRows = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("timetable")
      .select("*")
      .order("class_level")
      .order("day_of_week")
      .order("slot_order");
    if (error) {
      console.error("Timetable fetch error:", error);
      toast.error("Failed to load timetable. Please try again.");
    }
    setRows((data ?? []) as Slot[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchRows();
    const channel = supabase
      .channel("timetable-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "timetable" },
        () => fetchRows(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Keyboard shortcut: "/" focuses search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        document.getElementById("tt-search")?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = rows.filter((r) => {
      if (r.class_level !== activeClass) return false;
      if (subjectFilter.size > 0 && !subjectFilter.has(r.subject)) return false;
      if (q) {
        const hay = `${r.subject} ${r.teacher ?? ""} ${r.time_slot}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    const slots = Array.from(new Set(filtered.map((r) => r.time_slot)));
    slots.sort((a, b) => {
      const oa = Math.min(...filtered.filter((r) => r.time_slot === a).map((r) => r.slot_order));
      const ob = Math.min(...filtered.filter((r) => r.time_slot === b).map((r) => r.slot_order));
      return oa - ob;
    });
    return { filtered, slots };
  }, [rows, activeClass, query, subjectFilter]);

  const cellFor = (day: number, time: string) =>
    grouped.filtered.find((r) => r.day_of_week === day && r.time_slot === time);

  const toggleSubject = (s: Subject) => {
    setSubjectFilter((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  };

  const startAdd = () => {
    setEditing({
      id: "",
      class_level: activeClass,
      day_of_week: 1,
      time_slot: "",
      slot_order: (grouped.slots.length + 1) * 10,
      subject: "Maths",
      teacher: "",
    });
  };

  const saveSlot = async () => {
    if (!editing) return;
    if (!editing.time_slot.trim()) {
      toast.error("Time slot is required");
      return;
    }
    const payload = {
      class_level: editing.class_level,
      day_of_week: editing.day_of_week,
      time_slot: editing.time_slot.trim(),
      slot_order: editing.slot_order,
      subject: editing.subject,
      teacher: editing.teacher?.trim() || null,
    };
    const { error } = editing.id
      ? await supabase.from("timetable").update(payload).eq("id", editing.id)
      : await supabase.from("timetable").insert(payload);
    if (error) {
      console.error("Timetable save error:", error);
      toast.error("Could not save slot. Please check the details and try again.");
      return;
    }
    toast.success("Saved");
    setEditing(null);
    fetchRows();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("timetable").delete().eq("id", deleteId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Deleted");
      fetchRows();
    }
    setDeleteId(null);
  };

  const handlePrint = () => window.print();

  const handleDownloadCsv = () => {
    const header = ["Day", "Time", "Subject", "Teacher"];
    const lines = [header.join(",")];
    grouped.filtered
      .slice()
      .sort((a, b) => a.day_of_week - b.day_of_week || a.slot_order - b.slot_order)
      .forEach((r) => {
        const day = DAYS_FULL[r.day_of_week - 1] ?? "";
        const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
        lines.push(
          [escape(day), escape(r.time_slot), escape(r.subject), escape(r.teacher ?? "")].join(","),
        );
      });
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TEAMS-class-${activeClass}-timetable.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded CSV");
  };

  const handleShareWhatsApp = () => {
    const lines: string[] = [`*TEAMS — Class ${activeClass} Timetable*`, ""];
    DAYS_SHORT.forEach((d, i) => {
      const day = i + 1;
      const dayRows = grouped.filtered
        .filter((r) => r.day_of_week === day)
        .sort((a, b) => a.slot_order - b.slot_order);
      if (dayRows.length === 0) return;
      lines.push(`*${DAYS_FULL[i]}*`);
      dayRows.forEach((r) => {
        lines.push(
          `• ${r.time_slot} — ${r.subject}${r.teacher ? ` (${r.teacher})` : ""}`,
        );
      });
      lines.push("");
    });
    window.open(buildWhatsAppLink(lines.join("\n")), "_blank", "noreferrer");
  };

  const isToday = (day: number) => day === todayIndex;

  return (
    <div className="container py-10 md:py-14">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4" data-print-hide>
        <div>
          <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight">
            Class Timetable
          </h1>
          <p className="mt-2 text-muted-foreground">
            Weekly schedule for Class 8, 9 and 10. Updates live.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {authLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-label="Loading" />
          ) : user ? (
            <>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {isAdmin ? "Admin" : "Viewer"}: {user.email}
              </span>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-1" aria-hidden /> Sign out
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={signInWithGoogle}
              className="bg-primary text-primary-foreground"
            >
              <LogIn className="h-4 w-4 mr-1" aria-hidden /> Admin sign in
            </Button>
          )}
        </div>
      </div>

      {user && !isAdmin && (
        <div
          role="status"
          className="mt-4 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground"
          data-print-hide
        >
          You're signed in but not the admin. The timetable is view-only.
        </div>
      )}

      {/* Toolbar */}
      <div className="mt-6 flex flex-wrap items-center gap-2" data-print-hide>
        <label className="relative flex-1 min-w-[200px] max-w-md">
          <span className="sr-only">Search timetable</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="tt-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search subject, teacher, time…  (press "/")'
            className="pl-9"
          />
        </label>

        <div className="flex items-center gap-1 flex-wrap" role="group" aria-label="Filter by subject">
          {SUBJECTS.map((s) => (
            <Toggle
              key={s}
              pressed={subjectFilter.has(s)}
              onPressedChange={() => toggleSubject(s)}
              size="sm"
              aria-label={`Filter ${s}`}
              className="data-[state=on]:bg-primary-soft data-[state=on]:text-primary"
            >
              <span className={`h-2 w-2 rounded-full mr-1.5 ${subjectDot[s]}`} aria-hidden />
              {s}
            </Toggle>
          ))}
          {subjectFilter.size > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSubjectFilter(new Set())}
              className="text-muted-foreground"
            >
              Clear
            </Button>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleShareWhatsApp} aria-label="Share on WhatsApp">
            <Share2 className="h-4 w-4 mr-1" aria-hidden /> Share
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadCsv} aria-label="Download as CSV">
            <Download className="h-4 w-4 mr-1" aria-hidden /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint} aria-label="Print timetable">
            <Printer className="h-4 w-4 mr-1" aria-hidden /> Print
          </Button>
        </div>
      </div>

      <Tabs
        value={String(activeClass)}
        onValueChange={(v) => setActiveClass(Number(v))}
        className="mt-6"
      >
        <TabsList className="grid grid-cols-3 max-w-sm" data-print-hide>
          <TabsTrigger value="8">Class 8</TabsTrigger>
          <TabsTrigger value="9">Class 9</TabsTrigger>
          <TabsTrigger value="10">Class 10</TabsTrigger>
        </TabsList>

        {[8, 9, 10].map((cls) => (
          <TabsContent key={cls} value={String(cls)} className="mt-6">
            <div ref={cls === activeClass ? printRef : undefined} className="print-area">
              {loading ? (
                <div
                  className="flex items-center gap-2 text-muted-foreground"
                  role="status"
                  aria-live="polite"
                >
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading timetable…
                </div>
              ) : (
                <>
                  <div className="hidden print:block mb-4">
                    <h2 className="font-display font-bold text-xl">
                      TEAMS — Class {cls} Timetable
                    </h2>
                  </div>

                  {isAdmin && (
                    <div className="mb-4" data-print-hide>
                      <Button
                        onClick={startAdd}
                        className="bg-accent text-accent-foreground hover:bg-accent/90"
                      >
                        <Plus className="h-4 w-4 mr-1" aria-hidden /> Add slot
                      </Button>
                    </div>
                  )}

                  {/* Desktop grid */}
                  <div className="hidden md:block overflow-x-auto rounded-2xl border border-border bg-card shadow-card">
                    <table
                      className="w-full text-sm"
                      aria-label={`Weekly timetable for class ${cls}`}
                    >
                      <caption className="sr-only">
                        Weekly schedule for Class {cls}. Columns are days of the week, rows are
                        time slots.
                      </caption>
                      <thead>
                        <tr className="bg-secondary/60">
                          <th
                            scope="col"
                            className="text-left p-3 font-semibold text-muted-foreground w-40"
                          >
                            Time
                          </th>
                          {DAYS_SHORT.map((d, i) => (
                            <th
                              key={d}
                              scope="col"
                              aria-current={isToday(i + 1) ? "date" : undefined}
                              className={`text-left p-3 font-semibold ${
                                isToday(i + 1)
                                  ? "text-primary bg-primary-soft/60"
                                  : "text-muted-foreground"
                              }`}
                            >
                              <span className="flex items-center gap-1.5">
                                {d}
                                {isToday(i + 1) && (
                                  <span className="text-[10px] font-bold uppercase tracking-wider rounded-full bg-primary text-primary-foreground px-1.5 py-0.5">
                                    Today
                                  </span>
                                )}
                              </span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {grouped.slots.length === 0 && (
                          <tr>
                            <td
                              colSpan={DAYS_SHORT.length + 1}
                              className="p-8 text-center text-muted-foreground"
                            >
                              {query || subjectFilter.size > 0
                                ? "No classes match your filters."
                                : "No slots yet."}
                            </td>
                          </tr>
                        )}
                        {grouped.slots.map((time) => (
                          <tr key={time} className="border-t border-border">
                            <th
                              scope="row"
                              className="p-3 font-medium align-top text-left whitespace-nowrap"
                            >
                              {time}
                            </th>
                            {DAYS_SHORT.map((_, idx) => {
                              const day = idx + 1;
                              const cell = cellFor(day, time);
                              return (
                                <td
                                  key={day}
                                  className={`p-3 align-top ${
                                    isToday(day) ? "bg-primary-soft/30" : ""
                                  }`}
                                >
                                  {cell ? (
                                    <div className="group/cell flex items-start gap-2 focus-within:bg-muted/40 rounded-lg p-0.5 -m-0.5">
                                      <span
                                        className={`inline-flex flex-col rounded-lg ring-1 px-2.5 py-1.5 ${subjectClass[cell.subject]}`}
                                      >
                                        <span className="font-semibold leading-tight flex items-center gap-1.5">
                                          <span
                                            className={`h-2 w-2 rounded-full ${subjectDot[cell.subject]}`}
                                            aria-hidden
                                          />
                                          {cell.subject}
                                        </span>
                                        {cell.teacher && (
                                          <span className="text-[11px] opacity-80 mt-0.5">
                                            {cell.teacher}
                                          </span>
                                        )}
                                      </span>
                                      {isAdmin && (
                                        <span
                                          className="flex gap-1 opacity-0 group-hover/cell:opacity-100 group-focus-within/cell:opacity-100 focus-within:opacity-100 transition"
                                          data-print-hide
                                        >
                                          <button
                                            onClick={() => setEditing(cell)}
                                            className="p-1.5 rounded hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            aria-label={`Edit ${cell.subject} on ${DAYS_FULL[idx]} at ${time}`}
                                          >
                                            <Pencil className="h-3.5 w-3.5" aria-hidden />
                                          </button>
                                          <button
                                            onClick={() => setDeleteId(cell.id)}
                                            className="p-1.5 rounded hover:bg-destructive/10 text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
                                            aria-label={`Delete ${cell.subject} on ${DAYS_FULL[idx]} at ${time}`}
                                          >
                                            <Trash2 className="h-3.5 w-3.5" aria-hidden />
                                          </button>
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground/50" aria-label="No class">
                                      —
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile day cards */}
                  <div className="md:hidden space-y-4">
                    {DAYS_SHORT.map((d, idx) => {
                      const day = idx + 1;
                      const dayRows = grouped.filtered
                        .filter((r) => r.day_of_week === day)
                        .sort((a, b) => a.slot_order - b.slot_order);
                      const today = isToday(day);
                      return (
                        <section
                          key={d}
                          aria-labelledby={`day-${day}`}
                          className={`rounded-2xl border bg-card shadow-card overflow-hidden ${
                            today ? "border-primary ring-2 ring-primary/20" : "border-border"
                          }`}
                        >
                          <div
                            className={`px-4 py-2 font-semibold flex items-center justify-between ${
                              today ? "bg-primary text-primary-foreground" : "bg-secondary/60"
                            }`}
                          >
                            <h3 id={`day-${day}`} className="text-sm">
                              {DAYS_FULL[idx]}
                            </h3>
                            {today && (
                              <span className="text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                                <CalendarDays className="h-3 w-3" aria-hidden /> Today
                              </span>
                            )}
                          </div>
                          <div className="divide-y divide-border">
                            {dayRows.length === 0 && (
                              <div className="p-4 text-sm text-muted-foreground">
                                No classes.
                              </div>
                            )}
                            {dayRows.map((r) => (
                              <div
                                key={r.id}
                                className="p-4 flex items-center justify-between gap-3"
                              >
                                <div>
                                  <div className="text-xs text-muted-foreground">
                                    {r.time_slot}
                                  </div>
                                  <div className="mt-1 inline-flex items-center gap-2 flex-wrap">
                                    <span
                                      className={`inline-flex items-center gap-1.5 rounded-md ring-1 px-2 py-0.5 text-xs font-semibold ${subjectClass[r.subject]}`}
                                    >
                                      <span
                                        className={`h-1.5 w-1.5 rounded-full ${subjectDot[r.subject]}`}
                                        aria-hidden
                                      />
                                      {r.subject}
                                    </span>
                                    {r.teacher && (
                                      <span className="text-xs text-muted-foreground">
                                        {r.teacher}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {isAdmin && (
                                  <div className="flex gap-1" data-print-hide>
                                    <button
                                      onClick={() => setEditing(r)}
                                      className="p-2 rounded hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                      aria-label={`Edit ${r.subject} on ${DAYS_FULL[idx]} at ${r.time_slot}`}
                                    >
                                      <Pencil className="h-4 w-4" aria-hidden />
                                    </button>
                                    <button
                                      onClick={() => setDeleteId(r.id)}
                                      className="p-2 rounded hover:bg-destructive/10 text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
                                      aria-label={`Delete ${r.subject} on ${DAYS_FULL[idx]} at ${r.time_slot}`}
                                    >
                                      <Trash2 className="h-4 w-4" aria-hidden />
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </section>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div
                    className="mt-6 flex flex-wrap items-center gap-3 text-xs text-muted-foreground"
                    aria-label="Subject legend"
                  >
                    <span className="font-medium text-foreground">Legend:</span>
                    {SUBJECTS.map((s) => (
                      <span key={s} className="inline-flex items-center gap-1.5">
                        <span className={`h-2.5 w-2.5 rounded-full ${subjectDot[s]}`} aria-hidden />
                        {s}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit dialog */}
      <Dialog open={!!editing && isAdmin} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit slot" : "Add slot"}</DialogTitle>
            <DialogDescription>
              Changes appear live for everyone viewing the timetable.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="grid gap-3">
              <label className="grid gap-1 text-sm">
                <span className="font-medium">Class</span>
                <Select
                  value={String(editing.class_level)}
                  onValueChange={(v) => setEditing({ ...editing, class_level: Number(v) })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[8, 9, 10].map((c) => (
                      <SelectItem key={c} value={String(c)}>Class {c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium">Day</span>
                <Select
                  value={String(editing.day_of_week)}
                  onValueChange={(v) => setEditing({ ...editing, day_of_week: Number(v) })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DAYS_FULL.map((d, i) => (
                      <SelectItem key={d} value={String(i + 1)}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium">Time slot</span>
                <Input
                  value={editing.time_slot}
                  onChange={(e) => setEditing({ ...editing, time_slot: e.target.value })}
                  placeholder="e.g. 4:30 PM - 5:30 PM"
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium">Slot order</span>
                <Input
                  type="number"
                  value={editing.slot_order}
                  onChange={(e) =>
                    setEditing({ ...editing, slot_order: Number(e.target.value) })
                  }
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium">Subject</span>
                <Select
                  value={editing.subject}
                  onValueChange={(v) => setEditing({ ...editing, subject: v as Subject })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium">Teacher (optional)</span>
                <Input
                  value={editing.teacher ?? ""}
                  onChange={(e) => setEditing({ ...editing, teacher: e.target.value })}
                  placeholder="Teacher name"
                />
              </label>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveSlot} className="bg-primary text-primary-foreground">
              <Save className="h-4 w-4 mr-1" aria-hidden /> Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this slot?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the class from the timetable for everyone. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Timetable;
