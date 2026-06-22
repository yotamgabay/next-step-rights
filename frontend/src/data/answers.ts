/** Curated FAQ used for chat suggestion chips. The backend owns the matching. */
export interface QuickAnswer {
  readonly q: string;
}

export const quickQuestions: readonly QuickAnswer[] = [
  { q: 'מהי דרגת הנכות שמגיעה לי?' },
  { q: 'איך מגישים בקשה לפרוטזה?' },
  { q: 'אילו קצבאות מגיעות לי מביטוח לאומי?' },
  { q: 'איך מקבלים תו חניית נכה?' },
  { q: 'מה ההבדל בין נכות מעבודה לנכות כללית?' },
];

export const CHAT_GREETING =
  'שלום, אני העוזר הדיגיטלי של "הצעד הבא". אפשר לשאול אותי כל שאלה על הזכויות שלך, או לבחור אחד הנושאים הנפוצים למטה. במה אוכל לעזור?';
