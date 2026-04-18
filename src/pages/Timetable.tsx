import { useEffect, useMemo, useState } from "react";
import { Loader2, LogIn, LogOut, Plus, Save, Trash2, Pencil, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

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

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SUBJECTS: Subject[] = ["Maths", "Physics", "Chemistry", "Biology", "Break", "Other"];

const subjectClass: Record<Subject, string> = {
  Maths: "bg-subject-maths/10 text-subject-maths ring-subject-maths/20",
  Physics: "bg-subject-physics/10 text-subject-physics ring-subject-physics/20",
  Chemistry: "bg-subject-chemistry/10 text-subject-chemistry ring-subject-chemistry/20",
  Biology: "bg-subject-biology/10 text-subject-biology ring-subject-biology/20",
  Break: "bg-subject-break/10 text-subject-break ring-subject-break/20",
  Other: "bg-subject-other/10 text-subject-other ring-subject-other/20",
};

const Timetable = () => {
  const { user, isAdmin, signInWithGoogle, signOut, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeClass, setActiveClass] = useState<number>(8);
  const [editing, setEditing] = useState<Slot | null>(null);

  const fetchRows = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("timetable")
      .select("*")
      .order("class_level")
      .order("day_of_week")
      .order("slot_order");
    if (error) toast.error(error.message);
    setRows((data ?? []) as Slot[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchRows();
    const channel = supabase
      .channel("timetable-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "timetable" }, () => {
        fetchRows();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const grouped = useMemo(() => {
    const filtered = rows.filter((r) => r.class_level === activeClass);
    const slots = Array.from(new Set(filtered.map((r) => r.time_slot)));
    // sort by min slot_order observed for that time_slot
    slots.sort((a, b) => {
      const oa = Math.min(...filtered.filter((r) => r.time_slot === a).map((r) => r.slot_order));
      const ob = Math.min(...filtered.filter((r) => r.time_slot === b).map((r) => r.slot_order));
      return oa - ob;
    });
    return { filtered, slots };
  }, [rows, activeClass]);

  const cellFor = (day: number, time: string) =>
    grouped.filtered.find((r) => r.day_of_week === day && r.time_slot === time);

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
      toast.error(error.message);
      return;
    }
    toast.success("Saved");
    setEditing(null);
    fetchRows();
  };

  const deleteSlot = async (id: string) => {
    if (!confirm("Delete this slot?")) return;
    const { error } = await supabase.from("timetable").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    fetchRows();
  };

  return (
    <div className="container py-10 md:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight">Class Timetable</h1>
          <p className="mt-2 text-muted-foreground">Weekly schedule for Class 8, 9 and 10. Updates live.</p>
        </div>

        <div className="flex items-center gap-2">
          {authLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : user ? (
            <>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {isAdmin ? "Admin" : "Viewer"}: {user.email}
              </span>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-1" /> Sign out
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={signInWithGoogle} className="bg-primary text-primary-foreground">
              <LogIn className="h-4 w-4 mr-1" /> Admin sign in
            </Button>
          )}
        </div>
      </div>

      {user && !isAdmin && (
        <div className="mt-4 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          You're signed in but not the admin. The timetable is view-only.
        </div>
      )}

      <Tabs value={String(activeClass)} onValueChange={(v) => setActiveClass(Number(v))} className="mt-6">
        <TabsList className="grid grid-cols-3 max-w-sm">
          <TabsTrigger value="8">Class 8</TabsTrigger>
          <TabsTrigger value="9">Class 9</TabsTrigger>
          <TabsTrigger value="10">Class 10</TabsTrigger>
        </TabsList>

        {[8, 9, 10].map((cls) => (
          <TabsContent key={cls} value={String(cls)} className="mt-6">
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
            ) : (
              <>
                {isAdmin && (
                  <div className="mb-4">
                    <Button onClick={startAdd} className="bg-accent text-accent-foreground hover:bg-accent/90">
                      <Plus className="h-4 w-4 mr-1" /> Add slot
                    </Button>
                  </div>
                )}

                {/* Desktop grid */}
                <div className="hidden md:block overflow-x-auto rounded-2xl border border-border bg-card shadow-card">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-secondary/60">
                        <th className="text-left p-3 font-semibold text-muted-foreground w-40">Time</th>
                        {DAYS.map((d) => (
                          <th key={d} className="text-left p-3 font-semibold text-muted-foreground">{d}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {grouped.slots.length === 0 && (
                        <tr><td colSpan={DAYS.length + 1} className="p-6 text-center text-muted-foreground">No slots yet.</td></tr>
                      )}
                      {grouped.slots.map((time) => (
                        <tr key={time} className="border-t border-border">
                          <td className="p-3 font-medium align-top">{time}</td>
                          {DAYS.map((_, idx) => {
                            const day = idx + 1;
                            const cell = cellFor(day, time);
                            return (
                              <td key={day} className="p-3 align-top">
                                {cell ? (
                                  <div className="group flex items-start gap-2">
                                    <span className={`inline-flex flex-col rounded-lg ring-1 px-2.5 py-1.5 ${subjectClass[cell.subject]}`}>
                                      <span className="font-semibold leading-tight">{cell.subject}</span>
                                      {cell.teacher && (
                                        <span className="text-[11px] opacity-80">{cell.teacher}</span>
                                      )}
                                    </span>
                                    {isAdmin && (
                                      <span className="opacity-0 group-hover:opacity-100 transition flex gap-1">
                                        <button onClick={() => setEditing(cell)} className="p-1 rounded hover:bg-muted" aria-label="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                                        <button onClick={() => deleteSlot(cell.id)} className="p-1 rounded hover:bg-destructive/10 text-destructive" aria-label="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground/50">—</span>
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
                  {DAYS.map((d, idx) => {
                    const day = idx + 1;
                    const dayRows = grouped.filtered.filter((r) => r.day_of_week === day);
                    return (
                      <div key={d} className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
                        <div className="px-4 py-2 bg-secondary/60 font-semibold">{d}</div>
                        <div className="divide-y divide-border">
                          {dayRows.length === 0 && <div className="p-4 text-sm text-muted-foreground">No classes.</div>}
                          {dayRows.map((r) => (
                            <div key={r.id} className="p-4 flex items-center justify-between gap-3">
                              <div>
                                <div className="text-xs text-muted-foreground">{r.time_slot}</div>
                                <div className="mt-1 inline-flex items-center gap-2">
                                  <span className={`inline-flex rounded-md ring-1 px-2 py-0.5 text-xs font-semibold ${subjectClass[r.subject]}`}>
                                    {r.subject}
                                  </span>
                                  {r.teacher && <span className="text-xs text-muted-foreground">{r.teacher}</span>}
                                </div>
                              </div>
                              {isAdmin && (
                                <div className="flex gap-1">
                                  <button onClick={() => setEditing(r)} className="p-2 rounded hover:bg-muted" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                                  <button onClick={() => deleteSlot(r.id)} className="p-2 rounded hover:bg-destructive/10 text-destructive" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit drawer/modal */}
      {editing && isAdmin && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4" onClick={() => setEditing(null)}>
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-soft" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg">{editing.id ? "Edit slot" : "Add slot"}</h3>
              <button onClick={() => setEditing(null)} className="p-1 rounded hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-4 grid gap-3">
              <label className="grid gap-1 text-sm">
                <span className="font-medium">Class</span>
                <Select value={String(editing.class_level)} onValueChange={(v) => setEditing({ ...editing, class_level: Number(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[8,9,10].map(c => <SelectItem key={c} value={String(c)}>Class {c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium">Day</span>
                <Select value={String(editing.day_of_week)} onValueChange={(v) => setEditing({ ...editing, day_of_week: Number(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DAYS.map((d, i) => <SelectItem key={d} value={String(i+1)}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium">Time slot</span>
                <Input value={editing.time_slot} onChange={(e) => setEditing({ ...editing, time_slot: e.target.value })} placeholder="e.g. 4:30 PM - 5:30 PM" />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium">Slot order</span>
                <Input type="number" value={editing.slot_order} onChange={(e) => setEditing({ ...editing, slot_order: Number(e.target.value) })} />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium">Subject</span>
                <Select value={editing.subject} onValueChange={(v) => setEditing({ ...editing, subject: v as Subject })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium">Teacher (optional)</span>
                <Input value={editing.teacher ?? ""} onChange={(e) => setEditing({ ...editing, teacher: e.target.value })} placeholder="Teacher name" />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={saveSlot} className="bg-primary text-primary-foreground"><Save className="h-4 w-4 mr-1" /> Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timetable;
