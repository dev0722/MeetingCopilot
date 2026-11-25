import { useEffect, useRef } from 'react';
import type { AutoConversationSettings } from '../shared/protocol';
import type { TranscriptSegment } from '../shared/transcript';

export interface StableTranscriptInput {
  sessionId: string;
  segmentId: number;
  text: string;
}

/**
 * Observe finalized transcript updates and emit one stable incoming sentence
 * after the existing transcript merger has stopped changing it.
 *
 * The hook deliberately starts from the transcript present when capture becomes
 * active: old persisted bubbles must not create new paid requests on startup.
 */
export function useAutoConversation(input: {
  active: boolean;
  sessionId: string;
  segments: readonly TranscriptSegment[];
  settings: AutoConversationSettings;
  onStableSegment: (input: StableTranscriptInput) => void;
}): void {
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const seen = useRef(new Map<number, string>());
  const sessionRef = useRef(input.sessionId);
  const wasActive = useRef(false);
  const activatedAt = useRef(0);
  const onStableRef = useRef(input.onStableSegment);
  onStableRef.current = input.onStableSegment;

  useEffect(() => {
    const clearTimers = () => {
      for (const timer of timers.current.values()) clearTimeout(timer);
      timers.current.clear();
    };

    if (!input.active) {
      clearTimers();
      seen.current.clear();
      wasActive.current = false;
      sessionRef.current = input.sessionId;
      return;
    }

    if (!wasActive.current || sessionRef.current !== input.sessionId) {
      clearTimers();
      seen.current = new Map(
        input.segments.map((segment) => [segment.id, segment.text.trim()]),
      );
      sessionRef.current = input.sessionId;
      activatedAt.current = Date.now();
      wasActive.current = true;
      return;
    }

    for (const segment of input.segments) {
      if ((segment.speaker ?? 'them') !== 'them') continue;
      if (segment.endTs < activatedAt.current) continue;
      const text = segment.text.trim();
      if (!text || seen.current.get(segment.id) === text) continue;

      seen.current.set(segment.id, text);
      const previous = timers.current.get(segment.id);
      if (previous) clearTimeout(previous);
      const timer = setTimeout(() => {
        timers.current.delete(segment.id);
        onStableRef.current({
          sessionId: input.sessionId,
          segmentId: segment.id,
          text,
        });
      }, input.settings.stableDelayMs);
      timers.current.set(segment.id, timer);
    }
  }, [
    input.active,
    input.segments,
    input.sessionId,
    input.settings.stableDelayMs,
  ]);

  useEffect(() => () => {
    for (const timer of timers.current.values()) clearTimeout(timer);
    timers.current.clear();
  }, []);
}
