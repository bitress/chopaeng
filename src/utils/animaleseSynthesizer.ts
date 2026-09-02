/**
 * Animalese Voice Synthesizer (Procedural Web Audio Engine)
 * Generates authentic Animal Crossing villager speech for any text string.
 * Simulates vocal formants, pitch micro-modulations, and character personality presets.
 */

export type AnimaleseVoice = 'standard' | 'peppy' | 'cranky' | 'lazy' | 'robot';

export interface AnimaleseOptions {
    voice?: AnimaleseVoice;
    speed?: number;       // 0.5 (slow) to 2.0 (fast)
    pitchMultiplier?: number; // 0.5 (deep) to 1.8 (high)
    volume?: number;      // 0 to 1
}

export interface VoicePreset {
    id: AnimaleseVoice;
    name: string;
    description: string;
    avatar: string;
    basePitch: number;    // Base Hz
    oscType: OscillatorType;
    filterFreq: number;   // Formant filter center Hz
    vibratoSpeed: number;
    vibratoDepth: number;
}

export const VOICE_PRESETS: Record<AnimaleseVoice, VoicePreset> = {
    standard: {
        id: 'standard',
        name: 'Normal (Resident)',
        description: 'Friendly, balanced islander chirp',
        avatar: 'fa-user',
        basePitch: 520,
        oscType: 'triangle',
        filterFreq: 1400,
        vibratoSpeed: 14,
        vibratoDepth: 18,
    },
    peppy: {
        id: 'peppy',
        name: 'Peppy / Stargazer',
        description: 'High-pitched, energetic Celeste & Rosie vibe',
        avatar: 'fa-star',
        basePitch: 780,
        oscType: 'sine',
        filterFreq: 2200,
        vibratoSpeed: 20,
        vibratoDepth: 35,
    },
    cranky: {
        id: 'cranky',
        name: 'Cranky / Nook Inc.',
        description: 'Warm, low-pitched rumble like Tom Nook',
        avatar: 'fa-leaf',
        basePitch: 240,
        oscType: 'sawtooth',
        filterFreq: 850,
        vibratoSpeed: 10,
        vibratoDepth: 12,
    },
    lazy: {
        id: 'lazy',
        name: 'Lazy / The Roost',
        description: 'Mellow, relaxed murmur like Brewster',
        avatar: 'fa-mug-hot',
        basePitch: 310,
        oscType: 'triangle',
        filterFreq: 1050,
        vibratoSpeed: 8,
        vibratoDepth: 15,
    },
    robot: {
        id: 'robot',
        name: 'Beep-Boop / Cephalobot',
        description: 'Retro 8-bit synthesized chip voice',
        avatar: 'fa-robot',
        basePitch: 440,
        oscType: 'square',
        filterFreq: 1800,
        vibratoSpeed: 24,
        vibratoDepth: 45,
    },
};

// Character letter to frequency ratio mapping
const LETTER_PITCH_MAP: Record<string, number> = {
    'a': 1.0,   'b': 0.85,  'c': 1.15,  'd': 0.9,   'e': 1.25,
    'f': 1.05,  'g': 0.8,   'h': 0.95,  'i': 1.45,  'j': 1.1,
    'k': 1.2,   'l': 0.9,   'm': 0.75,  'n': 0.85,  'o': 0.7,
    'p': 1.1,   'q': 1.3,   'r': 0.8,   's': 1.35,  't': 1.25,
    'u': 0.65,  'v': 0.85,  'w': 0.7,   'x': 1.4,   'y': 1.3,
    'z': 0.9,   '0': 0.8,   '1': 0.9,   '2': 1.0,   '3': 1.1,
    '4': 1.2,   '5': 1.3,   '6': 1.2,   '7': 1.1,   '8': 1.0,
    '9': 0.9,   '!': 1.5,   '?': 1.6,   '.': 0.8,   ',': 0.9,
};

let audioCtx: AudioContext | null = null;
let activeOscillators: Array<{ stop: () => void }> = [];
let currentSpeechToken = 0;

function getAudioContext(): AudioContext {
    if (!audioCtx) {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtx = new AudioCtxClass();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

export function stopAnimalese(): void {
    currentSpeechToken++;
    activeOscillators.forEach((osc) => {
        try {
            osc.stop();
        } catch {}
    });
    activeOscillators = [];
}

/**
 * Procedurally speak any text string in Animalese audio!
 */
export async function speakAnimalese(
    text: string,
    options: AnimaleseOptions = {}
): Promise<void> {
    if (!text || typeof window === 'undefined') return;

    stopAnimalese();
    const token = currentSpeechToken;

    const ctx = getAudioContext();
    const voiceId = options.voice || 'standard';
    const preset = VOICE_PRESETS[voiceId] || VOICE_PRESETS.standard;
    const speed = Math.max(0.4, Math.min(2.5, options.speed || 1.0));
    const pitchMultiplier = Math.max(0.4, Math.min(2.5, options.pitchMultiplier || 1.0));
    const volume = Math.max(0, Math.min(1, options.volume !== undefined ? options.volume : 0.7));

    // Base note duration per character (in seconds)
    const charDuration = (0.055 / speed);
    const characters = text.toLowerCase().split('');

    let currentTime = ctx.currentTime + 0.02;

    // Master bus for this sentence
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume * 0.4, currentTime);

    // Formant vocal filter
    const formantFilter = ctx.createBiquadFilter();
    formantFilter.type = 'bandpass';
    formantFilter.frequency.setValueAtTime(preset.filterFreq * pitchMultiplier, currentTime);
    formantFilter.Q.setValueAtTime(3.5, currentTime);

    masterGain.connect(formantFilter);
    formantFilter.connect(ctx.destination);

    for (let i = 0; i < characters.length; i++) {
        if (currentSpeechToken !== token) return; // cancelled

        const char = characters[i];

        if (char === ' ') {
            currentTime += charDuration * 0.8;
            continue;
        }

        if (['.', '!', '?', ',', ';'].includes(char)) {
            currentTime += charDuration * 1.5;
            continue;
        }

        const pitchRatio = LETTER_PITCH_MAP[char] || 1.0;
        const targetFreq = preset.basePitch * pitchRatio * pitchMultiplier;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = preset.oscType;
        osc.frequency.setValueAtTime(targetFreq, currentTime);

        // Micro pitch vibrato
        if (preset.vibratoDepth > 0) {
            osc.frequency.linearRampToValueAtTime(
                targetFreq + (preset.vibratoDepth * (Math.random() > 0.5 ? 1 : -1)),
                currentTime + charDuration * 0.5
            );
        }

        // Fast ADSR Envelope per phoneme
        gain.gain.setValueAtTime(0, currentTime);
        gain.gain.linearRampToValueAtTime(0.8, currentTime + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.001, currentTime + charDuration);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(currentTime);
        osc.stop(currentTime + charDuration + 0.01);

        activeOscillators.push({
            stop: () => {
                try {
                    osc.stop();
                    osc.disconnect();
                } catch {}
            },
        });

        currentTime += charDuration;
    }
}
