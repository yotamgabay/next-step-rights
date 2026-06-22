import { useCallback, useRef, useState } from 'react';
import { api } from '../api/client';
import { CHAT_GREETING } from '../data/answers';
import { topics } from '../data/topics';
import type { ChatMessage, TopicId } from '../types';

const ERROR_REPLY =
  'מצטערים, אירעה תקלה זמנית בעוזר הדיגיטלי. אפשר לנסות שוב או להתקשר אלינו לקבלת מענה אנושי.';

export interface UseChat {
  messages: ChatMessage[];
  typing: boolean;
  send: (text: string) => void;
  sendCategory: (topicId: TopicId) => void;
}

/** Manages the chat transcript, the typing indicator and the backend round-trip. */
export function useChat(): UseChat {
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'bot', text: CHAT_GREETING }]);
  const [typing, setTyping] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushBot = useCallback((text: string) => {
    setMessages((prev) => [...prev, { role: 'bot', text }]);
    setTyping(false);
  }, []);

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
      setTyping(true);
      api
        .sendChat(trimmed)
        .then((res) => pushBot(res.reply))
        .catch(() => pushBot(ERROR_REPLY));
    },
    [pushBot],
  );

  const sendCategory = useCallback(
    (topicId: TopicId) => {
      const topic = topics[topicId];
      setMessages((prev) => [...prev, { role: 'user', text: `אשמח לדעת על: ${topic.title}` }]);
      setTyping(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => pushBot(topic.chatIntro), 500);
    },
    [pushBot],
  );

  return { messages, typing, send, sendCategory };
}
