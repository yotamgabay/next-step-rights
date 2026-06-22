import { useState, useEffect, useMemo, type JSX } from 'react';
import { EligibleRights } from '../components/EligibleRights';
import { CardButton, DetailsArrow, Tag } from '../components/Card';
import { RightDetailModal } from '../components/RightDetailModal';
import { supabase } from '../api/supabase';
import { colors, maxWidth } from '../theme';

interface DbRight {
  id: string;
  title: string;
  description: string;
  provider_authority: string;
}

export function Rights(): JSX.Element {
  const [dbRights, setDbRights] = useState<DbRight[]>([]);
  const [selectedRight, setSelectedRight] = useState<DbRight | null>(null);

  useEffect(() => {
    async function fetchRights() {
      const { data } = await supabase.from('rights').select('*');
      if (data) setDbRights(data);
    }
    fetchRights();
  }, []);

  const fewRights = dbRights.slice(0, 4);

  const rightsByAuthority = useMemo(() => {
    const map = new Map<string, DbRight>();
    for (const r of dbRights) {
      if (!r.provider_authority) continue;
      const authorities = r.provider_authority.split('/').map((s) => s.trim()).filter(Boolean);
      for (const auth of authorities) {
        if (!map.has(auth)) {
          map.set(auth, r);
        }
      }
    }
    return Array.from(map.entries()).map(([auth, right]) => ({ auth, right }));
  }, [dbRights]);


  return (
    <>
      <EligibleRights />
      <div style={{ maxWidth, margin: '0 auto', padding: '48px 24px' }}>
        <h1
          style={{
            fontSize: 'clamp(26px,3vw,34px)',
            color: colors.darkBlue,
            fontWeight: 800,
            margin: '0 0 8px',
          }}
        >
          זכויות כלליות
        </h1>
        <p style={{ fontSize: 18, color: colors.textMuted, margin: '0 0 36px', maxWidth: 680, lineHeight: 1.5 }}>
          כל הזכויות מסודרות לפי נושא ולפי גורם מטפל. בחר/י כרטיס כדי לקרוא בפירוט.
        </p>

        {fewRights.length > 0 && (
          <>
            <h2 id="rights-quick" style={{ fontSize: 22, color: colors.headerBlue, fontWeight: 700, margin: '0 0 18px' }}>
              נושאים מרכזיים
            </h2>
            <div
              aria-labelledby="rights-quick"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
                gap: 20,
                marginBottom: 44,
              }}
            >
              {fewRights.map((r) => (
                <CardButton key={r.id} onClick={() => setSelectedRight(r)}>
                  <Tag>{r.provider_authority}</Tag>
                  <span style={{ fontSize: 20, fontWeight: 700, color: colors.darkBlue }}>{r.title}</span>
                  <span style={{ fontSize: 16, color: colors.textMuted, lineHeight: 1.5 }}>{r.description}</span>
                  <DetailsArrow />
                </CardButton>
              ))}
            </div>
          </>
        )}

        {rightsByAuthority.length > 0 && (
          <>
            <h2 id="rights-by-auth" style={{ fontSize: 22, color: colors.headerBlue, fontWeight: 700, margin: '0 0 18px' }}>
              לפי גורם מטפל
            </h2>
            <div
              aria-labelledby="rights-by-auth"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
                gap: 20,
              }}
            >
              {rightsByAuthority.map(({ auth, right }) => (
                <CardButton key={auth} onClick={() => setSelectedRight(right)}>
                  <Tag>{auth}</Tag>
                  <span style={{ fontSize: 20, fontWeight: 700, color: colors.darkBlue, lineHeight: 1.3 }}>
                    {right.title}
                  </span>
                  <span style={{ fontSize: 16, color: colors.textMuted }}>גורם מטפל: {right.provider_authority}</span>
                  <DetailsArrow />
                </CardButton>
              ))}
            </div>
          </>
        )}
      </div>
      <RightDetailModal right={selectedRight} onClose={() => setSelectedRight(null)} />
    </>
  );
}
