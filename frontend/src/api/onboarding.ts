import { supabase } from './supabase';
import type { DbCause, InsurerGroup, LimbSlot, WizardAnswers } from '../types';
import { profileLine } from '../wizard/wizardData';

/**
 * Persists the personalization wizard answers to Supabase, mapping the wizard's
 * vocabulary onto the database schema (see supabase/migrations):
 *   - profiles: cause, insurer, prosthetic, disability %, edge-case flags,
 *     education, gender, amputation_type (free-text completion marker)
 *   - user_amputations: one row per affected limb/side
 *   - user_children: one row per chosen child age group
 *
 * The wizard already speaks the DB enum vocabulary for cause / prosthetic /
 * education / gender / level, so those pass through directly.
 */

type DbInsurer = 'mod' | 'ni_terror' | 'ni_work' | 'ni_general' | 'moh' | 'private';

const slotToLimbSide: Record<LimbSlot, { limb: 'arm' | 'leg'; side: 'right' | 'left' }> = {
  arm_right: { limb: 'arm', side: 'right' },
  arm_left: { limb: 'arm', side: 'left' },
  leg_right: { limb: 'leg', side: 'right' },
  leg_left: { limb: 'leg', side: 'left' },
};

/** Resolves the chosen insurer group to the precise DB enum, using cause for NI. */
function resolveInsurer(group: InsurerGroup | '', cause: DbCause | ''): DbInsurer | null {
  switch (group) {
    case 'mod':
      return 'mod';
    case 'moh':
      return 'moh';
    case 'private':
      return 'private';
    case 'ni':
      if (cause === 'terror') return 'ni_terror';
      if (cause === 'work') return 'ni_work';
      return 'ni_general';
    default:
      return null;
  }
}

function parsePercentage(value: string): number | null {
  if (!value.trim()) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export async function saveOnboarding(userId: string, answers: WizardAnswers): Promise<void> {
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      cause: answers.cause || null,
      insurer: resolveInsurer(answers.insurer, answers.cause),
      prosthetic: answers.prosthetic || null,
      base_disability_percentage: parsePercentage(answers.disabilityPct),
      is_dominant_hand_amputated: answers.dominantHand === 'yes',
      has_phantom_pain: answers.phantomPain === 'yes',
      has_crps: answers.crps === 'yes',
      education: answers.education || null,
      gender: answers.gender || null,
      amputation_type: profileLine(answers) || 'הושלם',
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
  if (profileError) throw profileError;

  // Replace the amputation rows with the current selection.
  const { error: deleteAmpError } = await supabase
    .from('user_amputations')
    .delete()
    .eq('user_id', userId);
  if (deleteAmpError) throw deleteAmpError;

  const ampRows = answers.limbs
    .map((slot) => {
      const level = answers.levels[slot];
      if (!level) return null;
      const { limb, side } = slotToLimbSide[slot];
      return { user_id: userId, limb, side, level };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  if (ampRows.length > 0) {
    const { error: insertAmpError } = await supabase.from('user_amputations').insert(ampRows);
    if (insertAmpError) throw insertAmpError;
  }

  // Replace the children rows.
  const { error: deleteChildError } = await supabase
    .from('user_children')
    .delete()
    .eq('user_id', userId);
  if (deleteChildError) throw deleteChildError;

  if (answers.hasChildren === 'yes' && answers.childAgeGroups.length > 0) {
    const childRows = answers.childAgeGroups.map((group) => ({
      user_id: userId,
      age_group: group,
      children_count: 1,
    }));
    const { error: insertChildError } = await supabase.from('user_children').insert(childRows);
    if (insertChildError) throw insertChildError;
  }
}
