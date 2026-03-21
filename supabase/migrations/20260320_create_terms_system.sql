-- 1. Schema Design: Create terms table
CREATE TABLE IF NOT EXISTS public.terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year VARCHAR(20) NOT NULL, -- e.g., "2025/2026"
    term_name VARCHAR(50) NOT NULL, -- e.g., "First Term", "Second Term"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure only one term is active at a time via a unique index on a partial condition
CREATE UNIQUE INDEX IF NOT EXISTS one_active_term_idx ON public.terms (is_active) WHERE (is_active = true);

-- 2. Relationships: Update existing tables
-- Note: Assuming table names match the Prisma model names but in lowercase/snake_case as per standard Postgres conventions or Supabase defaults

-- Students table
ALTER TABLE public."Student" ADD COLUMN IF NOT EXISTS term_id UUID REFERENCES public.terms(id);

-- Grades table (Prisma model: AssessmentSubmission)
ALTER TABLE public."AssessmentSubmission" ADD COLUMN IF NOT EXISTS term_id UUID REFERENCES public.terms(id);

-- Attendance table (Create if not exists, as it was missing from Prisma schema but mentioned in task)
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public."Student"(id),
    term_id UUID NOT NULL REFERENCES public.terms(id),
    status VARCHAR(20) NOT NULL, -- e.g., "present", "absent", "late"
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(student_id, term_id, date)
);

-- 3. Admin Logic: Set Active Term Function
CREATE OR REPLACE FUNCTION public.set_active_term(target_term_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Deactivate all terms
    UPDATE public.terms SET is_active = false;
    
    -- Activate the target term
    UPDATE public.terms SET is_active = true WHERE id = target_term_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Term with ID % not found', target_term_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- 4. Row Level Security (RLS)
-- Enable RLS on tables
ALTER TABLE public.terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Student" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AssessmentSubmission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Terms Policies
CREATE POLICY "Admins can do everything on terms" ON public.terms
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Teachers can view terms" ON public.terms
    FOR SELECT TO authenticated
    USING (true);

-- Student Data Isolation (Teachers only see active term data)
CREATE POLICY "Teachers can view/edit active term students" ON public."Student"
    FOR ALL TO authenticated
    USING (
        (auth.jwt() ->> 'role' = 'admin') OR 
        (term_id IN (SELECT id FROM public.terms WHERE is_active = true))
    )
    WITH CHECK (
        (auth.jwt() ->> 'role' = 'admin') OR 
        (term_id IN (SELECT id FROM public.terms WHERE is_active = true))
    );

-- Assessment Submissions Isolation
CREATE POLICY "Teachers can manage active term grades" ON public."AssessmentSubmission"
    FOR ALL TO authenticated
    USING (
        (auth.jwt() ->> 'role' = 'admin') OR 
        (term_id IN (SELECT id FROM public.terms WHERE is_active = true))
    )
    WITH CHECK (
        (auth.jwt() ->> 'role' = 'admin') OR 
        (term_id IN (SELECT id FROM public.terms WHERE is_active = true))
    );

-- Attendance Isolation
CREATE POLICY "Teachers can manage active term attendance" ON public.attendance
    FOR ALL TO authenticated
    USING (
        (auth.jwt() ->> 'role' = 'admin') OR 
        (term_id IN (SELECT id FROM public.terms WHERE is_active = true))
    )
    WITH CHECK (
        (auth.jwt() ->> 'role' = 'admin') OR 
        (term_id IN (SELECT id FROM public.terms WHERE is_active = true))
    );

-- 5. Automation: Triggers to auto-link data to active term
-- Helper function to get active term ID
CREATE OR REPLACE FUNCTION public.get_active_term_id()
RETURNS UUID AS $$
    SELECT id FROM public.terms WHERE is_active = true LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Trigger function to set term_id on insert
CREATE OR REPLACE FUNCTION public.set_term_id_on_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Only set if term_id is NULL
    IF NEW.term_id IS NULL THEN
        NEW.term_id := public.get_active_term_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables
DROP TRIGGER IF EXISTS tr_auto_link_student_term ON public."Student";
CREATE TRIGGER tr_auto_link_student_term
    BEFORE INSERT ON public."Student"
    FOR EACH ROW EXECUTE FUNCTION public.set_term_id_on_insert();

DROP TRIGGER IF EXISTS tr_auto_link_grade_term ON public."AssessmentSubmission";
CREATE TRIGGER tr_auto_link_grade_term
    BEFORE INSERT ON public."AssessmentSubmission"
    FOR EACH ROW EXECUTE FUNCTION public.set_term_id_on_insert();

DROP TRIGGER IF EXISTS tr_auto_link_attendance_term ON public.attendance;
CREATE TRIGGER tr_auto_link_attendance_term
    BEFORE INSERT ON public.attendance
    FOR EACH ROW EXECUTE FUNCTION public.set_term_id_on_insert();
