import { chatResponseSchema, type ChatResponseDto } from '../schemas/api';

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

/** Pulls a human-readable message out of the backend error body, if present. */
function errorMessage(data: unknown, fallback: string): string {
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    if (typeof record.message === 'string') return record.message;
    if (typeof record.error === 'string') return record.error;
  }
  return fallback;
}

/** Sends a question to the chatbot proxy. `profile` is a short English context summary. */
export async function sendChat(message: string, profile?: string): Promise<ChatResponseDto> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, profile }),
    });
  } catch {
    throw new ApiError('לא ניתן להתחבר לשרת', 0);
  }

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(errorMessage(data, 'הבקשה נכשלה'), response.status);
  }

  const parsed = chatResponseSchema.safeParse(data);
  if (!parsed.success) {
    throw new ApiError('תשובת השרת אינה תקינה', response.status);
  }
  return parsed.data;
}

export const api = { sendChat };
