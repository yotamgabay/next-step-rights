import { useEffect, useState, type JSX } from 'react';
import { supabase } from '../api/supabase';
import { useAuth } from '../hooks/useAuth';
import { DetailsArrow, Tag } from './Card';
import { colors, maxWidth } from '../theme';

function PersonalizedCard({ onClick, children }: { onClick: () => void; children: React.ReactNode }): JSX.Element {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      style={{
        textAlign: 'right',
        background: 'linear-gradient(145deg, #ffffff 0%, #f4f9ff 100%)',
        borderTop: `1px solid ${hover ? colors.orange : '#E5EFFF'}`,
        borderBottom: `1px solid ${hover ? colors.orange : '#E5EFFF'}`,
        borderLeft: `1px solid ${hover ? colors.orange : '#E5EFFF'}`,
        borderRight: `4px solid ${colors.orange}`,
        borderRadius: 12,
        padding: 16,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        transition: 'box-shadow .15s, transform .15s, border-color .15s',
        boxShadow: hover ? '0 10px 26px rgba(13,61,94,.12)' : '0 2px 8px rgba(13,61,94,.04)',
        transform: hover ? 'translateY(-3px)' : 'none',
      }}
    >
      {children}
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
  const { session, profile } = useAuth();
  const [rights, setRights] = useState<EligibleRight[]>([]);
  const [loading, setLoading] = useState(true);

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
            <PersonalizedCard key={r.right_id} onClick={() => { }}>
              <Tag>{r.provider_authority}</Tag>
              <span style={{ fontSize: 18, fontWeight: 700, color: colors.darkBlue, lineHeight: 1.3 }}>
                {r.title}
              </span>
              <span style={{ 
                fontSize: 14.5, 
                color: colors.textMuted, 
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>{r.description}</span>
              <DetailsArrow />
            </PersonalizedCard>
          ))}
        </div>
      )}
    </section>
  );
}
