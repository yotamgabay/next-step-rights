-- ==========================================
-- Next Step Rights - Seed Data for Rights
-- ==========================================

-- 1. Insert Rights
INSERT INTO public.rights (id, title, description, provider_authority) VALUES
('11111111-1111-1111-1111-111111111111', 'דמי פגיעה', 'תשלום עבור אובדן הכנסה לעד 3 חודשים לאחר פגיעה בעבודה, עבור תקופה שבה הנפגע אינו מסוגל לעבוד.', 'המוסד לביטוח לאומי'),
('22222222-2222-2222-2222-222222222222', 'קצבת נכות מעבודה / מענק נכות מעבודה', 'קצבה חודשית או מענק חד פעמי לנפגע עבודה שנותר עם נכות קבועה של 9% ומעלה.', 'המוסד לביטוח לאומי'),
('33333333-3333-3333-3333-333333333333', 'גמלת סיעוד', 'סיוע כספי או בשירותים לאזרחים ותיקים שהגיעו לגיל פרישה וזקוקים לעזרה בפעולות יומיומיות.', 'המוסד לביטוח לאומי'),
('44444444-4444-4444-4444-444444444444', 'קצבת שירותים מיוחדים (ש.ר.מ)', 'קצבה כספית או עזרה של מטפל לאנשים המתקשים בפעולות היומיום וזקוקים לעזרה או השגחה מתמדת.', 'המוסד לביטוח לאומי'),
('55555555-5555-5555-5555-555555555555', 'זכויות דיור והתאמת נגישות', 'סיוע בהתאמת הבית לנגישות, שכר דירה, וזכאות לדיור ציבורי.', 'משרד הבינוי והשיכון'),
('66666666-6666-6666-6666-666666666666', 'שיקום מקצועי ומימון לימודים', 'חבילת שיקום הכוללת אבחון, מימון לימודים אקדמיים ומקצועיים, וליווי בהשמה לעבודה.', 'המוסד לביטוח לאומי'),
('77777777-7777-7777-7777-777777777777', 'גמלת ניידות ותג נכה', 'סיוע בהוצאות רכב, אביזרי נהיגה, מימון רכב מיוחד, ותג חניה לנכה לבעלי קושי בניידות או קטיעת רגל.', 'משרד הבריאות / משרד האוצר'),
('88888888-8888-8888-8888-888888888888', 'קצבת נכות כללית', 'קצבה חודשית למי שכושר השתכרותו או תפקודו נפגע באופן משמעותי.', 'המוסד לביטוח לאומי'),
('99999999-9999-9999-9999-999999999999', 'תגמול נכות לנפגעי פעולות איבה', 'תגמול חודשי לנפגעי איבה שנותרו עם נכות כתוצאה מהפגיעה.', 'המוסד לביטוח לאומי (אגף נפגעי איבה)'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'זכאות לפרוטזה (תותבת)', 'מימון, התאמה, והחלפה תקופתית של תותבות ידיים ורגליים, כולל רכיבים מכניים וממוחשבים בהתאם לצרכים.', 'משרד הבריאות / קופת חולים / משרד הביטחון'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'קצבת תלות בזולת לילדים (ילד נכה)', 'קצבה חודשית למשפחות עם ילדים בעלי לקות או קושי חמור בתפקוד.', 'המוסד לביטוח לאומי'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'קצבת ניידות לילדים', 'הטבות ניידות לילדים מגיל שנתיים ו-10 חודשים בעלי מוגבלות בניידות או ריתוק לכיסא גלגלים.', 'המוסד לביטוח לאומי'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'מענק לרכישת דירת מגורים (נכות מיוחדת 100%+)', 'מענק משמעותי לרכישת דירת מגורים ראשונה או התאמת דירה חלופית לנכים בעלי דרגת נכות מיוחדת.', 'המוסד לביטוח לאומי / משרד הביטחון'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'טיפולי חמי מרפא', 'מימון שהייה וטיפולים במרחצאות תרמיים למספר ימים מוגדר בשנה לזכאים.', 'אגף השיקום / ביטוח לאומי'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'בדיקות סקר מנהלים תקופתיות', 'בדיקות סקר רפואיות תקופתיות מקיפות לניטור רפואי וגילוי מוקדם של מחלות.', 'אגף השיקום / ביטוח לאומי');


-- 2. Insert Required Causes
INSERT INTO public.right_eligibility_causes (right_id, required_cause) VALUES
('11111111-1111-1111-1111-111111111111', 'work'),
('22222222-2222-2222-2222-222222222222', 'work'),
('99999999-9999-9999-9999-999999999999', 'terror'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'army'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'terror'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'army'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'terror');


-- 3. Insert Required Insurers
INSERT INTO public.right_eligibility_insurers (right_id, required_insurer) VALUES
('11111111-1111-1111-1111-111111111111', 'ni_work'),
('22222222-2222-2222-2222-222222222222', 'ni_work'),
('99999999-9999-9999-9999-999999999999', 'ni_terror');


-- 4. Insert Amputation Targets
INSERT INTO public.right_eligibility_amputations (right_id, target_limb) VALUES
('77777777-7777-7777-7777-777777777777', 'leg'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'leg');


-- 5. Insert Eligibility Conditions
-- We only insert conditions where rules strictly apply. Missing records imply no strict conditions.
INSERT INTO public.right_eligibility_conditions (
  right_id, 
  min_disability_percentage, 
  max_disability_percentage, 
  min_user_age, 
  max_user_age
) VALUES
-- 2: קצבת נכות מעבודה
('22222222-2222-2222-2222-222222222222', 9, 100, NULL, NULL),

-- 3: גמלת סיעוד (Age 67+)
('33333333-3333-3333-3333-333333333333', 0, 100, 67, NULL),

-- 4: ש.ר.מ (Disability 60+, Max Age 67)
('44444444-4444-4444-4444-444444444444', 60, 100, NULL, 67),

-- 6: שיקום מקצועי (Disability 20+, Max Age 67)
('66666666-6666-6666-6666-666666666666', 20, 100, NULL, 67),

-- 7: גמלת ניידות (Disability 40+, Min Age 3)
('77777777-7777-7777-7777-777777777777', 40, 100, 3, NULL),

-- 8: קצבת נכות כללית (Disability 50+)
('88888888-8888-8888-8888-888888888888', 50, 100, NULL, NULL),

-- 9: נפגעי איבה (Disability 10+)
('99999999-9999-9999-9999-999999999999', 10, 100, NULL, NULL),

-- 11: קצבת תלות ילדים (Age 3 - 18)
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 0, 100, 3, 18),

-- 12: קצבת ניידות לילדים (Age 3 - 18)
('cccccccc-cccc-cccc-cccc-cccccccccccc', 0, 100, 3, 18),

-- 13: דיור 100%+ (Disability 100)
('dddddddd-dddd-dddd-dddd-dddddddddddd', 100, 100, NULL, NULL),

-- 14: חמי מרפא (Disability 20+)
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 20, 100, NULL, NULL),

-- 15: סקר מנהלים (Disability 50+)
('ffffffff-ffff-ffff-ffff-ffffffffffff', 50, 100, NULL, NULL);

-- Updating the 11 & 12 conditions to use requires_children_under_18 
UPDATE public.right_eligibility_conditions 
SET requires_children_under_18 = TRUE 
WHERE right_id IN ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cccccccc-cccc-cccc-cccc-cccccccccccc');
