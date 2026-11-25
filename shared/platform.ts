import type { MicInputMode } from './protocol';

export type CaptureKind = 'loopback' | 'input';

/** Electron's display-media loopback token is currently Windows-only. */
export function captureKindForPlatform(platform: string): CaptureKind {
  return platform === 'win32' ? 'loopback' : 'input';
}

/** The microphone is either the user's own channel or incoming phone audio. */
export function microphoneChannel(mode: MicInputMode | undefined): 'me' | 'them' {
  return mode === 'phone-speaker' ? 'them' : 'me';
}

/** Defaults apply only to newly created settings; saved user choices win. */
export function defaultHotkeysForPlatform(platform: string): { toggle: string; shot: string } {
  if (platform === 'darwin') {
    return { toggle: 'Command+B', shot: 'Command+Shift+S' };
  }
  return { toggle: 'Control+B', shot: 'Control+Shift+S' };
}

export function whisperExecutionProvidersForPlatform(
  platform: string,
): ('dml' | 'cpu')[] {
  return platform === 'win32' ? ['dml', 'cpu'] : ['cpu'];
}
