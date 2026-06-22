-- ==========================================
-- Next Step Rights - Database Schema
-- ==========================================
-- This schema models the users, their complex medical and personal situations,
-- the rights catalogue, and the many-to-many relationship mapping between them
-- to enable a precise eligibility engine.
-- ==========================================

-- 1. ENUMS (Lookup types based on the user journey)
CREATE TYPE amputation_cause AS ENUM (
    'army',           -- תאונה בצבא
    'terror',         -- פעולות איבה
    'work',           -- תאונה במקום העבודה
    'road_accident',  -- תאונת דרכים
    'disease',        -- מחלה (כלי דם, סוכרת, סרטן, CRPS, חיידק טורף)
    'birth_other'     -- מלידה / רפואי - אחר
);

CREATE TYPE insuring_entity AS ENUM (
    'mod',            -- משרד הביטחון (אגף השיקום)
    'ni_terror',      -- ביטוח לאומי - נפגעי איבה
    'ni_work',        -- ביטוח לאומי - נפגעי עבודה
    'ni_general',     -- ביטוח לאומי - נכות כללית
    'moh',            -- משרד הבריאות
    'private'         -- חברות ביטוח פרטיות
);

CREATE TYPE limb_type AS ENUM ('arm', 'leg');
CREATE TYPE side_type AS ENUM ('right', 'left', 'both');

CREATE TYPE amputation_level AS ENUM (
    -- Arm levels
    'fingers', 'hand', 'below_elbow', 'above_elbow', 'shoulder',
    -- Leg levels
    'foot', 'below_knee', 'through_knee', 'above_knee', 'pelvis'
);

CREATE TYPE prosthetic_status AS ENUM (
    'yes',      -- כן
    'no',       -- לא
    'not_yet'   -- טרם התאמנתי
);

CREATE TYPE education_level AS ENUM (
    'not_relevant', 'below_high_school', 'high_school', 'certificate', 'degree'
);

CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');

CREATE TYPE child_age_group AS ENUM (
    'under_18', 
    '18_to_24', -- בשירות צבאי/לאומי
    'over_24'
);


-- ==========================================
-- 2. CORE TABLES (Users and Rights)
-- ==========================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    
    -- 1 & 2. Cause and Insurer
    cause amputation_cause,
    insurer insuring_entity,
    
    -- 4. Disability Percentage Details
    base_disability_percentage INT CHECK (base_disability_percentage >= 0 AND base_disability_percentage <= 100),
    weighted_disability_percentage INT CHECK (weighted_disability_percentage >= 0 AND weighted_disability_percentage <= 100),
    is_dominant_hand_amputated BOOLEAN DEFAULT FALSE,
    has_phantom_pain BOOLEAN DEFAULT FALSE,
    has_crps BOOLEAN DEFAULT FALSE,

    -- 5. Prosthetic Status
    prosthetic prosthetic_status,
    
    -- 6. Education
    education education_level,
    
    -- 7. Gender
    gender gender_type,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. User Amputations (One user can have multiple amputations)
CREATE TABLE user_amputations (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    limb limb_type NOT NULL,
    side side_type NOT NULL,
    level amputation_level NOT NULL,
    UNIQUE(user_id, limb, side, level)
);

-- 8. User Children (One user can have multiple age groups of children)
CREATE TABLE user_children (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    age_group child_age_group NOT NULL,
    children_count INT DEFAULT 1 CHECK (children_count > 0),
    UNIQUE(user_id, age_group)
);

-- The Rights Catalogue
CREATE TABLE rights (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    provider_authority VARCHAR(255) NOT NULL,
    link_to_source VARCHAR(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ==========================================
-- 3. ELIGIBILITY RULES (Mapping Rights to Conditions)
-- ==========================================
-- By default, if a mapping table has NO records for a specific right_id, 
-- it means that right has NO RESTRICTIONS on that axis (applies to everyone).
-- If records exist, the user must match AT LEAST ONE of the records (OR logic within the table).
-- To get a right, the user must satisfy ALL tables (AND logic across tables).

-- Filter by Cause (e.g., only for 'army' or 'terror')
CREATE TABLE right_eligibility_causes (
    right_id INT REFERENCES rights(id) ON DELETE CASCADE,
    required_cause amputation_cause NOT NULL,
    PRIMARY KEY (right_id, required_cause)
);

-- Filter by Insurer (e.g., only for Ministry of Defense)
CREATE TABLE right_eligibility_insurers (
    right_id INT REFERENCES rights(id) ON DELETE CASCADE,
    required_insurer insuring_entity NOT NULL,
    PRIMARY KEY (right_id, required_insurer)
);

-- Filter by Amputation specifics
-- Example 1: Right targets ANY Right Arm amputee -> target_limb='arm', target_side='right', target_level=NULL
-- Example 2: Right targets ONLY Above Knee amputees -> target_limb='leg', target_side=NULL, target_level='above_knee'
CREATE TABLE right_eligibility_amputations (
    id SERIAL PRIMARY KEY,
    right_id INT REFERENCES rights(id) ON DELETE CASCADE,
    target_limb limb_type,      -- if NULL, applies to any limb
    target_side side_type,      -- if NULL, applies to any side
    target_level amputation_level -- if NULL, applies to any level
);

-- General Scalar Conditions (Disability %, Prosthetics, Education, Children)
CREATE TABLE right_eligibility_conditions (
    right_id INT PRIMARY KEY REFERENCES rights(id) ON DELETE CASCADE,
    
    min_disability_percentage INT DEFAULT 0,
    max_disability_percentage INT DEFAULT 100,
    
    requires_dominant_hand_amputated BOOLEAN, -- if TRUE, user must have dominant hand amputated
    
    required_prosthetic_status prosthetic_status, -- if NOT NULL, user must match this status
    
    requires_children_under_18 BOOLEAN, -- if TRUE, user must have >0 children under 18
    
    required_education education_level, -- if NOT NULL, user must match this education level
    
    required_gender gender_type -- if NOT NULL, user must match this gender
);


-- ==========================================
-- 4. VIEW: USER ELIGIBLE RIGHTS
-- ==========================================
-- This view acts as the "Rules Engine". It joins Users and Rights, ensuring the user
-- passes all defined eligibility criteria. 

CREATE OR REPLACE VIEW user_eligible_rights AS
SELECT u.id AS user_id, r.id AS right_id, r.title, r.provider_authority
FROM users u
CROSS JOIN rights r

-- 1. Check Causes (If right has cause filters, user must match one)
LEFT JOIN right_eligibility_causes rec ON rec.right_id = r.id
-- 2. Check Insurers
LEFT JOIN right_eligibility_insurers rei ON rei.right_id = r.id
-- 3. Check General Conditions
LEFT JOIN right_eligibility_conditions cond ON cond.right_id = r.id

WHERE 
    -- Cause Check
    (rec.right_id IS NULL OR rec.required_cause = u.cause)
    
    -- Insurer Check
    AND (rei.right_id IS NULL OR rei.required_insurer = u.insurer)
    
    -- Disability % Check
    AND (cond.right_id IS NULL OR (u.weighted_disability_percentage >= cond.min_disability_percentage AND u.weighted_disability_percentage <= cond.max_disability_percentage))
    
    -- Dominant Hand Check
    AND (cond.requires_dominant_hand_amputated IS NULL OR cond.requires_dominant_hand_amputated = FALSE OR u.is_dominant_hand_amputated = TRUE)
    
    -- Prosthetic Check
    AND (cond.required_prosthetic_status IS NULL OR cond.required_prosthetic_status = u.prosthetic)
    
    -- Gender Check
    AND (cond.required_gender IS NULL OR cond.required_gender = u.gender)
    
    -- Education Check
    AND (cond.required_education IS NULL OR cond.required_education = u.education)

    -- Children Check (Subquery to check if user has under 18 children)
    AND (
        cond.requires_children_under_18 IS NULL 
        OR cond.requires_children_under_18 = FALSE 
        OR EXISTS (
            SELECT 1 FROM user_children uc 
            WHERE uc.user_id = u.id AND uc.age_group = 'under_18'
        )
    )

    -- Amputation Specifics Check
    -- If the right has amputation rules, the user must have AT LEAST ONE amputation that satisfies the rule
    AND (
        NOT EXISTS (SELECT 1 FROM right_eligibility_amputations rea WHERE rea.right_id = r.id)
        OR EXISTS (
            SELECT 1 FROM right_eligibility_amputations rea
            JOIN user_amputations ua ON ua.user_id = u.id
            WHERE rea.right_id = r.id
              AND (rea.target_limb IS NULL OR rea.target_limb = ua.limb)
              AND (rea.target_side IS NULL OR rea.target_side = ua.side)
              AND (rea.target_level IS NULL OR rea.target_level = ua.level)
        )
    );
