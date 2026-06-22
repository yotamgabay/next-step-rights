import { useState, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackArrowIcon, CheckCircleIcon, CheckIcon, ChevronLeftIcon, CloseIcon } from '../components/icons';
import { colors } from '../theme';
import {
  authorityFor,
  profileLine,
  stepDefinition,
  summaryNote,
  summaryRights,
  type StepOption,
} from './wizardData';
import { useWizard } from './WizardContext';

function CloseButton({ onClick, onDark = false }: { onClick: () => void; onDark?: boolean }): JSX.Element {
  return (
    <button
      onClick={onClick}
      aria-label="סגירה"
      style={{
        position: 'absolute',
        top: 16,
        insetInlineStart: 16,
        width: 38,
        height: 38,
        border: 'none',
        background: onDark ? 'rgba(255,255,255,.18)' : colors.sectionBg,
        borderRadius: '50%',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: onDark ? colors.white : colors.textFaint,
      }}
    >
      <CloseIcon size={18} strokeWidth={2.2} />
    </button>
  );
}

function LaterButton({ onClick }: { onClick: () => void }): JSX.Element {
  return (
    <button
      onClick={onClick}
      style={{ background: 'none', border: 'none', color: colors.textFaint, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
    >
      אעשה זאת מאוחר יותר
    </button>
  );
}

/** Shared option-row rendering for the stepper variant. */
function StepperOption({ option, selected, onClick }: { option: StepOption; selected: boolean; onClick: () => void }): JSX.Element {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        textAlign: 'right',
        width: '100%',
        background: selected ? colors.blueTint : colors.white,
        border: `1.5px solid ${selected || hover ? colors.primaryBlue : colors.border}`,
        borderRadius: 14,
        padding: '15px 18px',
        cursor: 'pointer',
        boxShadow: hover ? '0 6px 18px rgba(13,61,94,.10)' : 'none',
        transition: 'border-color .15s, background .15s, box-shadow .15s',
      }}
    >
      <span
        style={{
          flex: 'none',
          width: 24,
          height: 24,
          borderRadius: '50%',
          border: `2px solid ${selected ? colors.primaryBlue : '#CBD5E0'}`,
          background: selected ? colors.primaryBlue : colors.white,
          boxShadow: selected ? 'inset 0 0 0 4px #fff' : 'none',
        }}
      />
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start', flex: 1 }}>
        <span style={{ fontSize: 19, fontWeight: 700, color: colors.darkBlue }}>{option.label}</span>
        {option.desc ? <span style={{ fontSize: 15, color: '#777' }}>{option.desc}</span> : null}
      </span>
      <ChevronLeftIcon size={20} color={colors.primaryBlue} style={{ flex: 'none' }} />
    </button>
  );
}

export function Wizard(): JSX.Element | null {
  const wizard = useWizard();
  const navigate = useNavigate();

  if (!wizard.open) return null;

  const { answers, steps, currentStep, phase } = wizard;
  const idx = Math.min(wizard.stepIndex, steps.length - 1);
  const def = stepDefinition(currentStep, answers);
  const canBack = idx > 0;
  const authority = authorityFor(answers.cause);

  const toChat = (): void => {
    wizard.dismiss();
    const cause = answers.cause;
    navigate('/chat', cause ? { state: { topic: cause } } : undefined);
  };
  const toRights = (): void => {
    wizard.dismiss();
    navigate('/rights');
  };

  const overlay: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 200,
    background: 'rgba(13,61,94,.55)',
    backdropFilter: 'blur(3px)',
    WebkitBackdropFilter: 'blur(3px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '16px 16px 28px',
    overflowY: 'auto',
  };

  const renderOptions = (): JSX.Element[] =>
    def.options.map((option) => (
      <StepperOption
        key={option.key}
        option={option}
        selected={answers[currentStep] === option.key}
        onClick={() => wizard.pick(currentStep, option.key)}
      />
    ));

  return (
    <div role="dialog" aria-modal="true" aria-label="התאמה אישית של הזכויות" dir="rtl" style={overlay}>
      {phase === 'summary' ? (
        <Summary
          authName={authority.name}
          profile={profileLine(answers)}
          note={summaryNote(answers)}
          rights={summaryRights(answers.cause)}
          onClose={wizard.closeLater}
          onEdit={wizard.edit}
          onChat={toChat}
          onRights={toRights}
        />
      ) : (
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 560,
            background: colors.white,
            borderRadius: 22,
            boxShadow: '0 24px 60px rgba(0,0,0,.3)',
            padding: '30px 30px 24px',
          }}
        >
          <CloseButton onClick={wizard.closeLater} />
          {canBack ? (
            <button
              onClick={wizard.back}
              style={{
                position: 'absolute',
                top: 18,
                insetInlineEnd: 24,
                background: 'none',
                border: 'none',
                color: colors.headerBlue,
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: 0,
              }}
            >
              <BackArrowIcon size={18} color={colors.headerBlue} />
              חזרה
            </button>
          ) : null}

          <div style={{ display: 'flex', gap: 6, margin: '6px 0 8px' }}>
            {steps.map((sid, i) => (
              <span
                key={sid}
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 3,
                  background: i < idx ? colors.primaryBlue : i === idx ? '#9FC4E0' : colors.borderSoft,
                }}
              />
            ))}
          </div>
          <div style={{ fontSize: 14, color: colors.textFaint, fontWeight: 600, marginBottom: 16 }}>
            שלב {idx + 1} מתוך {steps.length}
          </div>
          <h2 style={{ fontSize: 26, color: colors.darkBlue, fontWeight: 800, margin: '0 0 8px', lineHeight: 1.25 }}>
            {def.title}
          </h2>
          <p style={{ fontSize: 17, color: colors.textMuted, margin: '0 0 22px', lineHeight: 1.5 }}>{def.help}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{renderOptions()}</div>

          {def.skippable ? (
            <button
              onClick={() => wizard.skip(currentStep)}
              style={{
                width: '100%',
                marginTop: 14,
                background: 'none',
                border: 'none',
                color: colors.textFaint,
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                padding: 6,
              }}
            >
              דלג/י על שאלה זו
            </button>
          ) : null}

          <div style={{ marginTop: 16, borderTop: '1px solid #EEE', paddingTop: 14, textAlign: 'center' }}>
            <LaterButton onClick={wizard.closeLater} />
          </div>
        </div>
      )}
    </div>
  );
}

interface SummaryProps {
  authName: string;
  profile: string;
  note: string;
  rights: readonly { h: string; items: readonly string[] }[];
  onClose: () => void;
  onEdit: () => void;
  onChat: () => void;
  onRights: () => void;
}

function Summary({ authName, profile, note, rights, onClose, onEdit, onChat, onRights }: SummaryProps): JSX.Element {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 620,
        background: colors.white,
        borderRadius: 22,
        boxShadow: '0 24px 60px rgba(0,0,0,.3)',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'relative', background: colors.headerBlue, padding: '30px 30px 26px', color: colors.white }}>
        <CloseButton onClick={onClose} onDark />
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(255,255,255,.16)',
            borderRadius: 999,
            padding: '6px 14px',
            marginBottom: 16,
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          <CheckCircleIcon size={18} color={colors.white} strokeWidth={2.4} />
          ההתאמה האישית הושלמה
        </div>
        <div style={{ fontSize: 15, color: 'rgba(255,255,255,.82)', marginBottom: 6 }}>הגורם המטפל שלך</div>
        <h2 style={{ fontSize: 'clamp(22px,3vw,28px)', fontWeight: 800, margin: '0 0 8px', lineHeight: 1.2 }}>{authName}</h2>
        {profile ? <div style={{ fontSize: 16, color: 'rgba(255,255,255,.88)' }}>{profile}</div> : null}
      </div>
      <div style={{ padding: '24px 30px 28px' }}>
        {note ? (
          <div
            style={{
              background: colors.blueTint,
              border: `1px solid ${colors.blueTintBorder}`,
              borderRadius: 14,
              padding: '15px 18px',
              marginBottom: 20,
              fontSize: 16,
              color: colors.headerBlue,
              lineHeight: 1.55,
            }}
          >
            {note}
          </div>
        ) : null}
        <div style={{ fontSize: 18, fontWeight: 800, color: colors.darkBlue, margin: '2px 0 14px' }}>
          הזכויות שרלוונטיות עבורך
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rights.map((r) => (
            <div key={r.h} style={{ border: `1px solid ${colors.borderSoft}`, borderRadius: 14, padding: '16px 18px' }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: colors.headerBlue, marginBottom: 10 }}>{r.h}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {r.items.map((it) => (
                  <div key={it} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                    <CheckIcon size={18} color={colors.primaryBlue} strokeWidth={2.4} style={{ flex: 'none', marginTop: 3 }} />
                    <span style={{ fontSize: 15, color: '#444', lineHeight: 1.5 }}>{it}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 22 }}>
          <button
            onClick={onChat}
            style={{ height: 54, border: 'none', borderRadius: 27, background: colors.orange, color: colors.white, fontSize: 17, fontWeight: 700, cursor: 'pointer' }}
          >
            שאל/י את העוזר הדיגיטלי על המצב שלך
          </button>
          <button
            onClick={onRights}
            style={{ height: 54, border: `1.5px solid ${colors.blueTintBorder}`, borderRadius: 27, background: colors.white, color: colors.headerBlue, fontSize: 17, fontWeight: 700, cursor: 'pointer' }}
          >
            צפה/י בכל הזכויות שלי
          </button>
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 20, justifyContent: 'center' }}>
          <button onClick={onEdit} style={{ background: 'none', border: 'none', color: colors.textFaint, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
            עריכת התשובות
          </button>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: colors.textFaint, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
            סגירה
          </button>
        </div>
      </div>
    </div>
  );
}
