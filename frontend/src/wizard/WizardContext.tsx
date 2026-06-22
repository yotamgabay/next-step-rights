import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type JSX,
  type ReactNode,
} from 'react';
import type { LimbSlot, WizardAnswers } from '../types';
import { buildSteps, emptyAnswers, slotOfLevelStep, type StepDef } from './wizardData';

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
  steps: StepDef[];
  currentIndex: number;
  currentStep: StepDef;
  start: () => void;
  resume: () => void;
  closeLater: () => void;
  dismiss: () => void;
  edit: () => void;
  back: () => void;
  /** Single-select: set the value and advance. */
  select: (id: string, key: string) => void;
  /** Multi-select: toggle a key without advancing. */
  toggle: (id: string, key: string) => void;
  /** Number step: set the value without advancing. */
  setNumber: (id: string, value: string) => void;
  /** Advance from the current step (multi/number steps use this). */
  next: () => void;
  /** Skip an optional step. */
  skip: (id: string) => void;
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

/** Immutably write a single/number step's value into the answers. */
function writeSingle(answers: WizardAnswers, id: string, value: string): WizardAnswers {
  const slot = slotOfLevelStep(id);
  if (slot) {
    return { ...answers, levels: { ...answers.levels, [slot]: value } };
  }
  if (id === 'disabilityPct') {
    return { ...answers, disabilityPct: value };
  }
  const next = { ...answers, [id]: value } as WizardAnswers;
  // Selecting "no children" clears any previously chosen age groups.
  if (id === 'hasChildren' && value !== 'yes') next.childAgeGroups = [];
  return next;
}

function toggleInArray<T extends string>(list: readonly T[], key: T): T[] {
  return list.includes(key) ? list.filter((k) => k !== key) : [...list, key];
}

export function WizardProvider({ children }: { children: ReactNode }): JSX.Element {
  const [state, setState] = useState<WizardState>(initialState);

  const steps = useMemo(() => buildSteps(state.answers), [state.answers]);
  const currentIndex = Math.min(state.stepIndex, steps.length - 1);
  const currentStep: StepDef = steps[currentIndex] ?? steps[0]!;

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
  const closeLater = useCallback(
    () => setState((s) => ({ ...s, open: false, skipped: !s.completed })),
    [],
  );
  const dismiss = useCallback(() => setState((s) => ({ ...s, open: false })), []);
  const edit = useCallback(() => setState((s) => ({ ...s, phase: 'steps', stepIndex: 0 })), []);

  const back = useCallback(() => {
    setState((s) => {
      if (s.phase === 'summary') {
        return { ...s, phase: 'steps', stepIndex: buildSteps(s.answers).length - 1 };
      }
      if (s.stepIndex > 0) return { ...s, stepIndex: s.stepIndex - 1 };
      return s;
    });
  }, []);

  /** Advances from the step identified by `fromId`, recomputed against `answers`. */
  const advanceFrom = useCallback((answers: WizardAnswers, fromId: string): Partial<WizardState> => {
    const nextSteps = buildSteps(answers);
    const idx = nextSteps.findIndex((step) => step.id === fromId);
    if (idx < 0) return { answers };
    if (idx >= nextSteps.length - 1) {
      return { answers, phase: 'summary', completed: true, skipped: false };
    }
    return { answers, stepIndex: idx + 1 };
  }, []);

  const select = useCallback(
    (id: string, key: string) => {
      setState((s) => {
        const answers = writeSingle(s.answers, id, key);
        return { ...s, ...advanceFrom(answers, id) };
      });
    },
    [advanceFrom],
  );

  const setNumber = useCallback((id: string, value: string) => {
    setState((s) => ({ ...s, answers: writeSingle(s.answers, id, value) }));
  }, []);

  const toggle = useCallback((id: string, key: string) => {
    setState((s) => {
      if (id === 'limbs') {
        const limbs = toggleInArray<LimbSlot>(s.answers.limbs, key as LimbSlot);
        // Drop the level answer for any limb that was just removed.
        const levels = { ...s.answers.levels };
        if (!limbs.includes(key as LimbSlot)) delete levels[key as LimbSlot];
        return { ...s, answers: { ...s.answers, limbs, levels } };
      }
      if (id === 'childAgeGroups') {
        const childAgeGroups = toggleInArray(s.answers.childAgeGroups, key as never);
        return { ...s, answers: { ...s.answers, childAgeGroups } };
      }
      return s;
    });
  }, []);

  const next = useCallback(() => {
    setState((s) => {
      const built = buildSteps(s.answers);
      const idx = Math.min(s.stepIndex, built.length - 1);
      const step = built[idx];
      if (!step) return s;
      return { ...s, ...advanceFrom(s.answers, step.id) };
    });
  }, [advanceFrom]);

  const skip = useCallback(
    (id: string) => {
      setState((s) => {
        const answers = writeSingle(s.answers, id, '');
        return { ...s, ...advanceFrom(answers, id) };
      });
    },
    [advanceFrom],
  );

  const value: WizardContextValue = {
    ...state,
    steps,
    currentIndex,
    currentStep,
    start,
    resume,
    closeLater,
    dismiss,
    edit,
    back,
    select,
    toggle,
    setNumber,
    next,
    skip,
  };

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}

export function useWizard(): WizardContextValue {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error('useWizard must be used within a WizardProvider');
  return ctx;
}
