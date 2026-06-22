import type { JSX } from 'react';

export interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

function Stroke({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  style,
  children,
}: IconProps & { children: React.ReactNode }): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const SendIcon = (p: IconProps): JSX.Element => (
  <Stroke {...p}>
    <line x1="20" y1="4" x2="9.5" y2="14.5" />
    <polygon points="20 4 13.5 20 9.5 14.5 4 10.5 20 4" />
  </Stroke>
);

export const HeartIcon = (p: IconProps): JSX.Element => (
  <Stroke {...p}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.5 4.04 3 5.5l7 7Z" />
  </Stroke>
);

export const CardIcon = (p: IconProps): JSX.Element => (
  <Stroke {...p}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <circle cx="12" cy="12" r="3" />
    <line x1="6" y1="12" x2="6.01" y2="12" />
    <line x1="18" y1="12" x2="18.01" y2="12" />
  </Stroke>
);

export const MobilityIcon = (p: IconProps): JSX.Element => (
  <Stroke {...p}>
    <circle cx="12" cy="4.5" r="2" />
    <path d="M12 8v6l4 4" />
    <path d="M12 11l-4 1" />
    <path d="M8 21a5 5 0 0 1 4-8" />
  </Stroke>
);

export const CheckCircleIcon = (p: IconProps): JSX.Element => (
  <Stroke {...p}>
    <path d="M9 12l2 2 4-4" />
    <circle cx="12" cy="12" r="9" />
  </Stroke>
);

export const ClockIcon = (p: IconProps): JSX.Element => (
  <Stroke {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v4l2.5 2" />
  </Stroke>
);

export const ChatIcon = (p: IconProps): JSX.Element => (
  <Stroke {...p}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </Stroke>
);

export const PhoneIcon = (p: IconProps): JSX.Element => (
  <Stroke {...p}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.4 2.1L8 11.5a16 16 0 0 0 6 6l1.1-1.3a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z" />
  </Stroke>
);

export const AlertIcon = (p: IconProps): JSX.Element => (
  <Stroke {...p}>
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="8" x2="12" y2="13" />
    <line x1="12" y1="16.5" x2="12.01" y2="16.5" />
  </Stroke>
);

export const EyeIcon = (p: IconProps): JSX.Element => (
  <Stroke {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </Stroke>
);

export const CheckIcon = (p: IconProps): JSX.Element => (
  <Stroke {...p}>
    <polyline points="20 6 9 17 4 12" />
  </Stroke>
);

/** Chevron pointing left (used for "open" affordance in RTL option rows). */
export const ChevronLeftIcon = (p: IconProps): JSX.Element => (
  <Stroke {...p}>
    <path d="M15 6l-6 6 6 6" />
  </Stroke>
);

/** Arrow used for the wizard "back" control (RTL). */
export const BackArrowIcon = (p: IconProps): JSX.Element => (
  <Stroke {...p}>
    <path d="M5 12h14" />
    <path d="M13 6l6 6-6 6" />
  </Stroke>
);

export const CloseIcon = (p: IconProps): JSX.Element => (
  <Stroke {...p}>
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </Stroke>
);

export const PencilIcon = (p: IconProps): JSX.Element => (
  <Stroke {...p}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </Stroke>
);

export const HomeIcon = (p: IconProps): JSX.Element => (
  <Stroke {...p}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
  </Stroke>
);

export const FileIcon = (p: IconProps): JSX.Element => (
  <Stroke {...p}>
    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
    <path d="M8 13h8M8 17h5" />
  </Stroke>
);

export const UserIcon = (p: IconProps): JSX.Element => (
  <Stroke {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </Stroke>
);

export const GoogleIcon = ({ size = 22, style }: IconProps): JSX.Element => (
  <svg width={size} height={size} viewBox="0 0 48 48" style={style} aria-hidden="true">
    <path
      fill="#4285F4"
      d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
    />
    <path
      fill="#34A853"
      d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
    />
    <path
      fill="#FBBC05"
      d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34A21.99 21.99 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"
    />
    <path
      fill="#EA4335"
      d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
    />
  </svg>
);

export const AppleIcon = ({ size = 20, style }: IconProps): JSX.Element => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#000" style={style} aria-hidden="true">
    <path d="M16.36 12.93c-.02-2.27 1.85-3.36 1.94-3.41-1.06-1.55-2.71-1.76-3.29-1.78-1.4-.14-2.73.82-3.44.82-.71 0-1.8-.8-2.96-.78-1.52.02-2.93.88-3.71 2.24-1.58 2.74-.4 6.79 1.13 9.01.75 1.09 1.64 2.31 2.81 2.27 1.13-.05 1.55-.73 2.92-.73 1.36 0 1.75.73 2.95.71 1.22-.02 1.99-1.11 2.74-2.21.86-1.27 1.22-2.5 1.24-2.56-.03-.01-2.38-.91-2.4-3.61zM14.13 6.16c.62-.76 1.04-1.8.93-2.85-.9.04-1.99.6-2.63 1.35-.57.67-1.08 1.74-.94 2.76 1 .08 2.02-.51 2.64-1.26z" />
  </svg>
);
