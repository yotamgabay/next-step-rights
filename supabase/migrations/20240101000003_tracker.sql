-- ==========================================
-- Next Step Rights - Claim Tracker (ניהול תביעות)
-- ==========================================
-- Adds a personal tracker so users can manage their progress on claiming
-- rights: which rights they're actively working on (user_tracked_rights) and
-- the checklist of tasks under each (user_tasks).
--
-- Design notes:
--  * A stable `code` slug is added to `rights` so task templates can be keyed
--    off a human-readable key instead of the random UUID primary key.
--  * The tracker is fully DECOUPLED from eligibility: tracked rights reference
--    the rights catalogue directly, never the user_eligible_rights view, so a
--    profile edit that changes eligibility never hides or disables a claim the
--    user is already pursuing.
-- ==========================================


-- ==========================================
-- 1. STABLE SLUG ON THE RIGHTS CATALOGUE
-- ==========================================
ALTER TABLE public.rights ADD COLUMN IF NOT EXISTS code TEXT UNIQUE;

UPDATE public.rights SET code = 'dmei_pgia'        WHERE id = '11111111-1111-1111-1111-111111111111';
UPDATE public.rights SET code = 'nechut_avoda'     WHERE id = '22222222-2222-2222-2222-222222222222';
UPDATE public.rights SET code = 'siud'             WHERE id = '33333333-3333-3333-3333-333333333333';
UPDATE public.rights SET code = 'sharam'           WHERE id = '44444444-4444-4444-4444-444444444444';
UPDATE public.rights SET code = 'diur_negishut'    WHERE id = '55555555-5555-5555-5555-555555555555';
UPDATE public.rights SET code = 'shikum_miktzoi'   WHERE id = '66666666-6666-6666-6666-666666666666';
UPDATE public.rights SET code = 'nayadut'          WHERE id = '77777777-7777-7777-7777-777777777777';
UPDATE public.rights SET code = 'nechut_klalit'    WHERE id = '88888888-8888-8888-8888-888888888888';
UPDATE public.rights SET code = 'nifgaei_eiva'     WHERE id = '99999999-9999-9999-9999-999999999999';
UPDATE public.rights SET code = 'proteza'          WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
UPDATE public.rights SET code = 'yeled_nache'      WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
UPDATE public.rights SET code = 'nayadut_yeladim'  WHERE id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
UPDATE public.rights SET code = 'maanak_diur'      WHERE id = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
UPDATE public.rights SET code = 'chamei_marpe'     WHERE id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
UPDATE public.rights SET code = 'seker_menahalim'  WHERE id = 'ffffffff-ffff-ffff-ffff-ffffffffffff';


-- ==========================================
-- 2. EXPOSE `code` ON THE ELIGIBILITY VIEW
-- ==========================================
-- The "Add to Tracker" button needs the right's code to pick a task template,
-- so re-create the view (latest definition from 20240101000002) with r.code.
DROP VIEW IF EXISTS public.user_eligible_rights;
CREATE OR REPLACE VIEW public.user_eligible_rights AS
SELECT p.id AS user_id, r.id AS right_id, r.code, r.title, r.description, r.provider_authority
FROM public.profiles p
CROSS JOIN public.rights r

LEFT JOIN public.right_eligibility_causes rec ON rec.right_id = r.id
LEFT JOIN public.right_eligibility_insurers rei ON rei.right_id = r.id
LEFT JOIN public.right_eligibility_conditions cond ON cond.right_id = r.id

WHERE
    -- 1. Cause & Insurer Checks
    (rec.right_id IS NULL OR rec.required_cause = p.cause)
    AND (rei.right_id IS NULL OR rei.required_insurer = p.insurer)

    -- 2. User Age Check (calculates age based on birth_date)
    AND (cond.right_id IS NULL OR p.birth_date IS NULL OR (
        (cond.min_user_age IS NULL OR EXTRACT(YEAR FROM age(p.birth_date)) >= cond.min_user_age) AND
        (cond.max_user_age IS NULL OR EXTRACT(YEAR FROM age(p.birth_date)) <= cond.max_user_age)
    ))

    -- 3. Disability % Check
    AND (cond.right_id IS NULL
         OR COALESCE(p.weighted_disability_percentage, p.base_disability_percentage) IS NULL
         OR (
             COALESCE(p.weighted_disability_percentage, p.base_disability_percentage) >= COALESCE(cond.min_disability_percentage, 0)
             AND COALESCE(p.weighted_disability_percentage, p.base_disability_percentage) <= COALESCE(cond.max_disability_percentage, 100)
         )
    )

    -- 4. Medical Flags
    AND (cond.requires_dominant_hand_amputated IS NULL OR cond.requires_dominant_hand_amputated = FALSE OR p.is_dominant_hand_amputated = TRUE)
    AND (
        cond.requires_bilateral_amputation IS NULL
        OR cond.requires_bilateral_amputation = FALSE
        OR (SELECT COUNT(*) FROM public.user_amputations ua WHERE ua.user_id = p.id) >= 2
    )

    -- 5. Lifestyle / Personal Checks
    AND (cond.required_prosthetic_status IS NULL OR cond.required_prosthetic_status = p.prosthetic)
    AND (cond.required_gender IS NULL OR cond.required_gender = p.gender)
    AND (cond.required_education IS NULL OR cond.required_education = p.education)

    -- 6. Children Check
    AND (
        cond.requires_children_under_18 IS NULL
        OR cond.requires_children_under_18 = FALSE
        OR EXISTS (
            SELECT 1 FROM public.user_children uc
            WHERE uc.user_id = p.id AND uc.age_group = 'under_18'
        )
    )

    -- 7. Amputation Matrix Check
    AND (
        NOT EXISTS (SELECT 1 FROM public.right_eligibility_amputations rea WHERE rea.right_id = r.id)
        OR EXISTS (
            SELECT 1 FROM public.right_eligibility_amputations rea
            JOIN public.user_amputations ua ON ua.user_id = p.id
            WHERE rea.right_id = r.id
              AND (rea.target_limb IS NULL OR rea.target_limb = ua.limb)
              AND (rea.target_side IS NULL OR rea.target_side = ua.side)
              AND (rea.target_level IS NULL OR rea.target_level = ua.level)
        )
    );


-- ==========================================
-- 3. TASK STATUS ENUM
-- ==========================================
CREATE TYPE public.task_status AS ENUM ('todo', 'in_progress', 'done');


-- ==========================================
-- 4. TRACKED RIGHTS (which claims the user is working on)
-- ==========================================
CREATE TABLE public.user_tracked_rights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    -- References the catalogue, NOT the eligibility view: a tracked claim must
    -- survive profile changes that alter eligibility.
    right_id UUID NOT NULL REFERENCES public.rights(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- One tracker row per right per user (idempotent "Add to Tracker").
    UNIQUE(user_id, right_id)
);

ALTER TABLE public.user_tracked_rights ENABLE ROW LEVEL SECURITY;

-- Per-operation policies. The INSERT policy (WITH CHECK) is mandatory — without
-- it "Add to Tracker" is rejected by RLS, the same gap that 20240101000001
-- fixed for profiles.
CREATE POLICY "select own tracked rights" ON public.user_tracked_rights
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert own tracked rights" ON public.user_tracked_rights
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete own tracked rights" ON public.user_tracked_rights
    FOR DELETE USING (auth.uid() = user_id);


-- ==========================================
-- 5. TASKS (the checklist under each tracked right)
-- ==========================================
CREATE TABLE public.user_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Denormalized so RLS is a trivial auth.uid() = user_id with no join.
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tracked_right_id UUID NOT NULL REFERENCES public.user_tracked_rights(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status public.task_status NOT NULL DEFAULT 'todo',
    is_custom BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select own tasks" ON public.user_tasks
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert own tasks" ON public.user_tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update own tasks" ON public.user_tasks
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete own tasks" ON public.user_tasks
    FOR DELETE USING (auth.uid() = user_id);
