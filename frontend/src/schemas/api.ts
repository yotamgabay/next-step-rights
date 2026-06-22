import { z } from 'zod';

/** Schemas describing the backend responses, used to validate fetched data. */

export const chatResponseSchema = z.object({
  reply: z.string(),
  matched: z.boolean(),
});
export type ChatResponseDto = z.infer<typeof chatResponseSchema>;

export const authResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
  }),
});
export type AuthResponseDto = z.infer<typeof authResponseSchema>;

export const apiErrorSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  fields: z.record(z.array(z.string())).optional(),
});
export type ApiErrorDto = z.infer<typeof apiErrorSchema>;
