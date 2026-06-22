import type { JSX } from 'react';
import { EligibleRights } from '../components/EligibleRights';
import { useNavigate } from 'react-router-dom';
import { CardButton, DetailsArrow, Tag } from '../components/Card';
import { causeIds, quickIds, topics } from '../data/topics';
import { colors, maxWidth } from '../theme';
import type { TopicId } from '../types';

export function Rights(): JSX.Element {
  const navigate = useNavigate();
  const openTopic = (id: TopicId): void => navigate(`/rights/${id}`, { state: { from: 'rights' } });

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
        הזכויות שלי
      </h1>
      <p style={{ fontSize: 18, color: colors.textMuted, margin: '0 0 36px', maxWidth: 680, lineHeight: 1.5 }}>
        כל הזכויות מסודרות לפי נושא ולפי סוג הקטיעה. בחר/י כרטיס כדי לקרוא בפירוט.
      </p>

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
        {quickIds.map((id) => {
          const topic = topics[id];
          return (
            <CardButton key={id} onClick={() => openTopic(id)}>
              <Tag>{topic.tag}</Tag>
              <span style={{ fontSize: 20, fontWeight: 700, color: colors.darkBlue }}>{topic.title}</span>
              <span style={{ fontSize: 16, color: colors.textMuted, lineHeight: 1.5 }}>{topic.lead}</span>
              <DetailsArrow />
            </CardButton>
          );
        })}
      </div>

      <h2 id="rights-causes" style={{ fontSize: 22, color: colors.headerBlue, fontWeight: 700, margin: '0 0 18px' }}>
        לפי סוג הקטיעה
      </h2>
      <div
        aria-labelledby="rights-causes"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
          gap: 20,
        }}
      >
        {causeIds.map((id) => {
          const topic = topics[id];
          return (
            <CardButton key={id} onClick={() => openTopic(id)}>
              <Tag>{topic.tag}</Tag>
              <span style={{ fontSize: 20, fontWeight: 700, color: colors.darkBlue, lineHeight: 1.3 }}>
                {topic.title}
              </span>
              <span style={{ fontSize: 16, color: colors.textMuted }}>גורם מטפל: {topic.body}</span>
              <DetailsArrow />
            </CardButton>
          );
        })}
      </div>
      </div>
    </>
  );
}
