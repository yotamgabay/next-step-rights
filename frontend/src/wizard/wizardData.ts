import { topics } from '../data/topics';
import type { AmputationLevel, DbCause, LimbSlot, TopicId, WizardAnswers } from '../types';

export type StepKind = 'single' | 'multi' | 'number';

export interface StepOption {
  readonly key: string;
  readonly label: string;
  readonly desc?: string;
}

export interface StepDef {
  readonly id: string;
  readonly kind: StepKind;
  readonly title: string;
  readonly help: string;
  readonly skippable: boolean;
  /** Options for single/multi steps; empty for number steps. */
  readonly options: readonly StepOption[];
}

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

export const limbSlotLabels: Record<LimbSlot, string> = {
  arm_right: 'יד ימין',
  arm_left: 'יד שמאל',
  leg_right: 'רגל ימין',
  leg_left: 'רגל שמאל',
};

export const ALL_LIMB_SLOTS: readonly LimbSlot[] = ['arm_right', 'arm_left', 'leg_right', 'leg_left'];

const armLevelOptions: readonly StepOption[] = [
  { key: 'fingers', label: 'אצבעות' },
  { key: 'hand', label: 'כף יד' },
  { key: 'below_elbow', label: 'מתחת למרפק' },
  { key: 'above_elbow', label: 'מעל המרפק' },
  { key: 'shoulder', label: 'עד הכתף' },
];

const legLevelOptions: readonly StepOption[] = [
  { key: 'foot', label: 'כף רגל' },
  { key: 'below_knee', label: 'מתחת לברך' },
  { key: 'through_knee', label: 'דרך הברך' },
  { key: 'above_knee', label: 'מעל הברך' },
  { key: 'pelvis', label: 'אגן' },
];

const levelLabelMap: Record<AmputationLevel, string> = {
  fingers: 'אצבעות',
  hand: 'כף יד',
  below_elbow: 'מתחת למרפק',
  above_elbow: 'מעל המרפק',
  shoulder: 'עד הכתף',
  foot: 'כף רגל',
  below_knee: 'מתחת לברך',
  through_knee: 'דרך הברך',
  above_knee: 'מעל הברך',
  pelvis: 'אגן',
};

const causeOptions: readonly StepOption[] = [
  { key: 'army', label: 'תאונה בצבא', desc: 'במהלך שירות צבאי' },
  { key: 'terror', label: 'פעולות איבה' },
  { key: 'work', label: 'תאונה במקום העבודה' },
  { key: 'road_accident', label: 'תאונת דרכים', desc: 'חוק הפלת״ד' },
  { key: 'disease', label: 'מחלה', desc: 'כלי דם, סוכרת, סרטן, CRPS, זיהום' },
  { key: 'birth_other', label: 'מלידה / רפואי - אחר' },
];

const insurerOptions: readonly StepOption[] = [
  { key: 'mod', label: 'משרד הביטחון', desc: 'אגף השיקום' },
  { key: 'ni', label: 'ביטוח לאומי', desc: 'נפגעי איבה / עבודה / נכות כללית' },
  { key: 'moh', label: 'משרד הבריאות' },
  { key: 'private', label: 'חברת ביטוח פרטית', desc: 'פלת״ד וכדומה' },
];

const prostheticOptions: readonly StepOption[] = [
  { key: 'yes', label: 'כן', desc: 'מסתייע/ת בתותבת' },
  { key: 'no', label: 'לא', desc: 'כיסא גלגלים / אביזרי הליכה' },
  { key: 'not_yet', label: 'טרם התאמתי', desc: 'בשלב השיקום הראשוני' },
];

const educationOptions: readonly StepOption[] = [
  { key: 'not_relevant', label: 'לא רלוונטי' },
  { key: 'below_high_school', label: 'נמוכה מתיכונית' },
  { key: 'high_school', label: 'תיכונית / בגרות' },
  { key: 'certificate', label: 'קורס / תעודה מקצועית' },
  { key: 'degree', label: 'תואר אקדמי' },
];

const genderOptions: readonly StepOption[] = [
  { key: 'male', label: 'גבר' },
  { key: 'female', label: 'אישה' },
  { key: 'other', label: 'אחר' },
];

const yesNoOptions: readonly StepOption[] = [
  { key: 'yes', label: 'כן' },
  { key: 'no', label: 'לא' },
];

const limbOptions: readonly StepOption[] = ALL_LIMB_SLOTS.map((slot) => ({
  key: slot,
  label: limbSlotLabels[slot],
}));

const childAgeOptions: readonly StepOption[] = [
  { key: 'under_18', label: 'מתחת לגיל 18' },
  { key: '18_to_24', label: 'גיל 18–24', desc: 'בשירות צבאי / לאומי' },
  { key: 'over_24', label: 'מעל גיל 24' },
];

function isArmSlot(slot: LimbSlot): boolean {
  return slot === 'arm_right' || slot === 'arm_left';
}

export function levelOptionsForSlot(slot: LimbSlot): readonly StepOption[] {
  return isArmSlot(slot) ? armLevelOptions : legLevelOptions;
}

export function levelLabel(level: AmputationLevel): string {
  return levelLabelMap[level];
}

// ---------------------------------------------------------------------------
// Step list (ordered, conditional)
// ---------------------------------------------------------------------------

function selectedSlots(answers: WizardAnswers): LimbSlot[] {
  return ALL_LIMB_SLOTS.filter((slot) => answers.limbs.includes(slot));
}

/** Builds the ordered, conditional list of steps for the current answers. */
export function buildSteps(answers: WizardAnswers): StepDef[] {
  const steps: StepDef[] = [
    { id: 'cause', kind: 'single', title: 'מה הסיבה לקטיעה?', help: 'מקור הפגיעה קובע את הגורם המטפל ואת סוג התביעה.', skippable: false, options: causeOptions },
    { id: 'insurer', kind: 'single', title: 'מי הגורם המבטח / המפצה?', help: 'הגוף שמולו מתנהלת התביעה ומשלמים ההטבות.', skippable: false, options: insurerOptions },
    { id: 'limbs', kind: 'multi', title: 'אילו גפיים נפגעו?', help: 'אפשר לבחור יותר מאחת - נמשיך לפרט כל אחת.', skippable: false, options: limbOptions },
  ];

  for (const slot of selectedSlots(answers)) {
    steps.push({
      id: `level:${slot}`,
      kind: 'single',
      title: `מה גובה הקטיעה - ${limbSlotLabels[slot]}?`,
      help: 'בחר/י את הרמה המתאימה.',
      skippable: false,
      options: levelOptionsForSlot(slot),
    });
  }

  steps.push({
    id: 'disabilityPct',
    kind: 'number',
    title: 'מה אחוז הנכות שנקבע לך?',
    help: 'אם ידוע. אפשר לדלג אם טרם נקבע.',
    skippable: true,
    options: [],
  });

  if (selectedSlots(answers).some(isArmSlot)) {
    steps.push({ id: 'dominantHand', kind: 'single', title: 'האם נפגעה היד הדומיננטית?', help: 'משפיע על שקלול אחוזי הנכות.', skippable: false, options: yesNoOptions });
  }

  steps.push(
    { id: 'phantomPain', kind: 'single', title: 'האם יש כאבי פנטום?', help: 'מקרה קצה שמשפיע על הזכאות.', skippable: false, options: yesNoOptions },
    { id: 'crps', kind: 'single', title: 'האם אובחן CRPS?', help: 'תסמונת כאב מורכבת - מקרה קצה רפואי.', skippable: false, options: yesNoOptions },
    { id: 'prosthetic', kind: 'single', title: 'האם את/ה מסתייע/ת בתותבת?', help: 'קובע אילו מסלולי אביזרים ומענקים רלוונטיים.', skippable: false, options: prostheticOptions },
    { id: 'education', kind: 'single', title: 'מה רמת ההשכלה?', help: 'משפיע על אפיקי שיקום מקצועי והכשרות.', skippable: false, options: educationOptions },
    { id: 'gender', kind: 'single', title: 'מהו המגדר?', help: '', skippable: false, options: genderOptions },
    { id: 'hasChildren', kind: 'single', title: 'האם יש לך ילדים?', help: 'רלוונטי לתוספות תלויים ומענקים חודשיים.', skippable: false, options: yesNoOptions },
  );

  if (answers.hasChildren === 'yes') {
    steps.push({ id: 'childAgeGroups', kind: 'multi', title: 'מה גילאי הילדים?', help: 'אפשר לבחור כמה קבוצות גיל.', skippable: false, options: childAgeOptions });
  }

  return steps;
}

// ---------------------------------------------------------------------------
// Value access by step id
// ---------------------------------------------------------------------------

const LEVEL_PREFIX = 'level:';

export function slotOfLevelStep(id: string): LimbSlot | null {
  if (!id.startsWith(LEVEL_PREFIX)) return null;
  return id.slice(LEVEL_PREFIX.length) as LimbSlot;
}

/** Current value of a single/number step ('' when unset). */
export function singleValue(answers: WizardAnswers, id: string): string {
  const slot = slotOfLevelStep(id);
  if (slot) return answers.levels[slot] ?? '';
  if (id === 'disabilityPct') return answers.disabilityPct;
  const value = (answers as unknown as Record<string, unknown>)[id];
  return typeof value === 'string' ? value : '';
}

/** Current selection of a multi step. */
export function multiValue(answers: WizardAnswers, id: string): string[] {
  if (id === 'limbs') return answers.limbs;
  if (id === 'childAgeGroups') return answers.childAgeGroups;
  return [];
}

/** Whether a step has a value sufficient to advance. */
export function isStepComplete(answers: WizardAnswers, step: StepDef): boolean {
  if (step.skippable) return true;
  if (step.kind === 'multi') return multiValue(answers, step.id).length > 0;
  return singleValue(answers, step.id) !== '';
}

// ---------------------------------------------------------------------------
// Cause → authority / topic helpers (for the summary + chat hand-off)
// ---------------------------------------------------------------------------

const causeToTopicMap: Record<DbCause, TopicId> = {
  army: 'military',
  terror: 'military',
  work: 'work',
  road_accident: 'road',
  disease: 'medical',
  birth_other: 'medical',
};

export function causeToTopic(cause: DbCause | ''): TopicId | null {
  return cause ? causeToTopicMap[cause] : null;
}

const authorityNameByCause: Record<DbCause, string> = {
  army: 'משרד הביטחון - אגף השיקום',
  terror: 'הרשות לנפגעי פעולות איבה',
  work: 'המוסד לביטוח לאומי',
  road_accident: 'חברת הביטוח של הרכב (חוק הפלת״ד)',
  disease: 'קופת החולים ומשרד הבריאות',
  birth_other: 'נזהה יחד את הגורם המטפל',
};

export function authorityName(cause: string | null | undefined): string {
  if (cause && cause in authorityNameByCause) {
    return authorityNameByCause[cause as DbCause];
  }
  return 'נזהה יחד את הגורם המטפל';
}

export interface SummaryRight {
  readonly h: string;
  readonly items: readonly string[];
}

export function summaryRights(cause: DbCause | ''): SummaryRight[] {
  const topic = causeToTopic(cause);
  if (topic) {
    return topics[topic].sections.map((s) => ({ h: s.h, items: s.items.slice(0, 3) }));
  }
  return [topics.medrights, topics.financial, topics.mobility].map((t) => ({
    h: t.title,
    items: [t.lead],
  }));
}

/** Short human-readable summary of the selected amputations. */
export function profileLine(answers: WizardAnswers): string {
  return selectedSlots(answers)
    .map((slot) => {
      const level = answers.levels[slot];
      const levelText = level ? ` - ${levelLabel(level)}` : '';
      return `${limbSlotLabels[slot]}${levelText}`;
    })
    .join(' · ');
}

export const emptyAnswers: WizardAnswers = {
  cause: '',
  insurer: '',
  limbs: [],
  levels: {},
  disabilityPct: '',
  dominantHand: '',
  phantomPain: '',
  crps: '',
  prosthetic: '',
  education: '',
  gender: '',
  hasChildren: '',
  childAgeGroups: [],
};
