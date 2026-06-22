import { useState, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase';
import { AuthShell, authCardStyle, Divider, OAuthButtons } from '../components/AuthShell';
import { PasswordField, PrimaryButton, TextField } from '../components/Field';
import { collectErrors, loginSchema, type LoginValues } from '../schemas/forms';
import { colors } from '../theme';

export function Login(): JSX.Element {
  const navigate = useNavigate();
  const [values, setValues] = useState<LoginValues>({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const set = (key: keyof LoginValues) => (value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => {
      if (!(key in e)) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  };

  const submit = (): void => {
    const found = collectErrors(loginSchema, values);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    setBusy(true);
    supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })
      .then(({ error }) => {
        if (error) throw error;
        navigate('/');
      })
      .catch(() => setErrors({ password: 'ההתחברות נכשלה, נסה/י שוב' }))
      .finally(() => setBusy(false));
  };

  return (
    <AuthShell maxWidth={440}>
      <div style={{ ...authCardStyle, maxWidth: 440 }}>
        <h1 style={{ fontSize: 28, color: colors.darkBlue, fontWeight: 800, margin: '0 0 6px', textAlign: 'center' }}>
          ברוך/ה שובך
        </h1>
        <p style={{ fontSize: 17, color: colors.textMuted, margin: '0 0 26px', textAlign: 'center' }}>
          התחבר/י כדי להמשיך לזכויות שלך.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <TextField
            label="אימייל"
            type="email"
            ltr
            value={values.email}
            onChange={set('email')}
            placeholder="name@email.com"
            error={errors.email}
          />
          <PasswordField
            label="סיסמה"
            value={values.password}
            onChange={set('password')}
            placeholder="הקלד/י סיסמה"
            error={errors.password}
          />
        </div>

        <div style={{ textAlign: 'left', margin: '14px 0 22px' }}>
          <button onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }} style={{ fontSize: 15, color: colors.headerBlue, fontWeight: 600, textDecoration: 'none' }}>
            שכחת סיסמה?
          </button>
        </div>

        <PrimaryButton onClick={submit} busy={busy}>
          {busy ? 'מתחבר…' : 'התחברות'}
        </PrimaryButton>

        <Divider label="או" />

        <OAuthButtons
          googleLabel="המשך עם Google"
          onGoogle={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
        />

        <p style={{ textAlign: 'center', fontSize: 16, color: colors.textMuted, margin: '26px 0 0' }}>
          אין לך עדיין חשבון?{' '}
          <button
            onClick={() => navigate('/signup')}
            style={{
              background: 'none',
              border: 'none',
              color: colors.headerBlue,
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            להרשמה ›
          </button>
        </p>
      </div>
    </AuthShell>
  );
}
