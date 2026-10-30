// Pronunciation engine: device text-to-speech first, recorded dictionary audio as a fallback.
// Hardened for mobile PWAs (Android Chrome / iOS Safari standalone), where plain speechSynthesis
// frequently stays silent.

export const SPEECH_UNAVAILABLE_EVENT = 'farsimatrix:speech-unavailable';

const SILENT_WAV = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
const RECORDING_TIMEOUT_MS = 3000;
const TTS_START_TIMEOUT_MS = 2000;
const RECORDING_RETRY_AFTER_MS = 60_000;

let initialized = false;
let audio: HTMLAudioElement | null = null;
let englishVoice: SpeechSynthesisVoice | null = null;
let voicesLoaded = false;
// Chrome garbage-collects utterances that are not referenced, which silently drops their events.
let currentUtterance: SpeechSynthesisUtterance | null = null;
let playToken = 0;
// Remember what failed this session so a broken method costs its timeout only once
let deviceVoiceBroken = false;
let recordingsFailedAt = 0;

function getSynth(): SpeechSynthesis | null {
  return typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
}

function getAudio(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio();
    audio.preload = 'auto';
  }
  return audio;
}

function refreshVoices() {
  const synth = getSynth();
  if (!synth) return;
  const voices = synth.getVoices();
  if (voices.length === 0) return;
  voicesLoaded = true;
  const score = (v: SpeechSynthesisVoice) =>
    (v.lang.replace('_', '-').toLowerCase() === 'en-us' ? 4 : 0) +
    (/google|natural|neural|enhanced|premium|samantha|siri/i.test(v.name) ? 3 : 0) +
    (v.localService ? 1 : 0);
  englishVoice = voices.filter((v) => /^en([-_]|$)/i.test(v.lang)).sort((a, b) => score(b) - score(a))[0] ?? null;
}

/** Call once on app start: loads voices and unlocks audio on the first user gesture (required on iOS). */
export function initSpeech(): void {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  const synth = getSynth();
  if (synth) {
    refreshVoices();
    synth.addEventListener?.('voiceschanged', refreshVoices);
  }

  const unlock = () => {
    window.removeEventListener('pointerdown', unlock, true);
    window.removeEventListener('keydown', unlock, true);
    const a = getAudio();
    a.src = SILENT_WAV;
    a.play().catch(() => undefined);
  };
  window.addEventListener('pointerdown', unlock, true);
  window.addEventListener('keydown', unlock, true);

  // Android Chrome can leave synthesis paused after the PWA was backgrounded
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) getSynth()?.resume();
  });
}

function recordingSources(text: string): string[] {
  const word = text.toLowerCase();
  const sources: string[] = [];
  if (/^[a-z][a-z'-]*$/.test(word)) {
    sources.push(`https://ssl.gstatic.com/dictionary/static/sounds/oxford/${encodeURIComponent(word)}--_us_1.mp3`);
  }
  sources.push(`https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&type=2`);
  return sources;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      }
    );
  });
}

async function playRecording(text: string, token: number): Promise<boolean> {
  const a = getAudio();
  for (const url of recordingSources(text)) {
    if (token !== playToken) return true;
    try {
      a.pause();
      a.src = url;
      await withTimeout(a.play(), RECORDING_TIMEOUT_MS);
      await new Promise<void>((resolve) => {
        const done = () => {
          ['ended', 'pause', 'emptied', 'error'].forEach((ev) => a.removeEventListener(ev, done));
          resolve();
        };
        ['ended', 'pause', 'emptied', 'error'].forEach((ev) => a.addEventListener(ev, done));
      });
      return true;
    } catch {
      // try the next source
    }
  }
  a.pause();
  return false;
}

function speakWithDevice(text: string, afterCancel: boolean): Promise<boolean> {
  const synth = getSynth();
  if (!synth || typeof SpeechSynthesisUtterance === 'undefined') return Promise.resolve(false);
  if (voicesLoaded && !englishVoice) return Promise.resolve(false); // no English voice installed on this device

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = englishVoice?.lang ?? 'en-US';
    if (englishVoice) utterance.voice = englishVoice;
    utterance.rate = 0.9;
    currentUtterance = utterance;

    let started = false;
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(watchdog);
      if (currentUtterance === utterance) currentUtterance = null;
      resolve(ok);
    };
    // Some Android devices expose speechSynthesis but never start speaking
    const watchdog = setTimeout(() => {
      if (!started) {
        synth.cancel();
        finish(false);
      }
    }, TTS_START_TIMEOUT_MS);

    utterance.onstart = () => {
      started = true;
    };
    utterance.onend = () => finish(true);
    utterance.onerror = (e) => finish(started || e.error === 'interrupted' || e.error === 'canceled');

    synth.resume();
    // Android Chrome drops an utterance queued in the same tick as cancel()
    if (afterCancel) setTimeout(() => synth.speak(utterance), 80);
    else synth.speak(utterance);
  });
}

function deviceVoiceUsable(): boolean {
  return !!getSynth() && !deviceVoiceBroken && !(voicesLoaded && !englishVoice);
}

function recordingsUsable(): boolean {
  const online = typeof navigator === 'undefined' || navigator.onLine !== false;
  return online && Date.now() - recordingsFailedAt > RECORDING_RETRY_AFTER_MS;
}

/** Pronounce an English word or phrase. `onEnd` fires once playback finishes or fails. */
export function playPronunciation(text: string, onEnd?: () => void): void {
  const clean = text.replace(/^[^a-zA-Z0-9À-￿]+/, '').trim();
  if (typeof window === 'undefined' || !clean) {
    onEnd?.();
    return;
  }
  initSpeech();

  const token = ++playToken;
  const synth = getSynth();
  const synthBusy = !!synth && (synth.speaking || synth.pending);
  if (synthBusy) synth.cancel();
  audio?.pause();

  (async () => {
    let ok = false;
    // 1) Device voice: instant and offline. 2) Recorded dictionary audio when the device can't speak.
    if (deviceVoiceUsable()) {
      ok = await speakWithDevice(clean, synthBusy);
      if (!ok && token === playToken) deviceVoiceBroken = true;
    }
    if (!ok && token === playToken && recordingsUsable()) {
      ok = await playRecording(clean, token);
      if (!ok) recordingsFailedAt = Date.now();
    }
    if (!ok && token === playToken) window.dispatchEvent(new Event(SPEECH_UNAVAILABLE_EVENT));
    if (token === playToken) onEnd?.();
  })();
}

/** True once the user has interacted with the page — mobile browsers block sound before that. */
export function canAutoplaySound(): boolean {
  if (typeof navigator === 'undefined') return false;
  const activation = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
  return activation ? activation.hasBeenActive : true;
}
