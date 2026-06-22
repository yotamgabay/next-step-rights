import { useState, type JSX } from 'react';
import { colors } from '../theme';
import { AlertIcon, EyeIcon } from './icons';

function inputStyle(opts: {
  ltr: boolean;
  hasError: boolean;
  focused: boolean;
  paddingInlineStart?: number;
}): React.CSSProperties {
  return {
    width: '100%',
    height: 56,
    border: `1.5px solid ${opts.hasError ? colors.error : opts.focused ? colors.primaryBlue : colors.border}`,
    borderRadius: 8,
    padding: `0 16px`,
    paddingInlineStart: opts.paddingInlineStart ?? 16,
    fontSize: 17,
    color: colors.text,
    background: opts.hasError ? colors.errorBg : opts.focused ? colors.blueTint : colors.white,
    outline: 'none',
    textAlign: opts.ltr ? 'left' : 'right',
  };
}

function FieldError({ message }: { message: string }): JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginTop: 7,
        color: colors.error,
        fontSize: 14,
      }}
    >
      <AlertIcon size={16} color={colors.error} strokeWidth={2.2} />
      <span>{message}</span>
    </div>
  );
}

interface LabelWrapProps {
  label: React.ReactNode;
  children: React.ReactNode;
  error?: string | undefined;
}

function LabelWrap({ label, children, error }: LabelWrapProps): JSX.Element {
  return (
    <label style={{ display: 'block' }}>
      <span
        style={{
          display: 'block',
          fontSize: 16,
          fontWeight: 600,
          color: colors.text,
          marginBottom: 8,
        }}
      >
        {label}
      </span>
      {children}
      {error ? <FieldError message={error} /> : null}
    </label>
  );
}

interface TextFieldProps {
  label: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'tel' | 'number';
  placeholder?: string;
  ltr?: boolean;
  error?: string | undefined;
}

export function TextField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  ltr = false,
  error,
}: TextFieldProps): JSX.Element {
  const [focused, setFocused] = useState(false);
  return (
    <LabelWrap label={label} error={error}>
      <input
        type={type}
        dir={ltr ? 'ltr' : undefined}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={inputStyle({ ltr, hasError: !!error, focused })}
      />
    </LabelWrap>
  );
}

interface PasswordFieldProps {
  label: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string | undefined;
}

export function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  error,
}: PasswordFieldProps): JSX.Element {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  return (
    <LabelWrap label={label} error={error}>
      <div style={{ position: 'relative' }}>
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={inputStyle({ ltr: false, hasError: !!error, focused, paddingInlineStart: 48 })}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label="הצגה או הסתרה של הסיסמה"
          style={{
            position: 'absolute',
            insetInlineStart: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 40,
            height: 40,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.textFaint,
          }}
        >
          <EyeIcon size={22} />
        </button>
      </div>
    </LabelWrap>
  );
}

interface SelectFieldProps {
  label: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder?: string;
  error?: string | undefined;
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = 'בחר/י מהרשימה…',
  error,
}: SelectFieldProps): JSX.Element {
  const [focused, setFocused] = useState(false);
  return (
    <LabelWrap label={label} error={error}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ ...inputStyle({ ltr: false, hasError: !!error, focused }), paddingInlineEnd: 14 }}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </LabelWrap>
  );
}

interface ReadonlyFieldProps {
  label: React.ReactNode;
  value: string;
  ltr?: boolean;
}

export function ReadonlyField({ label, value, ltr = false }: ReadonlyFieldProps): JSX.Element {
  return (
    <LabelWrap label={label}>
      <input
        readOnly
        value={value}
        dir={ltr ? 'ltr' : undefined}
        style={{
          width: '100%',
          height: 56,
          border: `1.5px solid ${colors.border}`,
          borderRadius: 8,
          padding: '0 16px',
          fontSize: 17,
          color: colors.textFaint,
          background: colors.sectionBg,
          outline: 'none',
          textAlign: ltr ? 'left' : 'right',
        }}
      />
    </LabelWrap>
  );
}

interface PrimaryButtonProps {
  onClick: () => void;
  busy?: boolean;
  children: React.ReactNode;
  type?: 'button' | 'submit';
  style?: React.CSSProperties;
}

export function PrimaryButton({
  onClick,
  busy = false,
  children,
  type = 'button',
  style,
}: PrimaryButtonProps): JSX.Element {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={busy}
      style={{
        width: '100%',
        height: 56,
        border: 'none',
        borderRadius: 28,
        background: busy ? colors.disabledControl : colors.primaryBlue,
        color: colors.white,
        fontSize: 18,
        fontWeight: 700,
        cursor: busy ? 'default' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
