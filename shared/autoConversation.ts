import type { AutoConversationSettings, Speaker } from './protocol';
import { isLikelyQuestion } from './textHeuristics';

export const DEFAULT_AUTO_CONVERSATION: AutoConversationSettings = {
  autoTranslateIncoming: true,
  autoReplyIncoming: true,
  replyTrigger: 'allIncoming',
  stableDelayMs: 1200,
  minChars: 4,
};

/** Collapse whitespace so an unchanged transcript has one stable identity. */
export function normalizeAutoText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Decide whether the visible Chinese translation adds information.
 * Mixed-language text is translated; obviously Chinese-only text is not.
 */
export function needsChineseTranslation(text: string): boolean {
  const value = normalizeAutoText(text);
  if (!value) return false;
  const han = value.match(/\p{Script=Han}/gu)?.length ?? 0;
  const latin = value.match(/[A-Za-z]/g)?.length ?? 0;
  if (han === 0 && latin === 0) return false;
  if (latin > 0 && latin >= Math.max(2, han / 2)) return true;
  return han === 0;
}

/** Apply the user's minimum-length and trigger policy for an incoming sentence. */
export function shouldAutoReplyText(
  settings: AutoConversationSettings,
  text: string,
): boolean {
  const value = normalizeAutoText(text);
  if (!settings.autoReplyIncoming || value.length < settings.minChars) return false;
  return settings.replyTrigger === 'allIncoming' || isLikelyQuestion(value);
}

/** Stable identity used to prevent duplicate paid calls after a merge. */
export function autoConversationKey(
  sessionId: string,
  speaker: Speaker,
  text: string,
  segmentId?: number,
): string {
  return `${sessionId}\u0000${speaker}\u0000${segmentId ?? normalizeAutoText(text)}`;
}
