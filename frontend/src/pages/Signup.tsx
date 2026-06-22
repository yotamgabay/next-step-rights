import { useState, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase';
import { AuthShell, authCardStyle, Divider, OAuthButtons } from '../components/AuthShell';
import { PasswordField, PrimaryButton, TextField } from '../components/Field';
import { signupSchema } from '../schemas/forms';
import { colors } from '../theme';

interface SignupForm {
  name: string;
  email: string;
  password: string;
}

const emptyForm: SignupForm = {
  name: '',
  email: '',
  password: '',
};

function issuesToErrors(issues: readonly { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && errors[key] === undefined) errors[key] = issue.message;
  }
  return errors;
}

export function Signup(): JSX.Element {
  const navigate = useNavigate();
  const [form, setForm] = useState<SignupForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const set = (key: keyof SignupForm) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => {
      if (!(key in e)) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  };

  const submitForm = (): void => {
    const result = signupSchema.safeParse(form);
    if (!result.success) {
      setErrors(issuesToErrors(result.error.issues));
      return;
    }
    setBusy(true);
    supabase.auth
      .signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.name,
          },
        },
      })
      .then(({ error }) => {
        if (error) throw error;
        // The GlobalAuthGuard in App.tsx redirects to /complete-profile once
        // the user is logged in, where the remaining onboarding details (incl.
        // amputation type) are collected.
      })
      .catch(() => setErrors({ email: 'ההרשמה נכשלה, נסה/י שוב' }))
      .finally(() => setBusy(false));
  };

  return (
    <AuthShell maxWidth={520}>
      <div style={{ ...authCardStyle, maxWidth: 520 }}>
        <h1 style={{ fontSize: 28, color: colors.darkBlue, fontWeight: 800, margin: '0 0 6px', textAlign: 'center' }}>
          יצירת חשבון חדש
        </h1>
        <p style={{ fontSize: 17, color: colors.textMuted, margin: '0 0 24px', textAlign: 'center' }}>
          כמה פרטים כדי שנוכל להתאים לך את הזכויות הנכונות.
        </p>

        <OAuthButtons
          googleLabel="הרשמה מהירה עם Google"
          onGoogle={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
        />

        <Divider label="או הרשמה עם אימייל" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <TextField label="שם מלא" value={form.name} onChange={set('name')} placeholder="ישראל ישראלי" error={errors.name} />
          <TextField
            label="אימייל"
            type="email"
            ltr
            value={form.email}
            onChange={set('email')}
            placeholder="name@email.com"
            error={errors.email}
          />
          <PasswordField
            label="סיסמה"
            value={form.password}
            onChange={set('password')}
            placeholder="בחר/י סיסמה (לפחות 6 תווים)"
            error={errors.password}
          />
        </div>

        <PrimaryButton onClick={submitForm} busy={busy} style={{ marginTop: 24 }}>
          {busy ? 'יוצר חשבון…' : 'יצירת חשבון'}
        </PrimaryButton>
        <p style={{ textAlign: 'center', fontSize: 16, color: colors.textMuted, margin: '22px 0 0' }}>
          כבר יש לך חשבון?{' '}
          <button
            onClick={() => navigate('/login')}
            style={{ background: 'none', border: 'none', color: colors.headerBlue, fontSize: 16, fontWeight: 700, cursor: 'pointer', padding: 0 }}
          >
            להתחברות ›
          </button>
        </p>
      </div>
    </AuthShell>
  );
}
