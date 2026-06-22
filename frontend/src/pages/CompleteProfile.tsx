import { useState, useEffect, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase';
import { AuthShell, authCardStyle } from '../components/AuthShell';
import { PrimaryButton, ReadonlyField, SelectField, TextField } from '../components/Field';
import { CheckCircleIcon } from '../components/icons';
import { amputationTypes } from '../data/topics';
import { completeProfileSchema } from '../schemas/forms';
import { colors } from '../theme';
import { useAuth } from '../hooks/useAuth';

export function CompleteProfile(): JSX.Element {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [form, setForm] = useState({ phone: '', age: '', amputationType: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (profile?.age && profile?.amputation_type) {
      navigate('/');
    }
  }, [user, profile, navigate]);

  const set = (key: keyof typeof form) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => {
      if (!(key in e)) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  };

  const submitComplete = async (): Promise<void> => {
    if (!user) return;
    const result = completeProfileSchema.safeParse(form);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach(i => errs[i.path[0] as string] = i.message);
      setErrors(errs);
      return;
    }
    setBusy(true);
    
    const { error } = await supabase.from('profiles').update({
      phone: form.phone,
      age: parseInt(form.age, 10),
      amputation_type: form.amputationType
    }).eq('id', user.id);

    setBusy(false);
    if (error) {
      setErrors({ phone: 'שגיאה בשמירת הנתונים' });
    } else {
      window.location.href = '/';
    }
  };

  return (
    <AuthShell maxWidth={520}>
      <div style={{ ...authCardStyle, maxWidth: 520 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: colors.greenTint,
            borderRadius: 12,
            padding: '14px 16px',
            marginBottom: 24,
          }}
        >
          <CheckCircleIcon size={24} color={colors.green} strokeWidth={2.2} />
          <span style={{ fontSize: 16, color: colors.green, fontWeight: 600 }}>התחברת בהצלחה</span>
        </div>
        <h1 style={{ fontSize: 26, color: colors.darkBlue, fontWeight: 800, margin: '0 0 6px' }}>כמעט סיימנו!</h1>
        <p style={{ fontSize: 17, color: colors.textMuted, margin: '0 0 24px', lineHeight: 1.5 }}>
          נשלים כמה פרטים כדי שנוכל להתאים לך את הזכויות.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <ReadonlyField label="שם מלא" value={profile?.full_name || user?.user_metadata?.full_name || ''} />
          <ReadonlyField label="אימייל" value={user?.email || ''} ltr />
          <div style={{ height: 1, background: '#EEE', margin: '2px 0' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 18 }}>
            <TextField label="טלפון *" type="tel" ltr value={form.phone} onChange={set('phone')} placeholder="050-0000000" error={errors.phone} />
            <TextField label="גיל *" type="number" ltr value={form.age} onChange={set('age')} placeholder="35" error={errors.age} />
          </div>
          <SelectField
            label="סוג הקטיעה *"
            value={form.amputationType}
            onChange={set('amputationType')}
            options={amputationTypes}
            error={errors.amputationType}
          />
        </div>

        <PrimaryButton onClick={submitComplete} busy={busy} style={{ marginTop: 24 }}>
          {busy ? 'מסיים…' : 'סיום הרשמה'}
        </PrimaryButton>
      </div>
    </AuthShell>
  );
}
