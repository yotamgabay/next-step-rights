import type { z } from 'zod';
import {
  authResponseSchema,
  chatResponseSchema,
  type AuthResponseDto,
  type ChatResponseDto,
} from '../schemas/api';
import type { LoginValues, SignupValues } from '../schemas/forms';

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * POSTs JSON and validates the response against `schema`. Throws ApiError on a
 * non-OK status or a response that does not match the expected shape.
 */
async function postJson<Schema extends z.ZodType>(
  path: string,
  body: unknown,
  schema: Schema,
): Promise<z.infer<Schema>> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError('לא ניתן להתחבר לשרת', 0);
  }

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError('הבקשה נכשלה', response.status);
  }

  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new ApiError('תשובת השרת אינה תקינה', response.status);
  }
  return parsed.data;
}

export const api = {
  sendChat(message: string): Promise<ChatResponseDto> {
    return postJson('/chat', { message }, chatResponseSchema);
  },
  login(values: LoginValues): Promise<AuthResponseDto> {
    return postJson('/auth/login', values, authResponseSchema);
  },
  signup(values: SignupValues): Promise<AuthResponseDto> {
    return postJson('/auth/signup', values, authResponseSchema);
  },
};
