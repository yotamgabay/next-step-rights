import { useState, type JSX } from 'react';
import { EligibleRights } from '../components/EligibleRights';
import { useNavigate } from 'react-router-dom';
import { CardButton, DetailsArrow, Tag } from '../components/Card';
import { ChatDisclaimer } from '../components/ChatDisclaimer';
import {
  CardIcon,
  CheckCircleIcon,
  ClockIcon,
  HeartIcon,
  MobilityIcon,
  SendIcon,
} from '../components/icons';
import { causeIds, topics } from '../data/topics';
import { useAuth } from '../hooks/useAuth';
import { colors, maxWidth } from '../theme';
import type { TopicId } from '../types';
import { authorityName } from '../wizard/wizardData';
import { useWizard } from '../wizard/WizardContext';

interface FeatureCard {
  id: TopicId;
  title: string;
  desc: string;
  icon: JSX.Element;
  iconBg: string;
}

const featureCards: FeatureCard[] = [
  {
    id: 'medrights',
    title: 'זכויות רפואיות',
    desc: 'פרוטזות, מכשירי שיקום, טיפולים והחזרים כספיים.',
    icon: <HeartIcon size={28} color={colors.headerBlue} />,
    iconBg: '#D6EAFA',
  },
  {
    id: 'financial',
    title: 'זכויות כספיות',
    desc: 'קצבאות, מענקים, פטורים והנחות.',
    icon: <CardIcon size={28} color={colors.orangeDeep} />,
    iconBg: colors.orangeTint,
  },
  {
    id: 'mobility',
    title: 'ניידות ונגישות',
    desc: 'תו נכה, רכב, נגישות והתאמות דיור.',
    icon: <MobilityIcon size={28} color={colors.green} />,
    iconBg: colors.greenTint,
  },
];

function ResumeStrip({ onResume }: { onResume: () => void }): JSX.Element {
  return (
    <div style={{ background: colors.orangeTint, borderBottom: `1px solid ${colors.orangeTintBorder}` }}>
      <div
        style={{
          maxWidth,
          margin: '0 auto',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          flexWrap: 'wrap',
        }}
      >
        <ClockIcon size={22} color={colors.orangeDeep} />
        <span
          style={{
            fontSize: 16,
            color: colors.orangeDeep,
            fontWeight: 600,
            flex: 1,
            minWidth: 200,
            lineHeight: 1.45,
          }}
        >
          טרם השלמת את ההתאמה האישית — נשלים כמה פרטים כדי להתאים לך את הזכויות והגורם המטפל.
        </span>
        <button
          onClick={onResume}
          style={{
            height: 42,
            padding: '0 20px',
            border: 'none',
            borderRadius: 21,
            background: colors.orange,
            color: colors.white,
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          להמשך ההתאמה
        </button>
      </div>
    </div>
  );
}

function ProfileStrip({ authName, onEdit }: { authName: string; onEdit: () => void }): JSX.Element {
  return (
    <div style={{ background: colors.blueTint, borderBottom: `1px solid ${colors.blueTintBorder}` }}>
      <div
        style={{
          maxWidth,
          margin: '0 auto',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          flexWrap: 'wrap',
        }}
      >
        <CheckCircleIcon size={22} color={colors.green} strokeWidth={2.2} />
        <span
          style={{
            fontSize: 16,
            color: colors.headerBlue,
            fontWeight: 600,
            flex: 1,
            minWidth: 200,
            lineHeight: 1.45,
          }}
        >
          ההתאמה הושלמה · הגורם המטפל שלך: <strong style={{ color: colors.darkBlue }}>{authName}</strong>
        </span>
        <button
          onClick={onEdit}
          style={{
            background: 'none',
            border: 'none',
            color: colors.headerBlue,
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            padding: '8px 2px',
          }}
        >
          עדכון פרטים ›
        </button>
      </div>
    </div>
  );
}

export function Home(): JSX.Element {
  const navigate = useNavigate();
  const wizard = useWizard();
  const { session, profile } = useAuth();
  const [query, setQuery] = useState('');

  const submit = (e: React.FormEvent): void => {
    e.preventDefault();
    const q = query.trim();
    setQuery('');
    navigate('/chat', q ? { state: { query: q } } : undefined);
  };

  const openTopic = (id: TopicId): void => navigate(`/rights/${id}`, { state: { from: 'home' } });

  // Onboarding completion is driven by the persisted profile, not the ephemeral
  // wizard state (which resets on reload).
  const completed = !!profile?.amputation_type;
  const showResume = !!session && !completed && wizard.skipped;
  const showProfile = completed;
  const authName = authorityName(profile?.cause);

  return (
    <div>
      {showResume ? <ResumeStrip onResume={wizard.resume} /> : null}
      {showProfile ? <ProfileStrip authName={authName} onEdit={wizard.resume} /> : null}

      <section style={{ background: colors.blueTint }}>
        <div style={{ maxWidth: 880, margin: '0 auto', padding: '72px 24px 64px', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-block',
              background: colors.orangeTint,
              color: colors.orangeDeep,
              fontSize: 15,
              fontWeight: 700,
              padding: '7px 16px',
              borderRadius: 20,
              marginBottom: 20,
            }}
          >
            הבית של קטועי הגפיים בישראל
          </div>
          <h1
            style={{
              fontSize: 'clamp(28px,4.4vw,42px)',
              lineHeight: 1.18,
              color: colors.darkBlue,
              fontWeight: 800,
              margin: '0 auto 18px',
              maxWidth: 720,
            }}
          >
            כל הזכויות שלך, במקום אחד וברור
          </h1>
          <p
            style={{
              fontSize: 'clamp(17px,2.2vw,21px)',
              color: colors.text,
              lineHeight: 1.55,
              margin: '0 auto 32px',
              maxWidth: 640,
            }}
          >
            אנחנו כאן כדי לעזור לך להבין מה מגיע לך ואיך לממש את זה — בלי בירוקרטיה מסובכת. שאל/י כל שאלה,
            והעוזר הדיגיטלי יסביר בשפה פשוטה.
          </p>
          <form
            onSubmit={submit}
            style={{
              display: 'flex',
              gap: 10,
              maxWidth: 660,
              margin: '0 auto',
              background: colors.white,
              border: `1.5px solid ${colors.blueTintBorder}`,
              borderRadius: 18,
              padding: 9,
              boxShadow: '0 8px 26px rgba(13,61,94,.10)',
            }}
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              maxLength={150}
              aria-label="כתיבת שאלה לעוזר הדיגיטלי"
              placeholder="לדוגמה: איך מגישים בקשה לפרוטזה?"
              style={{
                flex: '1 1 0',
                minWidth: 0,
                border: 'none',
                height: 50,
                padding: '0 14px',
                fontSize: 18,
                color: colors.text,
                background: 'none',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                flex: 'none',
                height: 50,
                padding: '0 24px',
                border: 'none',
                borderRadius: 25,
                background: colors.primaryBlue,
                color: colors.white,
                fontSize: 17,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <SendIcon size={20} color={colors.white} />
              תן לי יד
            </button>
          </form>
          <p style={{ fontSize: 15, color: colors.textFaint, margin: '14px 0 0' }}>
            אפשר גם לבחור נושא מהרשימה למטה
          </p>
          <ChatDisclaimer style={{ margin: '8px auto 0', maxWidth: 560 }} />
        </div>
      </section>

      <EligibleRights />

      <section style={{ maxWidth, margin: '0 auto', padding: '56px 24px 24px' }}>
        <h2
          style={{
            fontSize: 'clamp(22px,2.6vw,28px)',
            color: colors.darkBlue,
            fontWeight: 700,
            margin: '0 0 6px',
          }}
        >
          במה אפשר לעזור?
        </h2>
        <p style={{ fontSize: 18, color: colors.textMuted, margin: '0 0 28px' }}>
          קיצורי דרך לזכויות הנפוצות ביותר.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))',
            gap: 20,
          }}
        >
          {featureCards.map((card) => (
            <CardButton key={card.id} onClick={() => openTopic(card.id)}>
              <span
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: card.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {card.icon}
              </span>
              <span style={{ fontSize: 21, fontWeight: 700, color: colors.darkBlue }}>{card.title}</span>
              <span style={{ fontSize: 16, color: colors.textMuted, lineHeight: 1.5 }}>{card.desc}</span>
              <DetailsArrow />
            </CardButton>
          ))}
        </div>
      </section>

      <section style={{ background: colors.sectionBg, marginTop: 32 }}>
        <div style={{ maxWidth, margin: '0 auto', padding: '56px 24px' }}>
          <h2
            style={{
              fontSize: 'clamp(22px,2.6vw,28px)',
              color: colors.darkBlue,
              fontWeight: 700,
              margin: '0 0 6px',
            }}
          >
            הזכויות לפי סוג הקטיעה
          </h2>
          <p style={{ fontSize: 18, color: colors.textMuted, margin: '0 0 28px', maxWidth: 680, lineHeight: 1.5 }}>
            הגורם המטפל והזכויות משתנים לפי הנסיבות שבהן אירעה הקטיעה. בחר/י את המצב שמתאים לך:
          </p>
          <div
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
      </section>

      <section style={{ background: colors.headerBlue }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '60px 24px', textAlign: 'center' }}>
          <h2
            style={{
              fontSize: 'clamp(22px,2.8vw,30px)',
              color: colors.white,
              fontWeight: 700,
              margin: '0 0 14px',
            }}
          >
            לא בטוח/ה מאיפה להתחיל?
          </h2>
          <p style={{ fontSize: 19, color: 'rgba(255,255,255,.9)', lineHeight: 1.55, margin: '0 0 28px' }}>
            שאל/י את העוזר הדיגיטלי — הוא יכוון אותך לזכויות שמתאימות בדיוק למצב שלך.
          </p>
          <button
            onClick={() => navigate('/chat')}
            style={{
              height: 56,
              padding: '0 38px',
              border: 'none',
              borderRadius: 28,
              background: colors.orange,
              color: colors.white,
              fontSize: 18,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            פתיחת העוזר הדיגיטלי
          </button>
        </div>
      </section>
    </div>
  );
}
