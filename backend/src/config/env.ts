import { z } from 'zod';

/**
 * Validates process environment at startup so the rest of the service can rely
 * on a typed, present configuration object instead of reading process.env ad hoc.
 */
const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  CORS_ORIGIN: z
    .string()
    .default('http://localhost:5173')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0),
    ),
  /** Base origin of the upstream Kol Zchut chatbot. */
  CHATBOT_BASE_URL: z.string().url().default('https://www.kolzchut.org.il'),
  /** REST path for the chatbot question endpoint. */
  CHATBOT_PATH: z.string().default('/w/he/rest.php/kzchatbot/v0/question'),
  /** Upstream request timeout in milliseconds. */
  CHATBOT_TIMEOUT_MS: z.coerce.number().int().positive().default(20000),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
