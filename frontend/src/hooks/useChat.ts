import { useCallback, useState } from 'react';
import { api, ApiError } from '../api/client';
import { CHAT_GREETING } from '../data/answers';
import { topics } from '../data/topics';
import { useAuth, type UserProfile } from './useAuth';
import type { ChatMessage, TopicId } from '../types';

const GENERIC_ERROR =
  'מצטערים, אירעה תקלה זמנית בעוזר הדיגיטלי. אפשר לנסות שוב או להתקשר אלינו לקבלת מענה אנושי.';
const EMPTY_REPLY = 'לא התקבלה תשובה. נסה/י לנסח את השאלה מעט אחרת.';

export interface UseChat {
  messages: ChatMessage[];
  typing: boolean;
  send: (text: string) => void;
  sendCategory: (topicId: TopicId) => void;
}

/**
 * Builds a compact English summary of the user's profile to give the bot
 * context. Kept short (DB enum values are already English) so the server can
 * fit it within the upstream char limit.
 */
function summarizeProfile(profile: UserProfile | null): string | undefined {
  if (!profile) return undefined;
  const parts: string[] = [];
  if (profile.cause) parts.push(`cause:${profile.cause}`);
  if (profile.base_disability_percentage != null) {
    parts.push(`disability:${profile.base_disability_percentage}%`);
  }
  if (profile.prosthetic) parts.push(`prosthetic:${profile.prosthetic}`);
  if (profile.age != null) parts.push(`age:${profile.age}`);
  if (profile.gender) parts.push(`sex:${profile.gender}`);
  return parts.length > 0 ? parts.join(',') : undefined;
}

/**
 * Manages the chat transcript and the round-trip to the backend chatbot proxy.
 * A short English profile summary is forwarded so the bot answers in context.
 */
export function useChat(): UseChat {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'bot', text: CHAT_GREETING }]);
  const [typing, setTyping] = useState(false);

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
      setTyping(true);
      api
        .sendChat(trimmed, summarizeProfile(profile))
        .then((res) => {
          setMessages((prev) => [...prev, { role: 'bot', text: res.reply || EMPTY_REPLY }]);
        })
        .catch((err: unknown) => {
          const text = err instanceof ApiError ? err.message : GENERIC_ERROR;
          setMessages((prev) => [...prev, { role: 'bot', text }]);
        })
        .finally(() => setTyping(false));
    },
    [profile],
  );

  // Category chips ask the chatbot a real question about the chosen topic.
  const sendCategory = useCallback(
    (topicId: TopicId) => send(`אשמח לדעת על ${topics[topicId].title}`),
    [send],
  );

  return { messages, typing, send, sendCategory };
}
