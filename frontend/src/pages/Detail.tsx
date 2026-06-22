import type { JSX } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { CheckCircleIcon, CheckIcon } from '../components/icons';
import { topics } from '../data/topics';
import { colors } from '../theme';
import type { TopicId } from '../types';

function isTopicId(value: string | undefined): value is TopicId {
  return value !== undefined && Object.prototype.hasOwnProperty.call(topics, value);
}

export function Detail(): JSX.Element {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isTopicId(id)) {
    return <Navigate to="/rights" replace />;
  }

  const topic = topics[id];
  const cameFromHome =
    typeof location.state === 'object' &&
    location.state !== null &&
    'from' in location.state &&
    (location.state as { from?: unknown }).from === 'home';

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '32px 24px 56px' }}>
      <button
        onClick={() => navigate(cameFromHome ? '/' : '/rights')}
        aria-label={cameFromHome ? 'חזרה לדף הבית' : 'חזרה לכל הזכויות'}
        style={{
          background: 'none',
          border: 'none',
          color: colors.headerBlue,
          fontSize: 16,
          fontWeight: 600,
          cursor: 'pointer',
          padding: 0,
          marginBottom: 22,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        › {cameFromHome ? 'חזרה לדף הבית' : 'חזרה לכל הזכויות'}
      </button>

      <div style={{ background: colors.blueTint, borderRadius: 16, padding: '30px 28px', marginBottom: 28 }}>
        <span
          style={{
            display: 'inline-block',
            background: colors.white,
            color: colors.headerBlue,
            fontSize: 14,
            fontWeight: 600,
            padding: '5px 12px',
            borderRadius: 16,
            marginBottom: 14,
          }}
        >
          {topic.tag}
        </span>
        <h1
          style={{
            fontSize: 'clamp(24px,3vw,32px)',
            color: colors.darkBlue,
            fontWeight: 800,
            margin: '0 0 12px',
            lineHeight: 1.25,
          }}
        >
          {topic.title}
        </h1>
        <p style={{ fontSize: 18, color: colors.text, lineHeight: 1.6, margin: '0 0 18px' }}>{topic.lead}</p>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: colors.white,
            border: `1px solid ${colors.blueTintBorder}`,
            borderRadius: 12,
            padding: '12px 16px',
          }}
        >
          <CheckCircleIcon size={22} color={colors.green} />
          <span style={{ fontSize: 16, color: colors.text }}>
            <strong style={{ color: colors.darkBlue }}>גורם מטפל:</strong> {topic.body}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        {topic.sections.map((section) => (
          <div
            key={section.h}
            style={{
              background: colors.white,
              border: `1px solid ${colors.border}`,
              borderRadius: 12,
              padding: 24,
            }}
          >
            <h2 style={{ fontSize: 21, color: colors.headerBlue, fontWeight: 700, margin: '0 0 16px' }}>
              {section.h}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {section.items.map((item) => (
                <div key={item} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <CheckIcon size={22} color={colors.primaryBlue} strokeWidth={2.2} style={{ flex: 'none', marginTop: 2 }} />
                  <span style={{ fontSize: 17, color: colors.text, lineHeight: 1.55 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: colors.headerBlue, borderRadius: 16, padding: 28, marginTop: 28, textAlign: 'center' }}>
        <p style={{ fontSize: 18, color: colors.white, fontWeight: 600, margin: '0 0 18px', lineHeight: 1.5 }}>
          יש לך שאלה ספציפית על {topic.title}?
        </p>
        <button
          onClick={() => navigate('/chat', { state: { topic: topic.id } })}
          style={{
            height: 54,
            padding: '0 32px',
            border: 'none',
            borderRadius: 27,
            background: colors.orange,
            color: colors.white,
            fontSize: 17,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          שאל/י את העוזר הדיגיטלי
        </button>
      </div>
    </div>
  );
}
