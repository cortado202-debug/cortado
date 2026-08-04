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

export interface SoundTone {
  id: string;
  nameAr: string;
  icon: string;
  description: string;
}

export const SOUND_TONES: SoundTone[] = [
  { id: 'cortado_classic', nameAr: 'جرس كورتادو الكلاسيكي', icon: '☕', description: 'جرس متصاعد مميز ودافئ' },
  { id: 'digital_chime', nameAr: 'جرس رقمي حديث', icon: '🔔', description: 'نغمة ديجيتال واضحة وسريعة' },
  { id: 'marimba_soft', nameAr: 'ماريمبا هادئة', icon: '🎶', description: 'نغمات ماريمبا خشبية راقية' },
  { id: 'cash_register', nameAr: 'جرس الكاشير والمبيعات', icon: '💰', description: 'صوت فتح الخزنة والمبيعات' },
  { id: 'coffee_bell', nameAr: 'جرس القهوة الدافئ', icon: '☕', description: 'نغمة هادئة مستوحاة من المقاهي' },
  { id: 'gentle_ping', nameAr: 'تنبيه ناعم مزدوج', icon: '🛎️', description: 'نقرتان ناعمتان وعاليتان الوضوح' },
  { id: 'upbeat_alert', nameAr: 'نغمة سريعة وحيوية', icon: '⚡', description: 'تنبيه حماسي ينبه طاقم العمل' },
  { id: 'crystal_glass', nameAr: 'نغمة بلورية أنيقة', icon: '💎', description: 'صوت زجاجي برّاق ونقي' },
  { id: 'classic_doorbell', nameAr: 'جرس ترحيب كلاسيكي', icon: '🚪', description: 'نغمة دينغ دونغ للترحيب' },
  { id: 'loud_alarm', nameAr: 'تنبيه انتباه قوي', icon: '🚨', description: 'صوت تنبيه مرتفع لأماكن الضوضاء' },
];

const TONE_STORAGE_KEY = 'cortado_notification_tone';

export const getSelectedSoundTone = (): string => {
  try {
    return localStorage.getItem(TONE_STORAGE_KEY) || 'cortado_classic';
  } catch {
    return 'cortado_classic';
  }
};

export const setSelectedSoundTone = (toneId: string): void => {
  try {
    localStorage.setItem(TONE_STORAGE_KEY, toneId);
  } catch (e) {
    console.warn("Failed to save sound tone to localStorage:", e);
  }
};

/**
 * Plays new order alert sound based on selected tone
 */
export const playOrderAlertSound = (specificToneId?: string) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const currentTime = ctx.currentTime;
    const toneId = specificToneId || getSelectedSoundTone();

    let tones: Array<{ freq: number; start: number; duration: number; gain: number; type?: OscillatorType }> = [];

    switch (toneId) {
      case 'digital_chime':
        tones = [
          { freq: 1046.50, start: 0, duration: 0.08, gain: 0.35 },  // C6
          { freq: 1567.98, start: 0.09, duration: 0.10, gain: 0.4 }, // G6
          { freq: 2093.00, start: 0.20, duration: 0.30, gain: 0.45 } // C7
        ];
        break;

      case 'marimba_soft':
        tones = [
          { freq: 392.00, start: 0, duration: 0.18, gain: 0.4, type: 'triangle' },   // G4
          { freq: 493.88, start: 0.12, duration: 0.18, gain: 0.42, type: 'triangle' }, // B4
          { freq: 587.33, start: 0.24, duration: 0.22, gain: 0.45, type: 'triangle' }, // D5
          { freq: 783.99, start: 0.38, duration: 0.40, gain: 0.5, type: 'triangle' }   // G5
        ];
        break;

      case 'cash_register':
        tones = [
          { freq: 1567.98, start: 0, duration: 0.12, gain: 0.4 },  // G6
          { freq: 1975.53, start: 0.08, duration: 0.12, gain: 0.45 }, // B6
          { freq: 2349.32, start: 0.16, duration: 0.45, gain: 0.5 }  // D7
        ];
        break;

      case 'coffee_bell':
        tones = [
          { freq: 440.00, start: 0, duration: 0.2, gain: 0.35 },   // A4
          { freq: 554.37, start: 0.14, duration: 0.22, gain: 0.4 },  // C#5
          { freq: 659.25, start: 0.28, duration: 0.25, gain: 0.42 }, // E5
          { freq: 880.00, start: 0.44, duration: 0.5, gain: 0.45 }   // A5
        ];
        break;

      case 'gentle_ping':
        tones = [
          { freq: 1318.51, start: 0, duration: 0.15, gain: 0.4 },   // E6
          { freq: 1975.53, start: 0.18, duration: 0.35, gain: 0.45 }  // B6
        ];
        break;

      case 'upbeat_alert':
        tones = [
          { freq: 698.46, start: 0, duration: 0.08, gain: 0.35 },   // F5
          { freq: 880.00, start: 0.08, duration: 0.08, gain: 0.4 },   // A5
          { freq: 1046.50, start: 0.16, duration: 0.08, gain: 0.42 }, // C6
          { freq: 1396.91, start: 0.24, duration: 0.35, gain: 0.48 }  // F6
        ];
        break;

      case 'crystal_glass':
        tones = [
          { freq: 1046.50, start: 0, duration: 0.12, gain: 0.3 },   // C6
          { freq: 1318.51, start: 0.10, duration: 0.14, gain: 0.35 },  // E6
          { freq: 1567.98, start: 0.22, duration: 0.16, gain: 0.4 },   // G6
          { freq: 1975.53, start: 0.36, duration: 0.2, gain: 0.42 },   // B6
          { freq: 2093.00, start: 0.52, duration: 0.5, gain: 0.45 }   // C7
        ];
        break;

      case 'classic_doorbell':
        tones = [
          { freq: 783.99, start: 0, duration: 0.35, gain: 0.45 },   // G5 (Ding)
          { freq: 622.25, start: 0.38, duration: 0.60, gain: 0.45 }   // Eb5 (Dong)
        ];
        break;

      case 'loud_alarm':
        tones = [
          { freq: 1000.00, start: 0, duration: 0.1, gain: 0.5, type: 'square' },
          { freq: 1200.00, start: 0.12, duration: 0.1, gain: 0.5, type: 'square' },
          { freq: 1000.00, start: 0.26, duration: 0.1, gain: 0.5, type: 'square' },
          { freq: 1200.00, start: 0.38, duration: 0.25, gain: 0.55, type: 'square' }
        ];
        break;

      case 'cortado_classic':
      default:
        tones = [
          { freq: 659.25, start: 0, duration: 0.14, gain: 0.35 },    // E5
          { freq: 880.00, start: 0.1, duration: 0.16, gain: 0.4 },    // A5
          { freq: 1108.73, start: 0.22, duration: 0.22, gain: 0.45 }, // C#6
          { freq: 1318.51, start: 0.38, duration: 0.55, gain: 0.5 },  // E6
          { freq: 1760.00, start: 0.52, duration: 0.4, gain: 0.3 }    // A6 (sparkle)
        ];
        break;
    }

    tones.forEach(t => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = t.type || 'sine';
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
