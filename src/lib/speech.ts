/**
 * Reusable Text-to-Speech utility for Sparkle Mind Kids.
 * Uses the Web Speech API with child-friendly defaults.
 */

let supported: boolean | null = null;

function isSupported(): boolean {
  if (supported === null) {
    supported = typeof window !== "undefined" && "speechSynthesis" in window;
  }
  return supported;
}

/**
 * Speak the given text aloud.
 * Cancels any in-progress speech before starting.
 */
export function speakText(text: string, rate = 0.85): void {
  if (!isSupported()) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = 1.1;
  utterance.volume = 1;

  window.speechSynthesis.speak(utterance);
}

/** Cancel any in-progress speech. */
export function cancelSpeech(): void {
  if (!isSupported()) return;
  window.speechSynthesis.cancel();
}
