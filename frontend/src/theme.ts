/**
 * Design tokens extracted from the source design (NextStep-Rights.dc.html).
 * Components reference these instead of hard-coding hex values so the palette
 * stays consistent and is changeable in one place.
 */
export const colors = {
  headerBlue: '#165D91',
  darkBlue: '#0D3D5E',
  primaryBlue: '#1E7FC3',
  orange: '#F06723',
  orangeDeep: '#C2511A',
  green: '#2E8B3F',

  pageBg: '#F8F8F8',
  sectionBg: '#F4F4F4',
  blueTint: '#EDF5FB',
  blueTintBorder: '#D6E3EF',
  orangeTint: '#FDEBD9',
  orangeTintBorder: '#F6C9A6',
  greenTint: '#DFFAE3',

  text: '#333333',
  textMuted: '#555555',
  textFaint: '#7A7A7A',
  placeholder: '#AAAAAA',

  border: '#DDDDDD',
  borderSoft: '#E4E4E4',

  error: '#C0392B',
  errorBg: '#FDECEA',

  footer: '#3F444B',
  white: '#FFFFFF',
} as const;

export const fontFamily = "'Assistant', 'Noto Sans Hebrew', sans-serif";

/** Max content width used by the header, hero, sections and footer. */
export const maxWidth = 1200;
