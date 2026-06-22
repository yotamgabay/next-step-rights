import type { JSX } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { colors, maxWidth } from '../theme';
import { ChatIcon, FileIcon, HomeIcon, UserIcon } from './icons';
import { Logo } from './Logo';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../api/supabase';

type Section = 'home' | 'chat' | 'rights' | 'other';

function sectionFor(pathname: string): Section {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/chat')) return 'chat';
  if (pathname.startsWith('/rights')) return 'rights';
  return 'other';
}

function navButtonStyle(active: boolean): React.CSSProperties {
  return {
    background: active ? 'rgba(255,255,255,.18)' : 'transparent',
    border: 'none',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    padding: '10px 14px',
    borderRadius: 8,
    color: active ? colors.white : 'rgba(255,255,255,.82)',
  };
}

function bottomNavStyle(active: boolean): React.CSSProperties {
  return {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    background: 'none',
    border: 'none',
    borderTop: `3px solid ${active ? colors.primaryBlue : 'transparent'}`,
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
    color: active ? colors.primaryBlue : 'rgba(255,255,255,.55)',
    padding: '0 2px',
    minHeight: 44,
  };
}

function Header(): JSX.Element {
  const navigate = useNavigate();
  const { session } = useAuth();
  const section = sectionFor(useLocation().pathname);
  return (
    <header style={{ background: colors.headerBlue, position: 'relative', flex: 'none' }}>
      <div
        className="app-header-inner"
        style={{
          maxWidth,
          margin: '0 auto',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => navigate('/')}
          aria-label="הצעד הבא — לדף הבית"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <Logo height={44} onDark />
        </button>
        <nav className="desktop-nav" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/')} style={navButtonStyle(section === 'home')}>
            בית
          </button>
          <button onClick={() => navigate('/chat')} style={navButtonStyle(section === 'chat')}>
            העוזר הדיגיטלי
          </button>
          <button onClick={() => navigate('/rights')} style={navButtonStyle(section === 'rights')}>
            הזכויות שלי
          </button>
        </nav>
        <div
          className="app-header-auth"
          style={{ marginInlineStart: 'auto', display: 'flex', gap: 10, flexWrap: 'wrap' }}
        >
          {session ? (
            <button
              onClick={() => supabase.auth.signOut()}
              style={{
                height: 44,
                padding: '0 22px',
                borderRadius: 22,
                border: '1.5px solid rgba(255,255,255,.6)',
                background: 'transparent',
                color: colors.white,
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              התנתקות
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                style={{
                  height: 44,
                  padding: '0 22px',
                  borderRadius: 22,
                  border: '1.5px solid rgba(255,255,255,.6)',
                  background: 'transparent',
                  color: colors.white,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                התחברות
              </button>
              <button
                onClick={() => navigate('/signup')}
                style={{
                  height: 44,
                  padding: '0 22px',
                  borderRadius: 22,
                  border: 'none',
                  background: colors.orange,
                  color: colors.white,
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                הרשמה
              </button>
            </>
          )}
        </div>
      </div>
      <div style={{ height: 3, background: colors.orange }} />
    </header>
  );
}

function Footer(): JSX.Element {
  const navigate = useNavigate();
  const linkStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,.82)',
    fontSize: 16,
    cursor: 'pointer',
    padding: 0,
    textAlign: 'right',
  };
  return (
    <footer style={{ background: colors.footer, color: 'rgba(255,255,255,.82)', flex: 'none' }}>
      <div
        style={{
          maxWidth,
          margin: '0 auto',
          padding: '44px 24px 28px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 36,
          justifyContent: 'space-between',
        }}
      >
        <div style={{ maxWidth: 300 }}>
          <div style={{ marginBottom: 14 }}>
            <Logo height={46} onDark />
          </div>
          <p style={{ fontSize: 16, lineHeight: 1.6, margin: 0, color: 'rgba(255,255,255,.78)' }}>
            הבית של קטועי הגפיים בישראל — כדי שכל אחד יוכל להבין את הזכויות שלו ולממש אותן בקלות.
          </p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 48 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: colors.white, marginBottom: 12 }}>
              ניווט
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={() => navigate('/')} style={linkStyle}>
                בית
              </button>
              <button onClick={() => navigate('/chat')} style={linkStyle}>
                העוזר הדיגיטלי
              </button>
              <button onClick={() => navigate('/rights')} style={linkStyle}>
                הזכויות שלי
              </button>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: colors.white, marginBottom: 12 }}>
              צריך/ה עזרה?
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                fontSize: 16,
                color: 'rgba(255,255,255,.82)',
              }}
            >
              <a
                href="tel:1700554700"
                style={{ color: colors.white, fontWeight: 700, textDecoration: 'none' }}
              >
                טלפון: 1-700-554-700
              </a>
              <span>ימים א׳–ה׳ · 9:00–16:00</span>
              <span>מענה אנושי מצוות הצעד הבא</span>
            </div>
          </div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,.12)' }}>
        <div
          style={{
            maxWidth,
            margin: '0 auto',
            padding: '18px 24px',
            fontSize: 14,
            color: 'rgba(255,255,255,.6)',
            lineHeight: 1.5,
          }}
        >
          © 2026 הצעד הבא · האתר נועד למסירת מידע בלבד ואינו מהווה ייעוץ משפטי או רפואי.
        </div>
      </div>
    </footer>
  );
}

function BottomNav(): JSX.Element {
  const navigate = useNavigate();
  const { session } = useAuth();
  const section = sectionFor(useLocation().pathname);
  return (
    <nav
      className="bottom-nav"
      aria-label="ניווט ראשי"
      style={{
        position: 'fixed',
        bottom: 0,
        insetInline: 0,
        background: colors.footer,
        height: 64,
        zIndex: 60,
        boxShadow: '0 -2px 12px rgba(0,0,0,.18)',
      }}
    >
      <button onClick={() => navigate('/')} style={bottomNavStyle(section === 'home')}>
        <HomeIcon size={24} />
        בית
      </button>
      <button onClick={() => navigate('/chat')} style={bottomNavStyle(section === 'chat')}>
        <ChatIcon size={24} />
        עוזר
      </button>
      <button onClick={() => navigate('/rights')} style={bottomNavStyle(section === 'rights')}>
        <FileIcon size={24} />
        זכויות
      </button>
      {session ? (
        <button onClick={() => supabase.auth.signOut()} style={bottomNavStyle(false)}>
          <UserIcon size={24} />
          יציאה
        </button>
      ) : (
        <button onClick={() => navigate('/login')} style={bottomNavStyle(false)}>
          <UserIcon size={24} />
          כניסה
        </button>
      )}
    </nav>
  );
}

/**
 * Shared chrome wrapper. Header + bottom nav appear on the app sections
 * (home/chat/rights/detail); the footer appears everywhere except chat. The
 * auth screens (login/signup) render without chrome via their own routes.
 */
export function Layout(): JSX.Element {
  const section = sectionFor(useLocation().pathname);
  const showFooter = section === 'home' || section === 'rights';
  return (
    <div
      dir="rtl"
      className="app-pad"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: colors.pageBg,
      }}
    >
      <Header />
      <main style={{ flex: '1 0 auto' }}>
        <Outlet />
      </main>
      {showFooter ? <Footer /> : null}
      <BottomNav />
    </div>
  );
}
