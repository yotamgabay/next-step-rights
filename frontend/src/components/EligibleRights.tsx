import { useEffect, useState, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase';
import { useAuth } from '../hooks/useAuth';
import { Tag } from './Card';
import { ChatIcon, TrackerIcon } from './icons';
import { colors, maxWidth } from '../theme';
import { templateForRight } from '../data/taskTemplates';

/**
 * Summary card for a personalized right. The card itself isn't a link (there's
 * no per-right detail route); its action is the AskButton, which opens the
 * assistant pre-asked about this right. The orange-tinted border marks it as
 * "matched to you" without a side-stripe or decorative gradient, keeping it
 * aligned with the shared CardButton look.
 */
function PersonalizedCard({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <article
      style={{
        textAlign: 'right',
        background: colors.white,
        // Soft warm hairline keeps a whisper of the "matched to you" warmth;
        // the layered shadow (tight contact + soft ambient) does the lifting,
        // so the border can stay quiet and the card reads as elegant, not loud.
        border: '1px solid #ECE0D4',
        borderRadius: 16,
        padding: 26,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        boxShadow: '0 1px 2px rgba(13,61,94,.04), 0 10px 24px rgba(13,61,94,.06)',
      }}
    >
      {children}
    </article>
  );
}

/**
 * Primary CTA on each card: adds this right to the user's tracker (creating the
 * tracked-right row + its template tasks), then routes to /tracker. Once the
 * right is already tracked it flips to a calm "go to tracker" link instead.
 */
function AddToTrackerButton({
  tracked,
  busy,
  onAdd,
  onGo,
}: {
  tracked: boolean;
  busy: boolean;
  onAdd: () => void;
  onGo: () => void;
}): JSX.Element {
  const [hover, setHover] = useState(false);
  if (tracked) {
    return (
      <button
        onClick={onGo}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        aria-label="כבר במעקב — מעבר למעקב"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          minHeight: 44,
          padding: '12px 14px',
          border: `1.5px solid ${colors.green}`,
          borderRadius: 24,
          background: hover ? colors.greenTint : colors.white,
          color: colors.green,
          fontSize: 15,
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'background .15s',
        }}
      >
        <TrackerIcon size={18} color={colors.green} />
        במעקב
      </button>
    );
  }
  return (
    <button
      onClick={onAdd}
      disabled={busy}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        minHeight: 44,
        padding: '12px 20px',
        border: 'none',
        borderRadius: 24,
        background: busy ? colors.disabledControl : hover ? colors.orange : colors.orangeTint,
        color: busy ? colors.white : hover ? colors.white : colors.orangeDeep,
        fontSize: 15,
        fontWeight: 700,
        cursor: busy ? 'wait' : 'pointer',
        transform: hover && !busy ? 'translateY(-1px)' : 'none',
        boxShadow: hover && !busy ? '0 6px 16px rgba(240,103,35,.28)' : 'none',
        transition: 'background .15s, color .15s, transform .15s, box-shadow .15s',
      }}
    >
      <TrackerIcon size={18} color={busy ? colors.white : hover ? colors.white : colors.orangeDeep} />
      {busy ? 'מוסיף...' : 'הוסף למעקב'}
    </button>
  );
}

/**
 * Secondary, compact CTA: opens the assistant pre-asked about this right. Kept
 * small ("שאל/י") so the tracker action reads as the primary step on the card.
 */
function AskButton({ onClick }: { onClick: () => void }): JSX.Element {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      aria-label="שאל/י את העוזר על הזכות"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        minHeight: 44,
        padding: '12px 16px',
        border: `1.5px solid ${colors.blueTintBorder}`,
        borderRadius: 24,
        background: hover ? colors.blueTint : colors.white,
        color: colors.headerBlue,
        fontSize: 15,
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'background .15s',
      }}
    >
      <ChatIcon size={18} color={colors.headerBlue} />
      שאל/י
    </button>
  );
}

interface EligibleRight {
  right_id: string;
  code: string | null;
  title: string;
  description: string;
  provider_authority: string;
}

export function EligibleRights(): JSX.Element | null {
  const navigate = useNavigate();
  const { session, profile } = useAuth();
  const [rights, setRights] = useState<EligibleRight[]>([]);
  const [loading, setLoading] = useState(true);
  // right_ids already in the user's tracker, so the card can flip its CTA.
  const [trackedIds, setTrackedIds] = useState<Set<string>>(new Set());
  // right_id currently being added (drives the button's busy state).
  const [busyId, setBusyId] = useState<string | null>(null);

  // Open the assistant with a question already asked about this right. Chat reads
  // `state.query` on mount and auto-sends it (same path as the home hero search).
  const askAboutRight = (right: EligibleRight): void => {
    const query = `אני רוצה לממש את הזכות "${right.title}" מול ${right.provider_authority}. מה התנאים לקבלת הזכות ואיך מגישים בקשה?`;
    navigate('/chat', { state: { query } });
  };

  // Add a right to the tracker: create the tracked-right row, seed its template
  // tasks, then route to the tracker. Idempotent — a unique constraint backs the
  // tracked row, and the button is disabled for rights already tracked.
  const addToTracker = async (right: EligibleRight): Promise<void> => {
    if (!profile || trackedIds.has(right.right_id) || busyId) return;
    setBusyId(right.right_id);
    try {
      const { data: trackedRow, error: trackErr } = await supabase
        .from('user_tracked_rights')
        .insert({ user_id: profile.id, right_id: right.right_id })
        .select('id')
        .single();
      if (trackErr) throw trackErr;

      const templateTasks = templateForRight(right.code).map((title) => ({
        user_id: profile.id,
        tracked_right_id: (trackedRow as { id: string }).id,
        title,
        status: 'todo' as const,
        is_custom: false,
      }));
      if (templateTasks.length > 0) {
        const { error: taskErr } = await supabase.from('user_tasks').insert(templateTasks);
        if (taskErr) throw taskErr;
      }

      setTrackedIds((prev) => new Set(prev).add(right.right_id));
      navigate('/tracker');
    } catch (err) {
      console.error('Error adding right to tracker:', err);
    } finally {
      setBusyId(null);
    }
  };

  useEffect(() => {
    async function fetchRights() {
      if (!session || !profile) {
        setLoading(false);
        return;
      }

      try {
        const [{ data, error }, { data: tracked, error: trackErr }] = await Promise.all([
          supabase.from('user_eligible_rights').select('*').eq('user_id', profile.id),
          supabase.from('user_tracked_rights').select('right_id').eq('user_id', profile.id),
        ]);

        if (error) throw error;
        if (trackErr) throw trackErr;
        setRights(data || []);
        setTrackedIds(new Set((tracked ?? []).map((t: { right_id: string }) => t.right_id)));
      } catch (err) {
        console.error('Error fetching eligible rights:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRights();
  }, [session, profile]);

  // If user is not logged in, don't show the section at all
  if (!session) return null;

  // We only show it if they completed their profile and have an amputation type
  if (!profile?.amputation_type) return null;

  return (
    <section style={{ maxWidth, margin: '0 auto', padding: '56px 24px 24px' }}>
      <h2
        style={{
          fontSize: 'clamp(22px,2.6vw,28px)',
          color: colors.darkBlue,
          fontWeight: 700,
          margin: '0 0 6px',
        }}
      >
        הזכויות המגיעות לי
      </h2>
      <p style={{ fontSize: 18, color: colors.textMuted, margin: '0 0 28px', maxWidth: 680, lineHeight: 1.5 }}>
        ריכזנו עבורך את הזכויות, ההטבות והקצבאות הרלוונטיות ביותר, המותאמות אישית למצבך הרפואי והתפקודי ולגורם המטפל שלך.
      </p>

      {loading ? (
        <div style={{ color: colors.textMuted, fontSize: 16 }}>טוען את הזכויות שלך...</div>
      ) : rights.length === 0 ? (
        <div style={{ padding: '24px', background: colors.blueTint, borderRadius: 12, color: colors.darkBlue }}>
          לא מצאנו זכויות מותאמות אישית כרגע. אנא פנה/י לעוזר הדיגיטלי למידע נוסף.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
            gap: 12,
          }}
        >
          {rights.map((r) => (
            <PersonalizedCard key={r.right_id}>
              <Tag>{r.provider_authority}</Tag>
              <span style={{ fontSize: 18, fontWeight: 700, color: colors.darkBlue, lineHeight: 1.3 }}>
                {r.title}
              </span>
              <span
                style={{
                  fontSize: 15,
                  color: colors.textMuted,
                  lineHeight: 1.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {r.description}
              </span>
              <div
                style={{
                  marginTop: 'auto',
                  display: 'flex',
                  gap: 10,
                  flexWrap: 'wrap',
                  alignItems: 'center',
                }}
              >
                <AddToTrackerButton
                  tracked={trackedIds.has(r.right_id)}
                  busy={busyId === r.right_id}
                  onAdd={() => addToTracker(r)}
                  onGo={() => navigate('/tracker')}
                />
                <AskButton onClick={() => askAboutRight(r)} />
              </div>
            </PersonalizedCard>
          ))}
        </div>
      )}
    </section>
  );
}
