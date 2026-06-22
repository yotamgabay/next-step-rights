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

/**
 * Wizard answer model. Mirrors the onboarding flowchart and the Supabase schema
 * (supabase/migrations): cause, insurer, the amputation matrix (limb × side ×
 * level, multi-select), disability detail, prosthetic use, education, gender and
 * children.
 */

/** Amputation cause — matches the DB `amputation_cause` enum. */
export type DbCause = 'army' | 'terror' | 'work' | 'road_accident' | 'disease' | 'birth_other';

/** Insuring/compensating body as chosen in the wizard (resolved to the DB enum on save). */
export type InsurerGroup = 'mod' | 'ni' | 'moh' | 'private';

/** One affected limb+side cell of the amputation matrix. */
export type LimbSlot = 'arm_right' | 'arm_left' | 'leg_right' | 'leg_left';

export type ArmLevel = 'fingers' | 'hand' | 'below_elbow' | 'above_elbow' | 'shoulder';
export type LegLevel = 'foot' | 'below_knee' | 'through_knee' | 'above_knee' | 'pelvis';
export type AmputationLevel = ArmLevel | LegLevel;

export type YesNo = 'yes' | 'no';
export type Prosthetic = 'yes' | 'no' | 'not_yet';
export type Education =
  | 'not_relevant'
  | 'below_high_school'
  | 'high_school'
  | 'certificate'
  | 'degree';
export type Gender = 'male' | 'female' | 'other';
export type ChildAgeGroup = 'under_18' | '18_to_24' | 'over_24';

/** Step ids are dynamic (per-limb level steps look like `level:arm_right`). */
export type WizardStepId = string;

export interface WizardAnswers {
  cause: DbCause | '';
  insurer: InsurerGroup | '';
  /** Selected limb/side cells (multi-select). */
  limbs: LimbSlot[];
  /** Chosen level per selected limb cell. */
  levels: Partial<Record<LimbSlot, AmputationLevel>>;
  /** Self-reported disability percentage (string from the numeric input). */
  disabilityPct: string;
  dominantHand: YesNo | '';
  phantomPain: YesNo | '';
  crps: YesNo | '';
  prosthetic: Prosthetic | '';
  education: Education | '';
  gender: Gender | '';
  hasChildren: YesNo | '';
  childAgeGroups: ChildAgeGroup[];
}
