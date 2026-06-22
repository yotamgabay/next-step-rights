import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type JSX,
  type ReactNode,
} from 'react';
import type { WizardAnswers, WizardStepId } from '../types';
import { emptyAnswers, wizardSteps } from './wizardData';

type Phase = 'steps' | 'summary';

interface WizardState {
  open: boolean;
  phase: Phase;
  stepIndex: number;
  answers: WizardAnswers;
  completed: boolean;
  skipped: boolean;
}

export interface WizardContextValue extends WizardState {
  steps: WizardStepId[];
  currentStep: WizardStepId;
  start: () => void;
  resume: () => void;
  closeLater: () => void;
  pick: (stepId: WizardStepId, key: string) => void;
  skip: (stepId: WizardStepId) => void;
  back: () => void;
  jump: (stepId: WizardStepId) => void;
  edit: () => void;
  /** Marks the wizard closed without resetting answers (after navigating away). */
  dismiss: () => void;
}

const WizardContext = createContext<WizardContextValue | null>(null);

const initialState: WizardState = {
  open: false,
  phase: 'steps',
  stepIndex: 0,
  answers: emptyAnswers,
  completed: false,
  skipped: false,
};

export function WizardProvider({ children }: { children: ReactNode }): JSX.Element {
  const [state, setState] = useState<WizardState>(initialState);

  const steps = useMemo(() => wizardSteps(state.answers), [state.answers]);
  const currentIndex = Math.min(state.stepIndex, steps.length - 1);
  const currentStep: WizardStepId = steps[currentIndex] ?? 'limb';

  const start = useCallback(() => {
    setState((s) => ({
      ...s,
      open: true,
      phase: 'steps',
      stepIndex: 0,
      completed: false,
      skipped: false,
      answers: emptyAnswers,
    }));
  }, []);

  const resume = useCallback(() => setState((s) => ({ ...s, open: true })), []);

  const closeLater = useCallback(() => {
    setState((s) => ({ ...s, open: false, skipped: !s.completed }));
  }, []);

  const dismiss = useCallback(() => setState((s) => ({ ...s, open: false })), []);

  /** Applies updated answers and moves to the next step (or the summary). */
  const applyAndAdvance = useCallback((stepId: WizardStepId, value: string) => {
    setState((s) => {
      // `value` is a validated option key (or '' for skip); the cast narrows the
      // computed-key assignment back to the precise per-field unions.
      const answers = { ...s.answers, [stepId]: value } as WizardAnswers;
      if (stepId === 'limb') answers.level = '';
      const nextSteps = wizardSteps(answers);
      const idx = nextSteps.indexOf(stepId);
      if (idx < 0) return { ...s, answers };
      if (idx >= nextSteps.length - 1) {
        return { ...s, answers, phase: 'summary', completed: true, skipped: false };
      }
      return { ...s, answers, stepIndex: idx + 1 };
    });
  }, []);

  const pick = useCallback(
    (stepId: WizardStepId, key: string) => applyAndAdvance(stepId, key),
    [applyAndAdvance],
  );

  const skip = useCallback(
    (stepId: WizardStepId) => applyAndAdvance(stepId, ''),
    [applyAndAdvance],
  );

  const back = useCallback(() => {
    setState((s) => {
      if (s.phase === 'summary') {
        return { ...s, phase: 'steps', stepIndex: wizardSteps(s.answers).length - 1 };
      }
      if (s.stepIndex > 0) return { ...s, stepIndex: s.stepIndex - 1 };
      return s;
    });
  }, []);

  const jump = useCallback((stepId: WizardStepId) => {
    setState((s) => {
      const idx = wizardSteps(s.answers).indexOf(stepId);
      if (idx < 0) return s;
      return { ...s, phase: 'steps', stepIndex: idx };
    });
  }, []);

  const edit = useCallback(() => setState((s) => ({ ...s, phase: 'steps', stepIndex: 0 })), []);

  const value: WizardContextValue = {
    ...state,
    steps,
    currentStep,
    start,
    resume,
    closeLater,
    pick,
    skip,
    back,
    jump,
    edit,
    dismiss,
  };

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}

export function useWizard(): WizardContextValue {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error('useWizard must be used within a WizardProvider');
  return ctx;
}
