import { useEffect, useRef, useState, type JSX } from 'react';
import { useLocation } from 'react-router-dom';
import { z } from 'zod';
import { ChatIcon, PhoneIcon, SendIcon } from '../components/icons';
import { quickQuestions } from '../data/answers';
import { causeIds, topics } from '../data/topics';
import { useChat } from '../hooks/useChat';
import { colors } from '../theme';
import type { ChatMessage } from '../types';

const navStateSchema = z
  .object({
    query: z.string().optional(),
    topic: z.enum(['medical', 'work', 'road', 'military', 'medrights', 'financial', 'mobility']).optional(),
  })
  .nullable();

function Bubble({ message }: { message: ChatMessage }): JSX.Element {
  const bot = message.role === 'bot';
  return (
    <div style={{ display: 'flex', justifyContent: bot ? 'flex-start' : 'flex-end' }}>
      <div
        style={{
          maxWidth: '80%',
          background: bot ? colors.sectionBg : colors.primaryBlue,
          color: bot ? colors.text : colors.white,
          borderRadius: bot ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
          padding: '15px 19px',
          fontSize: 18,
          lineHeight: 1.55,
        }}
      >
        {message.text}
      </div>
    </div>
  );
}

function TypingDots(): JSX.Element {
  const dot: React.CSSProperties = {
    width: 9,
    height: 9,
    borderRadius: '50%',
    background: colors.primaryBlue,
  };
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
      <div
        style={{
          background: colors.sectionBg,
          borderRadius: '14px 14px 14px 4px',
          padding: '16px 20px',
          display: 'flex',
          gap: 6,
          alignItems: 'center',
        }}
      >
        <span style={{ ...dot, animation: 'blink 1.2s infinite' }} />
        <span style={{ ...dot, animation: 'blink 1.2s infinite .2s' }} />
        <span style={{ ...dot, animation: 'blink 1.2s infinite .4s' }} />
      </div>
    </div>
  );
}

export function Chat(): JSX.Element {
  const { messages, typing, send, sendCategory } = useChat();
  const [input, setInput] = useState('');
  const location = useLocation();
  const logRef = useRef<HTMLDivElement>(null);
  const handledNav = useRef(false);

  // Handle an inbound query/topic from the home hero or a detail page, once.
  useEffect(() => {
    if (handledNav.current) return;
    handledNav.current = true;
    const parsed = navStateSchema.safeParse(location.state);
    if (!parsed.success || !parsed.data) return;
    if (parsed.data.query) send(parsed.data.query);
    else if (parsed.data.topic) sendCategory(parsed.data.topic);
  }, [location.state, send, sendCategory]);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  const submit = (e: React.FormEvent): void => {
    e.preventDefault();
    send(input);
    setInput('');
  };

  const expanded = messages.length <= 1;

  return (
    <div style={{ background: colors.pageBg }}>
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '24px 16px 40px' }}>
        <div
          style={{
            background: colors.white,
            border: `1px solid ${colors.border}`,
            borderRadius: 14,
            padding: '18px 22px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginBottom: 16,
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: colors.headerBlue,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 'none',
            }}
          >
            <ChatIcon size={26} color={colors.white} />
          </span>
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 19, fontWeight: 700, color: colors.darkBlue }}>העוזר הדיגיטלי</div>
            <div style={{ fontSize: 15, color: colors.textFaint }}>
              עונה על שאלות בנושא זכויות קטועי גפיים
            </div>
          </div>
        </div>

        <div
          ref={logRef}
          role="log"
          aria-live="polite"
          style={{
            background: colors.white,
            border: `1px solid ${colors.border}`,
            borderRadius: 16,
            padding: 22,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            minHeight: 280,
            maxHeight: 'min(56vh,540px)',
            overflowY: 'auto',
          }}
        >
          {messages.map((m, i) => (
            <Bubble key={i} message={m} />
          ))}
          {typing ? <TypingDots /> : null}
        </div>

        <div style={{ marginTop: 20 }}>
          <div
            style={{
              fontSize: expanded ? 16 : 15,
              fontWeight: 700,
              color: expanded ? colors.textMuted : colors.textFaint,
              marginBottom: 10,
            }}
          >
            {expanded ? 'שאלות נפוצות:' : 'שאלות נוספות:'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: expanded ? 10 : 8 }}>
            {quickQuestions.map((s) => (
              <button
                key={s.q}
                onClick={() => send(s.q)}
                style={{
                  background: colors.white,
                  border: `1.5px solid ${colors.blueTintBorder}`,
                  color: colors.headerBlue,
                  fontSize: expanded ? 16 : 15,
                  fontWeight: 600,
                  padding: expanded ? '11px 18px' : '9px 14px',
                  borderRadius: 22,
                  cursor: 'pointer',
                  textAlign: 'right',
                }}
              >
                {s.q}
              </button>
            ))}
          </div>
        </div>

        {expanded ? (
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: colors.textMuted, marginBottom: 10 }}>
              או לפי סוג הקטיעה:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {causeIds.map((id) => (
                <button
                  key={id}
                  onClick={() => sendCategory(id)}
                  style={{
                    background: colors.orangeTint,
                    border: `1.5px solid ${colors.orangeTintBorder}`,
                    color: colors.orangeDeep,
                    fontSize: 16,
                    fontWeight: 600,
                    padding: '11px 18px',
                    borderRadius: 22,
                    cursor: 'pointer',
                    textAlign: 'right',
                  }}
                >
                  {topics[id].title}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <form
          onSubmit={submit}
          className="chat-input"
          style={{
            position: 'sticky',
            bottom: 16,
            marginTop: 22,
            display: 'flex',
            gap: 10,
            background: colors.white,
            border: `1.5px solid ${colors.blueTintBorder}`,
            borderRadius: 18,
            padding: 9,
            boxShadow: '0 8px 26px rgba(13,61,94,.12)',
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label="כתיבת שאלה לעוזר הדיגיטלי"
            placeholder="כתוב/כתבי את השאלה שלך כאן…"
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
            שליחה
          </button>
        </form>

        <div
          style={{
            marginTop: 16,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px 18px',
            alignItems: 'center',
            justifyContent: 'center',
            background: colors.blueTint,
            borderRadius: 12,
            padding: '14px 18px',
          }}
        >
          <span style={{ fontSize: 16, color: colors.headerBlue, fontWeight: 600 }}>
            מעדיף/ה לדבר עם אדם מהצוות?
          </span>
          <a
            href="tel:030000000"
            style={{
              fontSize: 16,
              color: colors.headerBlue,
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <PhoneIcon size={18} color={colors.headerBlue} />
            התקשרו: 03-0000000
          </a>
        </div>

        <p
          style={{
            fontSize: 14,
            color: colors.textFaint,
            textAlign: 'center',
            margin: '14px 0 0',
            lineHeight: 1.5,
          }}
        >
          זהו אזור הדגמה. בגרסה המלאה העוזר מבוסס על מאגר הזכויות המעודכן ואינו מהווה ייעוץ משפטי.
        </p>
      </div>
    </div>
  );
}
