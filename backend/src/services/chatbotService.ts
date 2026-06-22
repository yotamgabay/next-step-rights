import { env } from '../config/env.js';
import { HttpError } from '../lib/httpError.js';
import type { ChatResponse } from '../schemas/index.js';

/**
 * Proxy to the external Kol Zchut chatbot.
 *
 * To steer the (general-purpose) bot toward amputee/disability rights, every
 * question is prefixed with a fixed Hebrew instruction plus a compact English
 * profile summary supplied by the client. The combined text is capped at
 * MAX_UPSTREAM_CHARS, trimming the prefix (never the user's question) if needed.
 * The exact payload shape and headers below are required by the upstream API.
 */

/** Upstream hard limit on the question text. */
const MAX_UPSTREAM_CHARS = 300;

/** Instruction prefix; the `(EN): ` data tail is only added when a profile exists. */
const INSTRUCTION = 'אני קטוע גפה, ענה רק על זכויות לקטועי גפה ונכים.';

/** Raw shape of the upstream response (fields are best-effort / optional). */
interface UpstreamResponse {
  llmResult?: unknown;
  docs?: unknown;
  conversationId?: unknown;
}

function hebrewWordCount(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => /[֐-׿]/.test(word)).length;
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

/** Builds the upstream question: instruction + profile context + the message. */
function buildUpstreamText(message: string, profile: string | undefined): string {
  const data = (profile ?? '').trim();
  const head = data ? `${INSTRUCTION} פרופיל(EN): ${data}` : INSTRUCTION;
  // Reserve room for the full message so it is never truncated.
  const maxHead = Math.max(0, MAX_UPSTREAM_CHARS - message.length - 1);
  const trimmedHead = head.length > maxHead ? head.slice(0, maxHead) : head;
  return `${trimmedHead}\n${message}`.slice(0, MAX_UPSTREAM_CHARS);
}

/**
 * Sends a question to the upstream chatbot and returns the answer. `profile` is
 * an optional short English summary of the user (cause, disability %, etc.).
 */
export async function askChatbot(profile: string | undefined, message: string): Promise<ChatResponse> {
  // Validation: Hebrew, at least 3 words.
  if (hebrewWordCount(message) < 3) {
    throw new HttpError(400, 'יש לכתוב שאלה בעברית, באורך של לפחות 3 מילים.');
  }

  const payload = {
    text: buildUpstreamText(message, profile),
    uuid: '',
    referrer: 0,
  };

  console.dir(payload, { depth: null })

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.CHATBOT_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${env.CHATBOT_BASE_URL}${env.CHATBOT_PATH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new HttpError(504, 'העוזר הדיגיטלי לא הגיב בזמן. נסה/י שוב.');
    }
    throw new HttpError(502, 'לא ניתן להתחבר לעוזר הדיגיטלי כרגע.');
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new HttpError(502, `שגיאת מקור (status ${response.status}).`);
  }

  let raw: UpstreamResponse;
  try {
    raw = (await response.json()) as UpstreamResponse;
  } catch {
    throw new HttpError(502, 'תשובת המקור אינה תקינה.');
  }

  return {
    reply: asString(raw.llmResult),
    docs: asArray(raw.docs),
    conversationId: asString(raw.conversationId),
  };
}
