import type { JSX } from 'react';
import { colors } from '../theme';
import logoUrl from '../assets/logo.png';

interface LogoProps {
  height?: number;
  /** Render on a white chip (used on the dark header / footer). */
  onDark?: boolean;
}

/**
 * Wordmark for "הצעד הבא".
 */
export function Logo({ height = 44, onDark = false }: LogoProps): JSX.Element {
  const chip: React.CSSProperties = onDark
    ? { background: colors.white, borderRadius: 8, padding: '5px 12px' }
    : {};
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', ...chip }}>
      <img src={logoUrl} alt="הצעד הבא" height={height} style={{ display: 'block' }} />
    </span>
  );
}
