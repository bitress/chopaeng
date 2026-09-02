/**
 * Animal Crossing: New Horizons 24-Hour Island BGM Dataset
 * Defines audio metadata, moods, and direct streaming URLs from animal-crossing-radio.com
 * Supports Sunny (Normal), Rainy (🌧️), and Snowy (❄️) arrangements for all 24 hours.
 */

export interface HourlyBgmTrack {
    hour: number;          // 0 to 23
    title: string;         // e.g. "5:00 PM"
    period: string;        // "5 PM"
    mood: string;          // e.g. "Upbeat, energetic, golden hour"
    instrument: string;    // e.g. "Acoustic guitar & brass"
    weather: 'sunny' | 'rainy' | 'snowy';
    audioUrls: {
        sunny: string;
        rainy: string;
        snowy: string;
    };
}

const RADIO_BGM_BASE = "https://animal-crossing-radio.com/sounds/New%20Horizons";

export function formatRadioHourPeriod(hour: number): string {
    const h = Math.max(0, Math.min(23, Math.floor(hour)));
    if (h === 0) return "12 AM";
    if (h === 12) return "12 PM";
    if (h < 12) return `${h} AM`;
    return `${h - 12} PM`;
}

export function buildRadioAudioUrls(hour: number): { sunny: string; rainy: string; snowy: string } {
    const period = formatRadioHourPeriod(hour);
    // Normal / Sunny: e.g. "12 AM.mp3" -> "12%20AM.mp3"
    const sunny = `${RADIO_BGM_BASE}/${encodeURIComponent(period)}.mp3`;
    // Snow: e.g. "12 AM ❄️.mp3" -> "12%20AM%20%E2%9D%84%EF%B8%8F.mp3"
    const snowy = `${RADIO_BGM_BASE}/${encodeURIComponent(period + " ❄️")}.mp3`;
    // Rain: e.g. "12 AM 🌧️.mp3" -> "12%20AM%20%F0%9F%8C%A7%EF%B8%8F.mp3"
    const rainy = `${RADIO_BGM_BASE}/${encodeURIComponent(period + " 🌧️")}.mp3`;

    return { sunny, rainy, snowy };
}

export const HOURLY_BGM_TRACKS: HourlyBgmTrack[] = [
    {
        hour: 0,
        title: "12:00 AM (Midnight)",
        period: "12 AM",
        mood: "Calm, mysterious, ambient midnight vibes",
        instrument: "Electric piano & soft synth pads",
        weather: 'sunny',
        audioUrls: buildRadioAudioUrls(0),
    },
    {
        hour: 1,
        title: "1:00 AM",
        period: "1 AM",
        mood: "Quiet, reflective, cozy late night",
        instrument: "Acoustic guitar & bell chimes",
        weather: 'sunny',
        audioUrls: buildRadioAudioUrls(1),
    },
    {
        hour: 2,
        title: "2:00 AM",
        period: "2 AM",
        mood: "Hypnotic, dreamy, deep sleep atmosphere",
        instrument: "Synth marimba & mellow bass",
        weather: 'sunny',
        audioUrls: buildRadioAudioUrls(2),
    },
    {
        hour: 3,
        title: "3:00 AM",
        period: "3 AM",
        mood: "Quirky, quiet, late night wandering",
        instrument: "Odd tempo trombone & pizzicato strings",
        weather: 'sunny',
        audioUrls: buildRadioAudioUrls(3),
    },
    {
        hour: 4,
        title: "4:00 AM",
        period: "4 AM",
        mood: "Pre-dawn serenity, tranquil breeze",
        instrument: "Kalimba & acoustic guitar",
        weather: 'sunny',
        audioUrls: buildRadioAudioUrls(4),
    },
    {
        hour: 5,
        title: "5:00 AM",
        period: "5 AM",
        mood: "Dawn sunrise, hopeful, peaceful awakening",
        instrument: "Gentle acoustic guitar & flute",
        weather: 'sunny',
        audioUrls: buildRadioAudioUrls(5),
    },
    {
        hour: 6,
        title: "6:00 AM",
        period: "6 AM",
        mood: "Morning sunlight, fresh island morning",
        instrument: "Ukulele & bright glockenspiel",
        weather: 'sunny',
        audioUrls: buildRadioAudioUrls(6),
    },
    {
        hour: 7,
        title: "7:00 AM",
        period: "7 AM",
        mood: "Upbeat breakfast time, islanders wake up",
        instrument: "Acoustic bass & whistling melody",
        weather: 'sunny',
        audioUrls: buildRadioAudioUrls(7),
    },
    {
        hour: 8,
        title: "8:00 AM",
        period: "8 AM",
        mood: "Crisp and cheerful morning stroll",
        instrument: "Accordion & percussive woodblocks",
        weather: 'sunny',
        audioUrls: buildRadioAudioUrls(8),
    },
    {
        hour: 9,
        title: "9:00 AM",
        period: "9 AM",
        mood: "Island shops open, busy morning energy",
        instrument: "Playful brass & upright piano",
        weather: 'sunny',
        audioUrls: buildRadioAudioUrls(9),
    },
    {
        hour: 10,
        title: "10:00 AM",
        period: "10 AM",
        mood: "Sunny skies, outdoor crafting & fishing",
        instrument: "Bright steel drum & acoustic strumming",
        weather: 'sunny',
        audioUrls: buildRadioAudioUrls(10),
    },
    {
        hour: 11,
        title: "11:00 AM",
        period: "11 AM",
        mood: "Warm late morning, tropical breeze",
        instrument: "Latin jazz guitar & vibraphone",
        weather: 'sunny',
        audioUrls: buildRadioAudioUrls(11),
    },
    {
        hour: 12,
        title: "12:00 PM (Noon)",
        period: "12 PM",
        mood: "Midday sun, vibrant, joyful lunchtime",
        instrument: "Upbeat brass section & full rhythm",
        weather: 'sunny',
        audioUrls: buildRadioAudioUrls(12),
    },
    {
        hour: 13,
        title: "1:00 PM",
        period: "1 PM",
        mood: "Lazy afternoon, warm sunshine on the beach",
        instrument: "Relaxed guitar chords & organ pads",
        weather: 'sunny',
        audioUrls: buildRadioAudioUrls(13),
    },
    {
        hour: 14,
        title: "2:00 PM",
        period: "2 PM",
        mood: "Casual exploration, catching bugs in summer",
        instrument: "Rhythmic bongo drums & soprano recorder",
        weather: 'sunny',
        audioUrls: buildRadioAudioUrls(14),
    },
    {
        hour: 15,
        title: "3:00 PM",
        period: "3 PM",
        mood: "Teatime, playful melodies, smiling villagers",
        instrument: "Clarinet & bouncy acoustic bass",
        weather: 'sunny',
        audioUrls: buildRadioAudioUrls(15),
    },
    {
        hour: 16,
        title: "4:00 PM",
        period: "4 PM",
        mood: "Late afternoon warmth, golden light",
        instrument: "Smooth electric piano & muted horn",
        weather: 'sunny',
        audioUrls: buildRadioAudioUrls(16),
    },
    {
        hour: 17,
        title: "5:00 PM",
        period: "5 PM",
        mood: "Golden sunset hour, nostalgic, heartwarming",
        instrument: "Rich saxophone & sunset guitar",
        weather: 'sunny',
        audioUrls: buildRadioAudioUrls(17),
    },
    {
        hour: 18,
        title: "6:00 PM",
        period: "6 PM",
        mood: "Dusk arrives, island lanterns light up",
        instrument: "Harmonica & campfire acoustic guitar",
        weather: 'sunny',
        audioUrls: buildRadioAudioUrls(18),
    },
    {
        hour: 19,
        title: "7:00 PM",
        period: "7 PM",
        mood: "Evening relaxation, stars begin to appear",
        instrument: "Mellow Rhodes piano & soft shaker",
        weather: 'sunny',
        audioUrls: buildRadioAudioUrls(19),
    },
    {
        hour: 20,
        title: "8:00 PM",
        period: "8 PM",
        mood: "Cozy nightfall, Celeste stargazing time",
        instrument: "Melodica & warm nylon guitar",
        weather: 'sunny',
        audioUrls: buildRadioAudioUrls(20),
    },
    {
        hour: 21,
        title: "9:00 PM",
        period: "9 PM",
        mood: "Night quiet, evening coffee at The Roost",
        instrument: "Acoustic bass & gentle brushes on snare",
        weather: 'sunny',
        audioUrls: buildRadioAudioUrls(21),
    },
    {
        hour: 22,
        title: "10:00 PM",
        period: "10 PM",
        mood: "Shops closing, peaceful island night",
        instrument: "Vibraphone & acoustic picking",
        weather: 'sunny',
        audioUrls: buildRadioAudioUrls(22),
    },
    {
        hour: 23,
        title: "11:00 PM",
        period: "11 PM",
        mood: "Deep night serenity, shooting stars",
        instrument: "Dreamy piano solo & night ambience",
        weather: 'sunny',
        audioUrls: buildRadioAudioUrls(23),
    },
];

export const getHourlyBgmTrack = (hour: number): HourlyBgmTrack => {
    const normalized = Math.max(0, Math.min(23, Math.floor(hour)));
    return HOURLY_BGM_TRACKS[normalized] || HOURLY_BGM_TRACKS[12];
};
