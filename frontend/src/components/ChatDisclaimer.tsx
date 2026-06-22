import type { JSX } from 'react';
import { colors } from '../theme';

/**
 * Privacy + accuracy notice shown wherever the chatbot is used.
 * Kept as a single component so the wording stays consistent everywhere.
 */
export function ChatDisclaimer({ style }: { style?: React.CSSProperties }): JSX.Element {
  return (
    <p
      style={{
        fontSize: 13,
        color: colors.textFaint,
        textAlign: 'center',
        lineHeight: 1.5,
        margin: '10px 0 0',
        ...style,
      }}
    >
      אין לשתף פרטים מזהים או מידע רגיש.
      <br />
      הצ'אט יכול לטעות. 'הצעד הבא' לא אחראי לנכונות התשובות.
    </p>
  );
}
