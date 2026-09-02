import React, { useState, useEffect, useRef } from 'react';
import {
    speakAnimalese,
    stopAnimalese,
    VOICE_PRESETS,
    type AnimaleseVoice,
} from '../../utils/animaleseSynthesizer';
import { playChimeClick } from '../../utils/kkAudioSynthesizer';
import { getStoredTheme, type ThemeMode } from '../../utils/theme';

const SAMPLE_PHRASES = [
    "Yes, yes! Welcome to ChoPaeng Island!",
    "Dodo Airlines flight is now ready for boarding!",
    "One cup of hot coffee with Pigeon Milk, please...",
    "Look! A shooting star is falling over the beach tonight!",
    "I need 40 Royal Crowns and 10 Gold Nuggets, thank you!",
];

const THEME_ACCENTS: Record<ThemeMode, {
    primary: string;
    borderTop: string;
    modalBg: string;
    subtleBg: string;
    borderSubtle: string;
    textColor: string;
    textMuted: string;
    inputBg: string;
    inputBorder: string;
    isDark: boolean;
}> = {
    nook: {
        primary: '#16a34a',
        borderTop: '#16a34a',
        modalBg: '#ffffff',
        subtleBg: '#f8fafc',
        borderSubtle: 'rgba(55, 176, 109, 0.25)',
        textColor: '#1e293b',
        textMuted: '#64748b',
        inputBg: '#ffffff',
        inputBorder: '#cbd5e1',
        isDark: false,
    },
    celeste: {
        primary: '#7c3aed',
        borderTop: '#a78bfa',
        modalBg: '#1e293b',
        subtleBg: '#0f172a',
        borderSubtle: 'rgba(167, 139, 250, 0.3)',
        textColor: '#f8fafc',
        textMuted: '#94a3b8',
        inputBg: '#0f172a',
        inputBorder: 'rgba(167, 139, 250, 0.35)',
        isDark: true,
    },
    roost: {
        primary: '#a06b43',
        borderTop: '#d4a373',
        modalBg: '#292524',
        subtleBg: '#1c1917',
        borderSubtle: 'rgba(217, 119, 6, 0.3)',
        textColor: '#fdf8f5',
        textMuted: '#a8a29e',
        inputBg: '#1c1917',
        inputBorder: 'rgba(212, 163, 115, 0.35)',
        isDark: true,
    },
    sakura: {
        primary: '#ec4899',
        borderTop: '#ec4899',
        modalBg: '#ffffff',
        subtleBg: '#fdf2f8',
        borderSubtle: 'rgba(236, 72, 153, 0.3)',
        textColor: '#4a2040',
        textMuted: '#9d4e7f',
        inputBg: '#ffffff',
        inputBorder: 'rgba(236, 72, 153, 0.35)',
        isDark: false,
    },
    dal: {
        primary: '#0284c7',
        borderTop: '#38bdf8',
        modalBg: '#1e293b',
        subtleBg: '#0f172a',
        borderSubtle: 'rgba(56, 189, 248, 0.3)',
        textColor: '#f8fafc',
        textMuted: '#94a3b8',
        inputBg: '#0f172a',
        inputBorder: 'rgba(56, 189, 248, 0.35)',
        isDark: true,
    },
    nooklink: {
        primary: '#10b981',
        borderTop: '#34d399',
        modalBg: '#111827',
        subtleBg: '#090d16',
        borderSubtle: 'rgba(16, 185, 129, 0.3)',
        textColor: '#f8fafc',
        textMuted: '#94a3b8',
        inputBg: '#090d16',
        inputBorder: 'rgba(16, 185, 129, 0.35)',
        isDark: true,
    },
};

export const AnimaleseVoiceModal: React.FC = () => {
    const [currentTheme, setCurrentTheme] = useState<ThemeMode>(getStoredTheme);
    const [isOpen, setIsOpen] = useState(false);
    const [text, setText] = useState("Yes, yes! Welcome to ChoPaeng Island!");
    const [selectedVoice, setSelectedVoice] = useState<AnimaleseVoice>('standard');
    const [speed, setSpeed] = useState<number>(1.1);
    const [pitch, setPitch] = useState<number>(1.0);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const speechTimerRef = useRef<any>(null);

    useEffect(() => {
        const handleOpen = () => {
            setIsOpen(true);
            playChimeClick();
        };
        const handleThemeUpdate = (e: any) => {
            if (e.detail?.theme) {
                setCurrentTheme(e.detail.theme);
            } else {
                setCurrentTheme(getStoredTheme());
            }
        };

        window.addEventListener('chopaeng_open_animalese_modal', handleOpen);
        window.addEventListener('chopaeng_theme_updated', handleThemeUpdate);

        return () => {
            window.removeEventListener('chopaeng_open_animalese_modal', handleOpen);
            window.removeEventListener('chopaeng_theme_updated', handleThemeUpdate);
        };
    }, []);

    const handlePlay = async () => {
        if (!text.trim()) return;
        playChimeClick();
        setIsSpeaking(true);

        await speakAnimalese(text, {
            voice: selectedVoice,
            speed,
            pitchMultiplier: pitch,
        });

        // Approximate duration
        const durationSec = (text.length * (0.055 / speed) + 0.3) * 1000;
        clearTimeout(speechTimerRef.current);
        speechTimerRef.current = setTimeout(() => {
            setIsSpeaking(false);
        }, durationSec);
    };

    const handleStop = () => {
        clearTimeout(speechTimerRef.current);
        stopAnimalese();
        setIsSpeaking(false);
        playChimeClick();
    };

    if (!isOpen) return null;

    const theme = THEME_ACCENTS[currentTheme] || THEME_ACCENTS.nook;

    return (
        <div
            className="modal-backdrop-custom d-flex align-items-center justify-content-center"
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(6px)',
                zIndex: 1060,
                padding: '1rem',
            }}
            onClick={() => setIsOpen(false)}
        >
            <div
                className="rounded-4 shadow-lg overflow-hidden animate-up border"
                style={{
                    maxWidth: '560px',
                    width: '100%',
                    backgroundColor: theme.modalBg,
                    borderColor: theme.borderSubtle,
                    borderTop: `5px solid ${theme.borderTop}`,
                    color: theme.textColor,
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    className="d-flex align-items-center justify-content-between p-3.5 px-4 border-bottom"
                    style={{
                        backgroundColor: theme.subtleBg,
                        borderColor: theme.borderSubtle,
                    }}
                >
                    <div className="d-flex align-items-center gap-2.5">
                        <div
                            className="rounded-circle d-flex align-items-center justify-content-center shadow-sm text-white"
                            style={{ width: '36px', height: '36px', fontSize: '1rem', backgroundColor: theme.primary }}
                        >
                            <i className="fa-solid fa-comment-dots" />
                        </div>
                        <div>
                            <h6 className="fw-black mb-0 ac-font" style={{ color: theme.textColor }}>
                                Animalese Voice Studio
                            </h6>
                            <small className="fw-bold x-small" style={{ color: theme.textMuted }}>
                                Synthesize authentic Animal Crossing villager speech
                            </small>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="btn-close shadow-none"
                        style={{ filter: theme.isDark ? 'invert(1)' : 'none' }}
                        aria-label="Close"
                    />
                </div>

                {/* Body */}
                <div className="p-4">
                    {/* Voice Presets */}
                    <label className="fw-bold small text-uppercase tracking-wider mb-2 d-block" style={{ color: theme.textMuted }}>
                        Choose Character Voice:
                    </label>
                    <div className="row g-2 mb-3.5">
                        {Object.values(VOICE_PRESETS).map((preset) => {
                            const isSelected = selectedVoice === preset.id;
                            return (
                                <div className="col-6 col-sm-4" key={preset.id}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedVoice(preset.id);
                                            playChimeClick();
                                        }}
                                        className="btn w-100 text-start p-2.5 rounded-3 d-flex flex-column gap-1 transition-all border"
                                        style={{
                                            backgroundColor: isSelected ? theme.primary : theme.subtleBg,
                                            borderColor: isSelected ? theme.primary : theme.borderSubtle,
                                            color: isSelected ? '#ffffff' : theme.textColor,
                                        }}
                                    >
                                        <div className="d-flex align-items-center gap-2">
                                            <i className={`fa-solid ${preset.avatar}`} />
                                            <span className="fw-bold small text-truncate">{preset.name.split('(')[0]}</span>
                                        </div>
                                        <span className="x-small opacity-75" style={{ fontSize: '0.7rem' }}>
                                            {preset.id === 'standard' ? 'Resident' : preset.id === 'peppy' ? 'Celeste' : preset.id === 'cranky' ? 'Tom Nook' : preset.id === 'lazy' ? 'Brewster' : '8-Bit'}
                                        </span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Text Input Area */}
                    <div className="mb-3">
                        <label className="fw-bold small text-uppercase tracking-wider mb-1.5 d-block" style={{ color: theme.textMuted }}>
                            Text to Speak:
                        </label>
                        <textarea
                            className="form-control rounded-3 fw-bold border shadow-sm"
                            rows={3}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Type any message..."
                            style={{
                                fontSize: '0.95rem',
                                backgroundColor: theme.inputBg,
                                borderColor: theme.inputBorder,
                                color: theme.textColor,
                            }}
                        />
                    </div>

                    {/* Quick Phrases */}
                    <div className="mb-3.5">
                        <small className="fw-bold d-block mb-1.5" style={{ fontSize: '0.75rem', color: theme.textMuted }}>
                            Quick Samples:
                        </small>
                        <div className="d-flex flex-wrap gap-1.5">
                            {SAMPLE_PHRASES.map((phrase, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setText(phrase)}
                                    className="btn btn-sm border text-truncate fw-bold rounded-pill"
                                    style={{
                                        maxWidth: '240px',
                                        fontSize: '0.75rem',
                                        backgroundColor: theme.subtleBg,
                                        borderColor: theme.borderSubtle,
                                        color: theme.textColor,
                                    }}
                                >
                                    {phrase}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sliders: Pitch & Speed */}
                    <div
                        className="row g-3 p-3 rounded-3 mb-3 border"
                        style={{
                            backgroundColor: theme.subtleBg,
                            borderColor: theme.borderSubtle,
                        }}
                    >
                        <div className="col-6">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <label className="x-small fw-bold mb-0" style={{ color: theme.textMuted }}>Speed</label>
                                <span
                                    className="badge border px-2 py-0.5 rounded-pill x-small"
                                    style={{
                                        backgroundColor: theme.modalBg,
                                        borderColor: theme.borderSubtle,
                                        color: theme.textColor,
                                    }}
                                >
                                    {speed.toFixed(1)}x
                                </span>
                            </div>
                            <input
                                type="range"
                                className="form-range"
                                min={0.6}
                                max={2.0}
                                step={0.1}
                                value={speed}
                                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                                style={{ accentColor: theme.primary }}
                            />
                        </div>
                        <div className="col-6">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <label className="x-small fw-bold mb-0" style={{ color: theme.textMuted }}>Pitch</label>
                                <span
                                    className="badge border px-2 py-0.5 rounded-pill x-small"
                                    style={{
                                        backgroundColor: theme.modalBg,
                                        borderColor: theme.borderSubtle,
                                        color: theme.textColor,
                                    }}
                                >
                                    {pitch.toFixed(1)}x
                                </span>
                            </div>
                            <input
                                type="range"
                                className="form-range"
                                min={0.6}
                                max={1.8}
                                step={0.1}
                                value={pitch}
                                onChange={(e) => setPitch(parseFloat(e.target.value))}
                                style={{ accentColor: theme.primary }}
                            />
                        </div>
                    </div>

                    {/* Action Buttons & Visualizer */}
                    <div className="d-flex align-items-center justify-content-between gap-2 pt-1">
                        <div className="d-flex align-items-center gap-2">
                            {isSpeaking ? (
                                <div className="d-flex align-items-center gap-1">
                                    <span
                                        className="badge rounded-pill px-3 py-1.5 fw-bold d-flex align-items-center gap-1.5 border"
                                        style={{
                                            backgroundColor: theme.subtleBg,
                                            borderColor: theme.primary,
                                            color: theme.primary,
                                        }}
                                    >
                                        <i className="fa-solid fa-volume-high fa-beat" /> Speaking Animalese...
                                    </span>
                                </div>
                            ) : (
                                <span className="small fw-bold" style={{ color: theme.textMuted }}>
                                    Ready to chat
                                </span>
                            )}
                        </div>

                        <div className="d-flex align-items-center gap-2">
                            {isSpeaking ? (
                                <button
                                    type="button"
                                    onClick={handleStop}
                                    className="btn btn-danger rounded-pill fw-bold px-4 shadow-sm d-flex align-items-center gap-2"
                                >
                                    <i className="fa-solid fa-stop" /> Stop
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handlePlay}
                                    className="btn rounded-pill fw-bold px-4 shadow-sm d-flex align-items-center gap-2 text-white"
                                    style={{ backgroundColor: theme.primary }}
                                    disabled={!text.trim()}
                                >
                                    <i className="fa-solid fa-play" /> Speak
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnimaleseVoiceModal;
