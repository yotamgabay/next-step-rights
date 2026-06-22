import { useEffect, useRef, useState, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveOnboarding } from '../api/onboarding';
import {
  BackArrowIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronLeftIcon,
  CloseIcon,
} from '../components/icons';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../theme';
import {
  authorityName,
  causeToTopic,
  isStepComplete,
  multiValue,
  profileLine,
  singleValue,
  summaryRights,
  type StepDef,
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

interface OptionRowProps {
  option: StepOption;
  selected: boolean;
  showChevron: boolean;
  onClick: () => void;
}

function OptionRow({ option, selected, showChevron, onClick }: OptionRowProps): JSX.Element {
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
          borderRadius: showChevron ? '50%' : 6,
          border: `2px solid ${selected ? colors.primaryBlue : '#CBD5E0'}`,
          background: selected ? colors.primaryBlue : colors.white,
          boxShadow: selected ? 'inset 0 0 0 4px #fff' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {selected && !showChevron ? <CheckIcon size={14} color={colors.white} strokeWidth={3} /> : null}
      </span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start', flex: 1 }}>
        <span style={{ fontSize: 19, fontWeight: 700, color: colors.darkBlue }}>{option.label}</span>
        {option.desc ? <span style={{ fontSize: 15, color: '#777' }}>{option.desc}</span> : null}
      </span>
      {showChevron ? <ChevronLeftIcon size={20} color={colors.primaryBlue} style={{ flex: 'none' }} /> : null}
    </button>
  );
}

function ContinueButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }): JSX.Element {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        marginTop: 16,
        height: 52,
        border: 'none',
        borderRadius: 26,
        background: disabled ? colors.placeholder : colors.primaryBlue,
        color: colors.white,
        fontSize: 17,
        fontWeight: 700,
        cursor: disabled ? 'default' : 'pointer',
      }}
    >
      המשך
    </button>
  );
}

function StepBody({ step }: { step: StepDef }): JSX.Element {
  const wizard = useWizard();
  const { answers } = wizard;

  if (step.kind === 'number') {
    return (
      <div>
        <input
          type="number"
          inputMode="numeric"
          dir="ltr"
          value={singleValue(answers, step.id)}
          onChange={(e) => wizard.setNumber(step.id, e.target.value)}
          placeholder="לדוגמה: 50"
          style={{
            width: '100%',
            height: 56,
            border: `1.5px solid ${colors.border}`,
            borderRadius: 8,
            padding: '0 16px',
            fontSize: 17,
            color: colors.text,
            background: colors.white,
            outline: 'none',
            textAlign: 'left',
          }}
        />
        <ContinueButton disabled={false} onClick={wizard.next} />
      </div>
    );
  }

  if (step.kind === 'multi') {
    const selected = multiValue(answers, step.id);
    return (
      <div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {step.options.map((option) => (
            <OptionRow
              key={option.key}
              option={option}
              selected={selected.includes(option.key)}
              showChevron={false}
              onClick={() => wizard.toggle(step.id, option.key)}
            />
          ))}
        </div>
        <ContinueButton disabled={!isStepComplete(answers, step)} onClick={wizard.next} />
      </div>
    );
  }

  // single
  const current = singleValue(answers, step.id);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {step.options.map((option) => (
        <OptionRow
          key={option.key}
          option={option}
          selected={current === option.key}
          showChevron
          onClick={() => wizard.select(step.id, option.key)}
        />
      ))}
    </div>
  );
}

export function Wizard(): JSX.Element | null {
  const wizard = useWizard();
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const savedRef = useRef(false);

  const open = wizard.open;
  const phaseValue = wizard.phase;

  // Persist answers to Supabase when the wizard reaches its summary.
  useEffect(() => {
    if (!open || phaseValue !== 'summary' || !user || savedRef.current) return;
    savedRef.current = true;
    saveOnboarding(user.id, wizard.answers)
      .then(() => refreshProfile())
      .catch((err: unknown) => {
        savedRef.current = false;
        console.error('Failed to save onboarding answers:', err);
      });
  }, [open, phaseValue, user, wizard.answers, refreshProfile]);

  useEffect(() => {
    if (!open) savedRef.current = false;
  }, [open]);

  if (!wizard.open) return null;

  const { answers, steps, currentIndex, currentStep, phase } = wizard;

  const toChat = (): void => {
    wizard.dismiss();
    const topic = causeToTopic(answers.cause);
    navigate('/chat', topic ? { state: { topic } } : undefined);
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

  return (
    <div role="dialog" aria-modal="true" aria-label="התאמה אישית של הזכויות" dir="rtl" style={overlay}>
      {phase === 'summary' ? (
        <Summary
          authName={authorityName(answers.cause)}
          profile={profileLine(answers)}
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
          {currentIndex > 0 ? (
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
            {steps.map((step, i) => (
              <span
                key={step.id}
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 3,
                  background:
                    i < currentIndex ? colors.primaryBlue : i === currentIndex ? '#9FC4E0' : colors.borderSoft,
                }}
              />
            ))}
          </div>
          <div style={{ fontSize: 14, color: colors.textFaint, fontWeight: 600, marginBottom: 16 }}>
            שלב {currentIndex + 1} מתוך {steps.length}
          </div>
          <h2 style={{ fontSize: 26, color: colors.darkBlue, fontWeight: 800, margin: '0 0 8px', lineHeight: 1.25 }}>
            {currentStep.title}
          </h2>
          {currentStep.help ? (
            <p style={{ fontSize: 17, color: colors.textMuted, margin: '0 0 22px', lineHeight: 1.5 }}>
              {currentStep.help}
            </p>
          ) : (
            <div style={{ height: 6 }} />
          )}

          <StepBody step={currentStep} />

          {currentStep.skippable ? (
            <button
              onClick={() => wizard.skip(currentStep.id)}
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
            <button
              onClick={wizard.closeLater}
              style={{ background: 'none', border: 'none', color: colors.textFaint, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
            >
              אעשה זאת מאוחר יותר
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface SummaryProps {
  authName: string;
  profile: string;
  rights: readonly { h: string; items: readonly string[] }[];
  onClose: () => void;
  onEdit: () => void;
  onChat: () => void;
  onRights: () => void;
}

function Summary({ authName, profile, rights, onClose, onEdit, onChat, onRights }: SummaryProps): JSX.Element {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 620,
        maxHeight: 'calc(100dvh - 44px)',
        display: 'flex',
        flexDirection: 'column',
        background: colors.white,
        borderRadius: 22,
        boxShadow: '0 24px 60px rgba(0,0,0,.3)',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'relative', flex: 'none', background: colors.headerBlue, padding: '30px 30px 26px', color: colors.white }}>
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
      <div style={{ padding: '24px 30px 28px', overflowY: 'auto', flex: 1, minHeight: 0 }}>
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
