import { useState, useEffect, useRef, type JSX } from 'react';
import { CloseIcon } from './icons';
import { colors } from '../theme';
import { CardButton, DetailsArrow, Tag } from './Card';
import { csvRights } from '../data/csvRights';
import { RightDetailModal } from './RightDetailModal';

interface CategoryRightsModalProps {
  category: string;
  onClose: () => void;
}

export function CategoryRightsModal({ category, onClose }: CategoryRightsModalProps): JSX.Element | null {
  const [selectedRight, setSelectedRight] = useState<any | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const rights = csvRights.filter((r) => r.category === category);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !selectedRight) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, selectedRight]);

  return (
    <>
      <div
        className="modal-overlay"
        dir="rtl"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        role="dialog"
        aria-modal="true"
        aria-label={`זכויות בנושא ${category}`}
        style={{ zIndex: 1000 }}
      >
        <div
          className="modal-card"
          ref={modalRef}
          style={{ maxWidth: 800, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}
        >
          {/* Header */}
          <div style={{ background: colors.blueTint, padding: '24px 28px', position: 'relative' }}>
            <button
              onClick={onClose}
              aria-label="סגירה"
              style={{
                position: 'absolute',
                top: 14,
                left: 14,
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
            <h2
              style={{
                fontSize: 'clamp(22px,3vw,28px)',
                color: colors.darkBlue,
                fontWeight: 800,
                margin: 0,
              }}
            >
              {category}
            </h2>
          </div>

          {/* Body */}
          <div style={{ padding: '24px 28px', overflowY: 'auto', background: colors.sectionBg }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
                gap: 20,
              }}
            >
              {rights.map((r, idx) => (
                <CardButton key={idx} onClick={() => setSelectedRight({ id: String(idx), ...r })}>
                  <Tag>{r?.provider_authority?.split('/')[0]?.trim()}</Tag>
                  <span style={{ fontSize: 20, fontWeight: 700, color: colors.darkBlue }}>{r.title}</span>
                  <span style={{ fontSize: 16, color: colors.textMuted, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.description}</span>
                  <DetailsArrow />
                </CardButton>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Inner modal for right details */}
      <RightDetailModal right={selectedRight} onClose={() => setSelectedRight(null)} />
    </>
  );
}
