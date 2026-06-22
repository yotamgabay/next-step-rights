import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../theme';
import { GoogleIcon } from './icons';
import { Logo } from './Logo';

interface AuthShellProps {
  maxWidth: number;
  children: React.ReactNode;
}

/** Full-page wrapper for the auth screens: back-to-site link + centered logo. */
export function AuthShell({ maxWidth, children }: AuthShellProps): JSX.Element {
  const navigate = useNavigate();
  return (
    <div
      dir="rtl"
      style={{
        minHeight: '100vh',
        background: colors.sectionBg,
        padding: '28px 20px 48px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth, marginBottom: 6 }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: 'none',
            color: colors.headerBlue,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            padding: '8px 0',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          ‹ חזרה לאתר
        </button>
      </div>
      <button
        onClick={() => navigate('/')}
        aria-label="הצעד הבא - לדף הבית"
        style={{ background: 'none', border: 'none', cursor: 'pointer', margin: '6px 0 24px' }}
      >
        <Logo height={52} />
      </button>
      <main style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {children}
      </main>
    </div>
  );
}

export const authCardStyle: React.CSSProperties = {
  width: '100%',
  background: colors.white,
  border: `1px solid ${colors.border}`,
  borderRadius: 16,
  padding: '34px 30px',
  boxShadow: '0 10px 30px rgba(13,61,94,.08)',
};

interface OAuthButtonsProps {
  googleLabel: string;
  onGoogle: () => void;
}

export function OAuthButtons({
  googleLabel,
  onGoogle,
}: OAuthButtonsProps): JSX.Element {
  const base: React.CSSProperties = {
    width: '100%',
    height: 56,
    border: `1.5px solid ${colors.border}`,
    borderRadius: 28,
    background: colors.white,
    color: colors.text,
    fontSize: 17,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  };
  return (
    <>
      <button onClick={onGoogle} style={base}>
        <GoogleIcon size={22} />
        {googleLabel}
      </button>
    </>
  );
}

export function Divider({ label }: { label: string }): JSX.Element {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '24px 0' }}>
      <span style={{ flex: 1, height: 1, background: colors.border }} />
      <span style={{ fontSize: 15, color: colors.textFaint }}>{label}</span>
      <span style={{ flex: 1, height: 1, background: colors.border }} />
    </div>
  );
}
