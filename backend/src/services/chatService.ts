import { cannedAnswers, FALLBACK_ANSWER, topics, type TopicId } from '../data/rights.js';
import type { ChatResponse } from '../schemas/index.js';

/**
 * Demo assistant: matches a question against the curated answer bank and falls
 * back to a guidance message otherwise. In the full product this is where a
 * retrieval / LLM-backed answer would be produced from the rights database.
 */
export function answerQuestion(message: string): ChatResponse {
  const normalized = message.trim();
  const hit = cannedAnswers.find((entry) => entry.q === normalized);
  if (hit) {
    return { reply: hit.a, matched: true };
  }
  return { reply: FALLBACK_ANSWER, matched: false };
}

/** Returns the conversational intro for a given rights topic. */
export function introForTopic(topicId: TopicId): ChatResponse {
  return { reply: topics[topicId].chatIntro, matched: true };
}
