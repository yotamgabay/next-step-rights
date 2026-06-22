import { topics } from '../data/topics';
import type { CauseId, TopicId, WizardAnswers, WizardStepId } from '../types';

export interface StepOption {
  readonly key: string;
  readonly label: string;
  readonly desc?: string;
}

export interface StepDefinition {
  readonly title: string;
  readonly help: string;
  readonly skippable?: boolean;
  readonly options: readonly StepOption[];
}

export const limbLabels: Record<'leg' | 'hand' | 'multi', string> = {
  leg: 'רגל',
  hand: 'יד',
  multi: 'כמה גפיים',
};

export const stepShortLabels: Record<WizardStepId, string> = {
  limb: 'גפה',
  level: 'גובה הקטיעה',
  cause: 'רקע הקטיעה',
  time: 'ותק הקטיעה',
  prosthesis: 'פרוטזה ותפקוד',
};

/** The ordered step list — `level` only appears for a single leg/hand. */
export function wizardSteps(answers: WizardAnswers): WizardStepId[] {
  const steps: WizardStepId[] = ['limb'];
  if (answers.limb === 'leg' || answers.limb === 'hand') steps.push('level');
  steps.push('cause', 'time', 'prosthesis');
  return steps;
}

export function stepDefinition(stepId: WizardStepId, answers: WizardAnswers): StepDefinition {
  switch (stepId) {
    case 'limb':
      return {
        title: 'איזו גפה נקטעה?',
        help: 'נתחיל מהבסיס — זה יקבע את שאר השאלות.',
        options: [
          { key: 'leg', label: 'רגל', desc: 'קטיעה של גפה תחתונה' },
          { key: 'hand', label: 'יד', desc: 'קטיעה של גפה עליונה' },
          { key: 'multi', label: 'כמה גפיים', desc: 'קטיעה מרובת גפיים' },
        ],
      };
    case 'level':
      return answers.limb === 'hand'
        ? {
            title: 'מה גובה הקטיעה?',
            help: 'ביחס למרפק — זה משפיע על התפקוד ועל סוג הפרוטזה.',
            options: [
              { key: 'aboveElbow', label: 'מעל המרפק' },
              { key: 'belowElbow', label: 'מתחת למרפק' },
            ],
          }
        : {
            title: 'מה גובה הקטיעה?',
            help: 'ביחס לברך — זה משפיע על התפקוד ועל סוג הפרוטזה.',
            options: [
              { key: 'aboveKnee', label: 'מעל הברך' },
              { key: 'belowKnee', label: 'מתחת לברך' },
            ],
          };
    case 'cause':
      return {
        title: 'מה הרקע לקטיעה?',
        help: 'זהו הפרט שקובע מי הגורם המטפל ומה מגיע לך. אפשר לדלג אם לא נוח לפרט.',
        skippable: true,
        options: [
          { key: 'military', label: 'שירות צבאי / פעולת איבה', desc: 'משרד הביטחון — אגף השיקום' },
          { key: 'medical', label: 'רקע רפואי', desc: 'קופת החולים ומשרד הבריאות' },
          { key: 'work', label: 'תאונת עבודה', desc: 'המוסד לביטוח לאומי' },
          { key: 'road', label: 'תאונת דרכים', desc: 'חברת הביטוח (חוק הפלת״ד)' },
        ],
      };
    case 'time':
      return {
        title: 'כמה זמן עבר מאז הקטיעה?',
        help: 'השלב שבו את/ה נמצא/ת משפיע על מה שרלוונטי עכשיו.',
        options: [
          { key: 'recent', label: 'עד שנה', desc: 'קטיעה לאחרונה' },
          { key: 'mid', label: 'בין שנה לשנתיים' },
          { key: 'veteran', label: 'מעל שנתיים' },
        ],
      };
    case 'prosthesis':
      return {
        title: 'מה מצב הפרוטזה והתפקוד?',
        help: 'כדי להתאים את הזכויות לרמת הניידות שלך. אפשר לדלג.',
        skippable: true,
        options: [
          { key: 'none', label: 'אין פרוטזה עדיין', desc: 'טרם הותאמה פרוטזה' },
          { key: 'initial', label: 'פרוטזה ראשונית', desc: 'בשלב ההתאמה הראשוני' },
          { key: 'advanced', label: 'פרוטזה מתקדמת', desc: 'הליכה עם פרוטזה קבועה' },
          { key: 'wheelchair', label: 'כיסא גלגלים', desc: 'ניידות בעיקר בכיסא גלגלים' },
        ],
      };
    default:
      return { title: '', help: '', options: [] };
  }
}

export function labelFor(stepId: WizardStepId, key: string, answers: WizardAnswers): string {
  const option = stepDefinition(stepId, answers).options.find((o) => o.key === key);
  return option ? option.label : '';
}

export interface Authority {
  readonly name: string;
  readonly topic: TopicId | null;
}

export function authorityFor(cause: CauseId | ''): Authority {
  const map: Record<CauseId, Authority> = {
    military: { name: 'משרד הביטחון — אגף השיקום', topic: 'military' },
    medical: { name: 'קופת החולים ומשרד הבריאות', topic: 'medical' },
    work: { name: 'המוסד לביטוח לאומי', topic: 'work' },
    road: { name: 'חברת הביטוח של הרכב (חוק הפלת״ד)', topic: 'road' },
  };
  if (cause === '') return { name: 'נזהה יחד את הגורם המטפל', topic: null };
  return map[cause];
}

const timeNotes: Record<string, string> = {
  recent: 'מכיוון שהקטיעה אירעה לאחרונה, הדגש כעת הוא על הכרה בזכאות והתאמת פרוטזה ראשונית.',
  mid: 'בשלב הזה רלוונטי להשלים התאמות, טיפולי שיקום ובחינת שדרוג פרוטזה.',
  veteran: 'אחרי תקופה, הדגש עובר להחלפות פרוטזה תקופתיות, לתחזוקה ולשמירה על הזכויות שנצברו.',
};

const prosthesisNotes: Record<string, string> = {
  none: 'מומלץ להתחיל בתהליך התאמת פרוטזה ראשונית מול הגורם המטפל.',
  initial: 'בשלב הפרוטזה הראשונית חשוב לוודא ליווי שיקומי והתאמות מתאימות.',
  advanced: 'עם פרוטזה מתקדמת, כדאי לשים לב למועדי ההחלפה והתחזוקה שמגיעים לך.',
  wheelchair: 'גם בניידות בכיסא גלגלים מגיעים לך אביזרי ניידות, נגישות והתאמות דיור.',
};

export function timeNote(time: string): string {
  return timeNotes[time] ?? '';
}

export function prosthesisNote(prosthesis: string): string {
  return prosthesisNotes[prosthesis] ?? '';
}

export interface SummaryRight {
  readonly h: string;
  readonly items: readonly string[];
}

/** The rights list shown in the wizard summary, derived from the cause. */
export function summaryRights(cause: CauseId | ''): SummaryRight[] {
  const authority = authorityFor(cause);
  if (authority.topic) {
    return topics[authority.topic].sections.map((s) => ({ h: s.h, items: s.items.slice(0, 3) }));
  }
  return [topics.medrights, topics.financial, topics.mobility].map((t) => ({
    h: t.title,
    items: [t.lead],
  }));
}

export function profileLine(answers: WizardAnswers): string {
  return [
    answers.limb ? limbLabels[answers.limb] : '',
    answers.level ? labelFor('level', answers.level, answers) : '',
    answers.time ? labelFor('time', answers.time, answers) : '',
  ]
    .filter(Boolean)
    .join(' · ');
}

export function summaryNote(answers: WizardAnswers): string {
  return [timeNote(answers.time), prosthesisNote(answers.prosthesis)].filter(Boolean).join(' ');
}

export const emptyAnswers: WizardAnswers = {
  limb: '',
  level: '',
  cause: '',
  time: '',
  prosthesis: '',
};
