/**
 * Audio synthesis and haptic feedback service for mobile accessibility
 */
class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private audioCtx: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Plays a subtle, pleasing harmonic chime when a sign is committed
   */
  public playCommitSound() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);

      // Mobile Haptic vibration
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(35);
      }
    } catch {
      // Audio not permitted yet
    }
  }

  /**
   * Speaks text using Indian English or Hindi speech synthesis
   */
  public speak(text: string, lang: 'en-IN' | 'hi-IN' = 'en-IN') {
    if (!this.synth || !text.trim()) return;

    try {
      this.synth.cancel(); // cancel previous utterance

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      // Find best regional voice if available
      const voices = this.synth.getVoices();
      const regionalVoice = voices.find(v =>
        v.lang === lang ||
        (lang === 'hi-IN' && (v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi'))) ||
        (lang === 'en-IN' && (v.lang === 'en-IN' || v.name.toLowerCase().includes('india')))
      );

      if (regionalVoice) {
        utterance.voice = regionalVoice;
      }

      this.synth.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const speechService = new SpeechService();
