// Web Audio Context Singleton for reliable sound playback & unlocking
let audioCtx: AudioContext | null = null;

const getAudioContext = () => {
  try {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  } catch (e) {
    console.warn("Audio Context init warning:", e);
  }
  return audioCtx;
};

/**
 * Plays a high-clarity 4-tone coffee shop bell chime for new incoming orders
 */
export const playOrderAlertSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const currentTime = ctx.currentTime;

    // 4-tone ascending bell chime (E5 -> A5 -> C#6 -> E6 + sparkle accent)
    const tones = [
      { freq: 659.25, start: 0, duration: 0.14, gain: 0.35 },    // E5
      { freq: 880.00, start: 0.1, duration: 0.16, gain: 0.4 },    // A5
      { freq: 1108.73, start: 0.22, duration: 0.22, gain: 0.45 }, // C#6
      { freq: 1318.51, start: 0.38, duration: 0.55, gain: 0.5 },  // E6
      { freq: 1760.00, start: 0.52, duration: 0.4, gain: 0.3 }    // A6 (high sparkle)
    ];

    tones.forEach(t => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(t.freq, currentTime + t.start);

      gainNode.gain.setValueAtTime(t.gain, currentTime + t.start);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + t.start + t.duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(currentTime + t.start);
      osc.stop(currentTime + t.start + t.duration);
    });
  } catch (err) {
    console.warn("Audio chime play error:", err);
  }
};
