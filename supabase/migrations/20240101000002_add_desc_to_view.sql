-- ==========================================
-- Next Step Rights - Migration to include description in user_eligible_rights view
-- ==========================================

DROP VIEW IF EXISTS public.user_eligible_rights;
CREATE OR REPLACE VIEW public.user_eligible_rights AS
SELECT p.id AS user_id, r.id AS right_id, r.title, r.description, r.provider_authority
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
