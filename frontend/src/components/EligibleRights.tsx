import { useEffect, useState, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase';
import { useAuth } from '../hooks/useAuth';
import { Tag } from './Card';
import { ChatIcon } from './icons';
import { colors, maxWidth } from '../theme';

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
 * CTA on each eligible-right card: opens the assistant pre-asked about that
 * right. `marginTop: auto` pins it to the card bottom so buttons line up across
 * a row of unequal-length descriptions.
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
      style={{
        alignSelf: 'flex-start',
        marginTop: 'auto',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        minHeight: 44,
        padding: '12px 20px',
        border: 'none',
        borderRadius: 24,
        // Warm, inviting chip — the single friendly accent on an otherwise calm
        // card. Soft tint at rest, fills to a solid orange with a gentle lift on
        // hover/focus (reduced-motion users get the colour change without travel).
        background: hover ? colors.orange : colors.orangeTint,
        color: hover ? colors.white : colors.orangeDeep,
        fontSize: 15,
        fontWeight: 700,
        cursor: 'pointer',
        transform: hover ? 'translateY(-1px)' : 'none',
        boxShadow: hover ? '0 6px 16px rgba(240,103,35,.28)' : 'none',
        transition: 'background .15s, color .15s, transform .15s, box-shadow .15s',
      }}
    >
      <ChatIcon size={18} color={hover ? colors.white : colors.orangeDeep} />
      שאל/י את העוזר על הזכות
    </button>
  );
}

interface EligibleRight {
  right_id: string;
  title: string;
  description: string;
  provider_authority: string;
}

export function EligibleRights(): JSX.Element | null {
  const navigate = useNavigate();
  const { session, profile } = useAuth();
  const [rights, setRights] = useState<EligibleRight[]>([]);
  const [loading, setLoading] = useState(true);

  // Open the assistant with a question already asked about this right. Chat reads
  // `state.query` on mount and auto-sends it (same path as the home hero search).
  const askAboutRight = (right: EligibleRight): void => {
    const query = `אני רוצה לממש את הזכות "${right.title}" מול ${right.provider_authority}. מה התנאים לקבלת הזכות ואיך מגישים בקשה?`;
    navigate('/chat', { state: { query } });
  };

  useEffect(() => {
    async function fetchRights() {
      if (!session || !profile) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_eligible_rights')
          .select('*')
          .eq('user_id', profile.id);

        if (error) throw error;
        setRights(data || []);
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
              <AskButton onClick={() => askAboutRight(r)} />
            </PersonalizedCard>
          ))}
        </div>
      )}
    </section>
  );
}
