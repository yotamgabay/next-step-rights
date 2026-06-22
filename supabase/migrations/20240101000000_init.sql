-- ==========================================
-- Next Step Rights - Supabase Database Schema
-- ==========================================
-- This schema integrates with Supabase's native auth, uses UUIDs, 
-- implements Row Level Security (RLS), and refines the relations
-- for maximum accuracy.
-- ==========================================

-- 1. ENUMS (Created in the public schema)
CREATE TYPE public.amputation_cause AS ENUM (
    'army', 'terror', 'work', 'road_accident', 'disease', 'birth_other'
);

CREATE TYPE public.insuring_entity AS ENUM (
    'mod', 'ni_terror', 'ni_work', 'ni_general', 'moh', 'private'
);

CREATE TYPE public.limb_type AS ENUM ('arm', 'leg');

-- Accuracy fix: Removed 'both'. A bilateral amputee has TWO rows in the user_amputations table.
CREATE TYPE public.side_type AS ENUM ('right', 'left');

CREATE TYPE public.amputation_level AS ENUM (
    'fingers', 'hand', 'below_elbow', 'above_elbow', 'shoulder',
    'foot', 'below_knee', 'through_knee', 'above_knee', 'pelvis'
);

CREATE TYPE public.prosthetic_status AS ENUM ('yes', 'no', 'not_yet');

CREATE TYPE public.education_level AS ENUM (
    'not_relevant', 'below_high_school', 'high_school', 'certificate', 'degree'
);

CREATE TYPE public.gender_type AS ENUM ('male', 'female', 'other');

CREATE TYPE public.child_age_group AS ENUM ('under_18', '18_to_24', 'over_24');


-- ==========================================
-- 2. USER PROFILES (Links to Supabase auth.users)
-- ==========================================

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    age INT,
    amputation_type TEXT,
    
    -- Accuracy fix: Added birth_date so we can calculate user age dynamically
    birth_date DATE,
    
    cause public.amputation_cause,
    insurer public.insuring_entity,
    
    base_disability_percentage INT CHECK (base_disability_percentage >= 0 AND base_disability_percentage <= 100),
    weighted_disability_percentage INT CHECK (weighted_disability_percentage >= 0 AND weighted_disability_percentage <= 100),
    is_dominant_hand_amputated BOOLEAN DEFAULT FALSE,
    has_phantom_pain BOOLEAN DEFAULT FALSE,
    has_crps BOOLEAN DEFAULT FALSE,

    prosthetic public.prosthetic_status,
    education public.education_level,
    gender public.gender_type,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);


-- ==========================================
-- 3. USER 1-to-N RELATIONS
-- ==========================================

CREATE TABLE public.user_amputations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    limb public.limb_type NOT NULL,
    side public.side_type NOT NULL,
    level public.amputation_level NOT NULL,
    -- A user can't have two different amputation levels on the exact same limb and side
    UNIQUE(user_id, limb, side) 
);

ALTER TABLE public.user_amputations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their amputations" ON public.user_amputations FOR ALL USING (auth.uid() = user_id);

CREATE TABLE public.user_children (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    age_group public.child_age_group NOT NULL,
    children_count INT DEFAULT 1 CHECK (children_count > 0),
    UNIQUE(user_id, age_group)
);

ALTER TABLE public.user_children ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their children" ON public.user_children FOR ALL USING (auth.uid() = user_id);


-- ==========================================
-- 4. RIGHTS CATALOGUE
-- ==========================================

CREATE TABLE public.rights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    provider_authority TEXT NOT NULL,
    link_to_source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.rights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Rights are viewable by everyone" ON public.rights FOR SELECT USING (true);


-- ==========================================
-- 5. ELIGIBILITY TABLES
-- ==========================================

CREATE TABLE public.right_eligibility_causes (
    right_id UUID REFERENCES public.rights(id) ON DELETE CASCADE,
    required_cause public.amputation_cause NOT NULL,
    PRIMARY KEY (right_id, required_cause)
);
ALTER TABLE public.right_eligibility_causes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.right_eligibility_causes FOR SELECT USING (true);


CREATE TABLE public.right_eligibility_insurers (
    right_id UUID REFERENCES public.rights(id) ON DELETE CASCADE,
    required_insurer public.insuring_entity NOT NULL,
    PRIMARY KEY (right_id, required_insurer)
);
ALTER TABLE public.right_eligibility_insurers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.right_eligibility_insurers FOR SELECT USING (true);


CREATE TABLE public.right_eligibility_amputations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    right_id UUID REFERENCES public.rights(id) ON DELETE CASCADE,
    target_limb public.limb_type,      -- if NULL, applies to any limb
    target_side public.side_type,      -- if NULL, applies to any side
    target_level public.amputation_level -- if NULL, applies to any level
);
ALTER TABLE public.right_eligibility_amputations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.right_eligibility_amputations FOR SELECT USING (true);


CREATE TABLE public.right_eligibility_conditions (
    right_id UUID PRIMARY KEY REFERENCES public.rights(id) ON DELETE CASCADE,
    
    -- Disability thresholds
    min_disability_percentage INT DEFAULT 0,
    max_disability_percentage INT DEFAULT 100,
    
    -- User Age thresholds (calculated dynamically)
    min_user_age INT,
    max_user_age INT,
    
    -- Specific medical scenarios
    requires_dominant_hand_amputated BOOLEAN,
    requires_bilateral_amputation BOOLEAN, -- User must have >=2 amputations
    
    required_prosthetic_status public.prosthetic_status,
    requires_children_under_18 BOOLEAN,
    required_education public.education_level,
    required_gender public.gender_type
);
ALTER TABLE public.right_eligibility_conditions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.right_eligibility_conditions FOR SELECT USING (true);


-- ==========================================
-- 6. DYNAMIC MATCHING VIEW
-- ==========================================

CREATE OR REPLACE VIEW public.user_eligible_rights AS
SELECT p.id AS user_id, r.id AS right_id, r.title, r.provider_authority
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
    AND (cond.right_id IS NULL OR (p.weighted_disability_percentage >= cond.min_disability_percentage AND p.weighted_disability_percentage <= cond.max_disability_percentage))
    
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
-- Supabase Trigger for new User Signups
-- This ensures that every time a user signs up via Email or Google SSO,
-- a row is automatically inserted into the `public.profiles` table.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    -- Extracts the name from Google SSO metadata, or defaults to a generic name
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '×ž×©×ª×ž×© ×—×“×©')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach the trigger to the auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
