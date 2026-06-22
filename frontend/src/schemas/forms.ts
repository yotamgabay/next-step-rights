import { z } from 'zod';
import { amputationTypes } from '../data/topics';

/**
 * Zod schemas for the auth forms. Error messages are in Hebrew so they can be
 * surfaced directly under each field.
 */

const email = z
  .string()
  .trim()
  .min(1, 'יש להזין אימייל')
  .regex(/^\S+@\S+\.\S+$/, 'כתובת אימייל לא תקינה');

const phone = z
  .string()
  .trim()
  .min(1, 'יש להזין מספר טלפון')
  .refine((value) => value.replace(/\D/g, '').length >= 9, 'מספר טלפון לא תקין');

const age = z
  .string()
  .trim()
  .min(1, 'יש להזין גיל')
  .refine((value) => {
    const n = Number(value);
    return Number.isFinite(n) && n >= 1 && n <= 120;
  }, 'יש להזין גיל תקין');

const amputationType = z.enum(amputationTypes, {
  errorMap: () => ({ message: 'יש לבחור אפשרות' }),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'שדה חובה'),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  name: z.string().trim().min(1, 'שדה חובה'),
  email,
  phone,
  age,
  amputationType,
  password: z.string().min(6, 'הסיסמה צריכה להכיל לפחות 6 תווים'),
});
export type SignupValues = z.infer<typeof signupSchema>;

/** Extra fields collected when completing an OAuth-started signup. */
export const completeProfileSchema = z.object({
  phone,
  age,
  amputationType,
});
export type CompleteProfileValues = z.infer<typeof completeProfileSchema>;

/**
 * Runs a schema and returns a flat record of field -> first error message,
 * keyed by the schema's own field names. Empty object means valid.
 */
export function collectErrors<Schema extends z.ZodType>(
  schema: Schema,
  values: unknown,
): Record<string, string> {
  const result = schema.safeParse(values);
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && errors[key] === undefined) {
      errors[key] = issue.message;
    }
  }
  return errors;
}
