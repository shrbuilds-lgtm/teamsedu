-- Timetable entries for TEAMS Tuition Center
CREATE TABLE public.timetable (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_level SMALLINT NOT NULL CHECK (class_level IN (8, 9, 10)),
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 1 AND 6), -- 1=Mon..6=Sat
  time_slot TEXT NOT NULL,                -- e.g. "4:00 PM - 5:00 PM"
  slot_order SMALLINT NOT NULL DEFAULT 0, -- for ordering rows
  subject TEXT NOT NULL CHECK (subject IN ('Maths','Physics','Chemistry','Biology','Break','Other')),
  teacher TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_timetable_class ON public.timetable(class_level, day_of_week, slot_order);

ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;

-- Helper to read admin email from JWT
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'email') = 'admin.teamsedu@gmail.com',
    false
  );
$$;

-- Public read
CREATE POLICY "Timetable is viewable by everyone"
  ON public.timetable FOR SELECT
  USING (true);

-- Admin-only writes
CREATE POLICY "Only admin can insert timetable"
  ON public.timetable FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admin can update timetable"
  ON public.timetable FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admin can delete timetable"
  ON public.timetable FOR DELETE
  USING (public.is_admin());

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_timetable_updated_at
  BEFORE UPDATE ON public.timetable
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();