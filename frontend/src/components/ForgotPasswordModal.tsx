import { useState, useEffect, useCallback, useRef, type JSX } from 'react';
import { supabase } from '../api/supabase';
import { colors } from '../theme';
import { CloseIcon } from './icons';
import { TextField, PrimaryButton } from './Field';

type ModalStep = 'form' | 'sending' | 'sent';

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({ open, onClose }: ForgotPasswordModalProps): JSX.Element | null {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<ModalStep>('form');

  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Reset state and manage focus when modal opens/closes
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement as HTMLElement;
      setEmail('');
      setError('');
      setStep('form');

      // Focus first element in modal when opened
      setTimeout(() => {
        if (modalRef.current) {
          const focusable = modalRef.current.querySelector<HTMLElement>('button, input, [tabindex]:not([tabindex="-1"])');
          if (focusable) focusable.focus();
        }
      }, 10);
    } else {
      if (triggerRef.current) {
        triggerRef.current.focus();
      }
    }
  }, [open]);

  // Trap focus within the modal using Tab / Shift+Tab
  useEffect(() => {
    if (!open) return;
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return;

      const focusableElements = Array.from(modalRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ));
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleTab);
    return () => window.removeEventListener('keydown', handleTab);
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const handleSubmit = useCallback(async () => {
    // Validate email
    const trimmed = email.trim();
    if (!trimmed) {
      setError('יש להזין כתובת אימייל');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
      setError('כתובת אימייל לא תקינה');
      return;
    }

    setError('');
    setStep('sending');

    try {
      const { error: supaError } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (supaError) throw supaError;
      setStep('sent');
    } catch {
      setStep('form');
      setError('שליחת הקישור נכשלה, נסה/י שוב');
    }
  }, [email]);

  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      dir="rtl"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="איפוס סיסמה"
    >
      <div className="modal-card" ref={modalRef}>
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="סגירה"
          style={{
            position: 'absolute',
            top: 14,
            left: 14,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 6,
            borderRadius: 8,
            color: colors.textFaint,
            transition: 'color 0.15s, background 0.15s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget.style.color = colors.text);
            (e.currentTarget.style.background = colors.sectionBg);
          }}
          onMouseLeave={(e) => {
            (e.currentTarget.style.color = colors.textFaint);
            (e.currentTarget.style.background = 'none');
          }}
        >
          <CloseIcon size={20} />
        </button>

        {step === 'sent' ? (
          /* ──── Success state ──── */
          <div style={{ textAlign: 'center', padding: '12px 0 4px' }}>
            {/* Animated checkmark circle */}
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${colors.green}, #3aad4e)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 6px 20px rgba(46,139,63,0.25)',
              }}
            >
              <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <h2
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: colors.darkBlue,
                margin: '0 0 10px',
              }}
            >
              הקישור נשלח בהצלחה!
            </h2>
            <p
              style={{
                fontSize: 16,
                color: colors.textMuted,
                margin: '0 0 8px',
                lineHeight: 1.6,
              }}
            >
              שלחנו קישור לאיפוס הסיסמה לכתובת:
            </p>
            <p
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: colors.primaryBlue,
                margin: '0 0 22px',
                direction: 'ltr',
                wordBreak: 'break-all',
              }}
            >
              {email.trim()}
            </p>
            <p
              style={{
                fontSize: 14,
                color: colors.textFaint,
                margin: '0 0 24px',
                lineHeight: 1.5,
              }}
            >
              אם לא קיבלת את המייל, בדוק/י את תיקיית הספאם.
            </p>

            <PrimaryButton onClick={onClose}>
              הבנתי, תודה
            </PrimaryButton>
          </div>
        ) : (
          /* ──── Email form state ──── */
          <>
            {/* Header icon */}
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: colors.blueTint,
                border: `1.5px solid ${colors.blueTintBorder}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px',
              }}
            >
              <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={colors.headerBlue} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                <circle cx="12" cy="16.5" r="1" />
              </svg>
            </div>

            <h2
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: colors.darkBlue,
                margin: '0 0 8px',
                textAlign: 'center',
              }}
            >
              שכחת סיסמה?
            </h2>
            <p
              style={{
                fontSize: 16,
                color: colors.textMuted,
                margin: '0 0 24px',
                textAlign: 'center',
                lineHeight: 1.5,
              }}
            >
              הזן/י את כתובת האימייל שלך ונשלח לך קישור לאיפוס הסיסמה.
            </p>

            <div style={{ marginBottom: 20 }}>
              <TextField
                label="כתובת אימייל"
                type="email"
                ltr
                value={email}
                onChange={(v) => {
                  setEmail(v);
                  if (error) setError('');
                }}
                error={error || undefined}
              />
            </div>

            <PrimaryButton
              onClick={handleSubmit}
              busy={step === 'sending'}
            >
              {step === 'sending' ? 'שולח…' : 'שלח קישור לאיפוס'}
            </PrimaryButton>

            <button
              onClick={onClose}
              style={{
                display: 'block',
                width: '100%',
                marginTop: 14,
                background: 'none',
                border: 'none',
                color: colors.textMuted,
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                padding: '10px 0',
                borderRadius: 8,
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = colors.headerBlue)}
              onMouseLeave={(e) => (e.currentTarget.style.color = colors.textMuted)}
            >
              חזרה להתחברות
            </button>
          </>
        )}
      </div>
    </div>
  );
}
