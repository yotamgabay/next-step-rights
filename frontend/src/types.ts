/** Domain types shared across the frontend. */

export interface RightsSection {
  readonly h: string;
  readonly items: readonly string[];
}

export interface Topic {
  readonly id: TopicId;
  readonly tag: string;
  readonly title: string;
  readonly lead: string;
  /** The handling authority (גורם מטפל). */
  readonly body: string;
  readonly chatIntro: string;
  readonly sections: readonly RightsSection[];
}

export type TopicId =
  | 'medical'
  | 'work'
  | 'road'
  | 'military'
  | 'medrights'
  | 'financial'
  | 'mobility';

/** A cause of amputation — drives the handling authority. */
export type CauseId = 'medical' | 'work' | 'road' | 'military';

export type ChatRole = 'bot' | 'user';

export interface ChatMessage {
  readonly role: ChatRole;
  readonly text: string;
}

/** Wizard answer keys. */
export type LimbKey = 'leg' | 'hand' | 'multi';
export type LevelKey = 'aboveKnee' | 'belowKnee' | 'aboveElbow' | 'belowElbow';
export type TimeKey = 'recent' | 'mid' | 'veteran';
export type ProsthesisKey = 'none' | 'initial' | 'advanced' | 'wheelchair';
export type WizardStepId = 'limb' | 'level' | 'cause' | 'time' | 'prosthesis';

export interface WizardAnswers {
  limb: LimbKey | '';
  level: LevelKey | '';
  cause: CauseId | '';
  time: TimeKey | '';
  prosthesis: ProsthesisKey | '';
}
