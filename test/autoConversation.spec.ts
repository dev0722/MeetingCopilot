import { describe, expect, it } from 'vitest';
import {
  autoConversationKey,
  DEFAULT_AUTO_CONVERSATION,
  needsChineseTranslation,
  shouldAutoReplyText,
} from '../shared/autoConversation';

describe('automatic conversation policy', () => {
  it('translates English and mixed text but not Chinese-only text', () => {
    expect(needsChineseTranslation('Could you introduce your project?')).toBe(true);
    expect(needsChineseTranslation('这是 API 设计问题')).toBe(true);
    expect(needsChineseTranslation('你能介绍一下你的项目吗？')).toBe(false);
    expect(needsChineseTranslation('12345')).toBe(false);
  });

  it('supports all-final-sentence and question-only triggers', () => {
    expect(shouldAutoReplyText(
      { ...DEFAULT_AUTO_CONVERSATION, replyTrigger: 'allIncoming' },
      'This is a statement.',
    )).toBe(true);
    expect(shouldAutoReplyText(
      { ...DEFAULT_AUTO_CONVERSATION, replyTrigger: 'questionsOnly' },
      'This is a statement.',
    )).toBe(false);
    expect(shouldAutoReplyText(
      { ...DEFAULT_AUTO_CONVERSATION, replyTrigger: 'questionsOnly' },
      'Could you explain the architecture?',
    )).toBe(true);
  });

  it('rejects disabled replies, short fragments and normalized duplicates', () => {
    expect(shouldAutoReplyText(
      { ...DEFAULT_AUTO_CONVERSATION, autoReplyIncoming: false },
      'Could you explain this?',
    )).toBe(false);
    expect(shouldAutoReplyText(DEFAULT_AUTO_CONVERSATION, 'ok')).toBe(false);
    expect(autoConversationKey('s1', 'them', 'Hello   world'))
      .toBe(autoConversationKey('s1', 'them', ' Hello world '));
    expect(autoConversationKey('s1', 'them', 'Hello'))
      .not.toBe(autoConversationKey('s2', 'them', 'Hello'));
  });
});
