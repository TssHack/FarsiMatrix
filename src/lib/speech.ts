// Browser Web Speech API helper for pronunciation

export function playPronunciation(text: string, onEnd?: () => void): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported on this platform');
    return false;
  }

  try {
    // Cancel any previous utterances
    window.speechSynthesis.cancel();

    const clean = text.replace(/^[.\s]+/, '').trim();
    if (!clean) return false;

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'en-US';
    utterance.rate = 0.88; // Slightly relaxed pace for educational clarity
    utterance.pitch = 1.0;

    // Try finding a good English voice
    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find(
      (v) => (v.lang.startsWith('en-US') || v.lang.startsWith('en')) && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || true)
    );
    if (enVoice) {
      utterance.voice = enVoice;
    }

    if (onEnd) {
      utterance.onend = () => onEnd();
      utterance.onerror = () => onEnd();
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error('Speech synthesis error:', err);
    if (onEnd) onEnd();
    return false;
  }
}
