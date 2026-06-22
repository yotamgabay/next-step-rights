import { z } from 'zod';
import { amputationTypes } from '../data/rights.js';

/** Reusable field validators shared across auth endpoints. */
const email = z.string().trim().min(1, 'יש להזין אימייל').email('כתובת אימייל לא תקינה');
const password = z.string().min(6, 'הסיסמה צריכה להכיל לפחות 6 תווים');
const phone = z
  .string()
  .trim()
  .refine((value) => value.replace(/\D/g, '').length >= 9, 'מספר טלפון לא תקין');
const age = z.coerce.number().int().min(1, 'יש להזין גיל תקין').max(120, 'יש להזין גיל תקין');

export const amputationTypeSchema = z.enum(amputationTypes);

export const chatRequestSchema = z.object({
  message: z.string().trim().min(1, 'יש להזין הודעה').max(1000),
});
export type ChatRequest = z.infer<typeof chatRequestSchema>;

export const chatResponseSchema = z.object({
  reply: z.string(),
  matched: z.boolean(),
});
export type ChatResponse = z.infer<typeof chatResponseSchema>;

export const loginRequestSchema = z.object({
  email,
  password: z.string().min(1, 'יש להזין סיסמה'),
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const signupRequestSchema = z.object({
  name: z.string().trim().min(1, 'שדה חובה'),
  email,
  phone,
  age,
  amputationType: amputationTypeSchema,
  password,
});
export type SignupRequest = z.infer<typeof signupRequestSchema>;

export const authResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
  }),
});
export type AuthResponse = z.infer<typeof authResponseSchema>;
