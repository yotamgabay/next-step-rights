import { useState, useEffect, useCallback, useRef, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon, CloseIcon } from './icons';
import { colors } from '../theme';
import { Tag } from './Card';

interface DbRight {
  id: string;
  title: string;
  description: string;
  provider_authority: string;
  link_to_source?: string | null;
  eligible?: string;
}

interface RightDetailModalProps {
  right: DbRight | null;
  onClose: () => void;
}

export function RightDetailModal({ right, onClose }: RightDetailModalProps): JSX.Element | null {
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Focus management
  useEffect(() => {
    if (right) {
      triggerRef.current = document.activeElement as HTMLElement;
      setTimeout(() => {
        if (modalRef.current) {
          const focusable = modalRef.current.querySelector<HTMLElement>('button, a, [tabindex]:not([tabindex="-1"])');
          if (focusable) focusable.focus();
        }
      }, 10);
    } else {
      if (triggerRef.current) {
        triggerRef.current.focus();
      }
    }
  }, [right]);

  // Close on Escape
  useEffect(() => {
    if (!right) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [right, onClose]);

  // Focus trap
  useEffect(() => {
    if (!right) return;
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return;
      const focusableElements = Array.from(modalRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ));
      if (focusableElements.length === 0) return;
      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          last?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === last) {
          first?.focus();
          e.preventDefault();
        }
      }
    };
    window.addEventListener('keydown', handleTab);
    return () => window.removeEventListener('keydown', handleTab);
  }, [right]);

  const askAboutRight = useCallback(() => {
    if (!right) return;
    const query = `אני רוצה לדעת יותר על הזכות "${right.title}" מול ${right.provider_authority}. מה התנאים ואיך מגישים בקשה?`;
    onClose();
    navigate('/chat', { state: { query } });
  }, [right, navigate, onClose]);

  if (!right) return null;

  // Split authorities for display
  const authorities = right.provider_authority
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div
      className="modal-overlay"
      dir="rtl"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={right.title}
    >
      <div
        className="modal-card"
        ref={modalRef}
        style={{ maxWidth: 560, padding: 0, overflow: 'hidden' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="סגירה"
          style={{
            position: 'absolute',
            top: 14,
            left: 14,
            zIndex: 2,
            background: 'rgba(255,255,255,.85)',
            border: 'none',
            cursor: 'pointer',
            padding: 6,
            borderRadius: 8,
            color: colors.textFaint,
            transition: 'color 0.15s, background 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = colors.text;
            e.currentTarget.style.background = colors.white;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = colors.textFaint;
            e.currentTarget.style.background = 'rgba(255,255,255,.85)';
          }}
        >
          <CloseIcon size={20} />
        </button>

        {/* Header area — matches old Detail page blue header */}
        <div style={{ background: colors.blueTint, padding: '30px 28px 24px' }}>
          <Tag>{right.provider_authority}</Tag>
          <h2
            style={{
              fontSize: 'clamp(22px,3vw,28px)',
              color: colors.darkBlue,
              fontWeight: 800,
              margin: '14px 0 0',
              lineHeight: 1.25,
            }}
          >
            {right.title}
          </h2>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 28px 28px' }}>
          {/* Description */}
          <p
            style={{
              fontSize: 17,
              color: colors.text,
              lineHeight: 1.7,
              margin: '0 0 20px',
            }}
          >
            {right.description}
          </p>

          {/* Eligible */}
          {right.eligible && (
            <div style={{ marginBottom: 20 }}>
              <strong style={{ color: colors.darkBlue, display: 'block', marginBottom: 6 }}>
                מי זכאי?
              </strong>
              <p style={{ fontSize: 16, color: colors.text, margin: 0, lineHeight: 1.6 }}>
                {right.eligible}
              </p>
            </div>
          )}

          {/* Authority badges */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              marginBottom: 24,
            }}
          >
            {authorities.map((auth) => (
              <div
                key={auth}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: colors.white,
                  border: `1px solid ${colors.blueTintBorder}`,
                  borderRadius: 12,
                  padding: '10px 14px',
                }}
              >
                <CheckCircleIcon size={20} color={colors.green} />
                <span style={{ fontSize: 15, color: colors.text, fontWeight: 600 }}>
                  {auth}
                </span>
              </div>
            ))}
          </div>

          {/* Source link if available */}
          {right.link_to_source && (
            <a
              href={right.link_to_source}
              target="_blank"
              rel="noreferrer noopener"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 15,
                color: colors.primaryBlue,
                fontWeight: 600,
                textDecoration: 'none',
                marginBottom: 20,
              }}
            >
              קישור למקור הרשמי ←
            </a>
          )}

          {/* CTA — ask the assistant */}
          <div
            style={{
              background: colors.headerBlue,
              borderRadius: 14,
              padding: '22px 24px',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontSize: 16,
                color: colors.white,
                fontWeight: 600,
                margin: '0 0 14px',
                lineHeight: 1.5,
              }}
            >
              יש לך שאלה ספציפית על {right.title}?
            </p>
            <button
              onClick={askAboutRight}
              style={{
                height: 48,
                padding: '0 28px',
                border: 'none',
                borderRadius: 24,
                background: colors.orange,
                color: colors.white,
                fontSize: 16,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'transform .15s, box-shadow .15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(240,103,35,.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              שאל/י את העוזר הדיגיטלי
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
