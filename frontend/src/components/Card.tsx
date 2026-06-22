import { useState, type JSX } from 'react';
import { colors } from '../theme';

interface CardButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

/**
 * The hover-elevating clickable card used across home and rights screens.
 * Hover styling is handled in JS because the source used inline style-hover.
 */
export function CardButton({ onClick, children }: CardButtonProps): JSX.Element {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      style={{
        textAlign: 'right',
        background: colors.white,
        border: `1px solid ${hover ? colors.primaryBlue : colors.border}`,
        borderRadius: 12,
        padding: 24,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        transition: 'box-shadow .15s, transform .15s, border-color .15s',
        boxShadow: hover ? '0 10px 26px rgba(13,61,94,.12)' : 'none',
        transform: hover ? 'translateY(-3px)' : 'none',
      }}
    >
      {children}
    </button>
  );
}

interface TagProps {
  children: React.ReactNode;
}

export function Tag({ children }: TagProps): JSX.Element {
  return (
    <span
      style={{
        alignSelf: 'flex-start',
        background: colors.blueTint,
        color: colors.headerBlue,
        fontSize: 14,
        fontWeight: 600,
        padding: '5px 12px',
        borderRadius: 16,
      }}
    >
      {children}
    </span>
  );
}

export function DetailsArrow(): JSX.Element {
  return (
    <span style={{ fontSize: 16, fontWeight: 700, color: colors.primaryBlue, marginTop: 2 }}>
      לפרטים ‹
    </span>
  );
}
