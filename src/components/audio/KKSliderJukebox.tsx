import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { KK_JUKEBOX_TRACKS, type JukeboxTrack } from '../../data/kkJukeboxTracks';
import {
    playChimeClick,
    startJukeboxPlayback,
    stopJukeboxPlayback,
} from '../../utils/kkAudioSynthesizer';

const STORAGE_KEY_TRACK = 'chopaeng_jukebox_track_id';
const STORAGE_KEY_VOLUME = 'chopaeng_jukebox_volume';
const STORAGE_KEY_SHOW_VOL = 'chopaeng_jukebox_show_volume';

export const KKSliderJukebox: React.FC = () => {
    // Widget visible / open state (togglable) — closed by default, opened from Navbar
    const [isOpen, setIsOpen] = useState<boolean>(false);
    // Bottom volume row visible / collapsed state
    const [showVolume, setShowVolume] = useState<boolean>(() => {
        const saved = localStorage.getItem(STORAGE_KEY_SHOW_VOL);
        return saved !== null ? saved === 'true' : true;
    });

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [volume, setVolume] = useState<number>(() => {
        const saved = localStorage.getItem(STORAGE_KEY_VOLUME);
        return saved ? parseFloat(saved) : 0.65;
    });
    const [isMuted, setIsMuted] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isLooping, setIsLooping] = useState(false);
    const [isShuffling, setIsShuffling] = useState(false);
    const [isLoadingAudio, setIsLoadingAudio] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const activeTrack: JukeboxTrack = useMemo(() => {
        return KK_JUKEBOX_TRACKS[currentTrackIndex] || KK_JUKEBOX_TRACKS[0];
    }, [currentTrackIndex]);

    // Restore saved track on mount
    useEffect(() => {
        const savedId = localStorage.getItem(STORAGE_KEY_TRACK);
        if (savedId) {
            const idx = KK_JUKEBOX_TRACKS.findIndex((t) => t.id === savedId);
            if (idx >= 0) setCurrentTrackIndex(idx);
        }
    }, []);

    // Save volume to local storage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_VOLUME, String(volume));
    }, [volume]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_SHOW_VOL, String(showVolume));
    }, [showVolume]);

    // Close track dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Listen for custom global events from navbar
    useEffect(() => {
        const handleOpenJukebox = () => {
            setIsOpen((prev) => !prev);
            playChimeClick();
        };
        window.addEventListener('chopaeng_open_jukebox', handleOpenJukebox);
        window.addEventListener('chopaeng_toggle_jukebox', handleOpenJukebox);
        return () => {
            window.removeEventListener('chopaeng_open_jukebox', handleOpenJukebox);
            window.removeEventListener('chopaeng_toggle_jukebox', handleOpenJukebox);
        };
    }, []);

    // Manage Volume
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
        localStorage.setItem(STORAGE_KEY_VOLUME, String(volume));
    }, [volume, isMuted]);

    const handleNextTrack = useCallback(() => {
        playChimeClick();
        let nextIdx = currentTrackIndex + 1;
        if (isShuffling) {
            nextIdx = Math.floor(Math.random() * KK_JUKEBOX_TRACKS.length);
        } else if (nextIdx >= KK_JUKEBOX_TRACKS.length) {
            nextIdx = 0;
        }
        setCurrentTrackIndex(nextIdx);
        localStorage.setItem(STORAGE_KEY_TRACK, KK_JUKEBOX_TRACKS[nextIdx].id);
    }, [currentTrackIndex, isShuffling]);

    const handlePrevTrack = useCallback(() => {
        playChimeClick();
        let prevIdx = currentTrackIndex - 1;
        if (prevIdx < 0) {
            prevIdx = KK_JUKEBOX_TRACKS.length - 1;
        }
        setCurrentTrackIndex(prevIdx);
        localStorage.setItem(STORAGE_KEY_TRACK, KK_JUKEBOX_TRACKS[prevIdx].id);
    }, [currentTrackIndex]);

    const playRealAudio = useCallback(async (track: JukeboxTrack) => {
        stopJukeboxPlayback();
        if (audioRef.current) {
            try {
                setIsLoadingAudio(true);
                const streamUrl = track.audioUrl;
                if (audioRef.current.src !== streamUrl) {
                    audioRef.current.src = streamUrl;
                    audioRef.current.load();
                }
                audioRef.current.volume = isMuted ? 0 : volume;
                await audioRef.current.play();
                setIsPlaying(true);
                setIsLoadingAudio(false);
            } catch (err) {
                console.warn('Real audio stream blocked/failed, falling back to Web Audio synth:', err);
                setIsLoadingAudio(false);
                startJukeboxPlayback(
                    track.id,
                    isMuted ? 0 : volume,
                    undefined,
                    () => {
                        if (isLooping) playRealAudio(track);
                        else handleNextTrack();
                    }
                );
                setIsPlaying(true);
            }
        }
    }, [volume, isMuted, isLooping, handleNextTrack]);

    const stopAudioStream = () => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
        stopJukeboxPlayback();
    };

    const togglePlay = () => {
        playChimeClick();
        if (isPlaying) {
            stopAudioStream();
            setIsPlaying(false);
        } else {
            playRealAudio(activeTrack);
        }
    };

    // When activeTrack changes while playing, play new track
    useEffect(() => {
        if (isPlaying) {
            playRealAudio(activeTrack);
        }
    }, [activeTrack, playRealAudio]);

    const selectTrack = (index: number) => {
        playChimeClick();
        setCurrentTrackIndex(index);
        localStorage.setItem(STORAGE_KEY_TRACK, KK_JUKEBOX_TRACKS[index].id);
        setDropdownOpen(false);
        playRealAudio(KK_JUKEBOX_TRACKS[index]);
    };

    const toggleWidget = () => {
        playChimeClick();
        setIsOpen(!isOpen);
    };

    return (
        <>
            {/* Hidden HTML5 Audio Element for Real K.K. Slider MP3 Playback */}
            <audio
                ref={audioRef}
                crossOrigin="anonymous"
                onLoadedMetadata={() => setIsLoadingAudio(false)}
                onEnded={() => {
                    if (isLooping) {
                        if (audioRef.current) {
                            audioRef.current.currentTime = 0;
                            audioRef.current.play();
                        }
                    } else {
                        handleNextTrack();
                    }
                }}
                onError={() => {
                    setIsLoadingAudio(false);
                    if (isPlaying) {
                        startJukeboxPlayback(activeTrack.id, isMuted ? 0 : volume);
                    }
                }}
            />


            {/* ── 2. FULL EXPANDED PILL WIDGET (When widget is open) ── */}
            {isOpen && (
                <div
                    className="kk-widget-container position-fixed shadow-lg animate-up"
                    style={{
                        bottom: '20px',
                        left: '20px',
                        zIndex: 1060,
                        backgroundColor: '#fffdfa',
                        border: '3px solid #2f3e35',
                        borderRadius: '36px',
                        padding: showVolume ? '10px 16px 10px 14px' : '8px 14px',
                        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.2), 0 2px 6px rgba(0,0,0,0.08)',
                        transition: 'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
                        maxWidth: 'calc(100vw - 32px)',
                    }}
                >
                    {/* ── Top Main Control Row ── */}
                    <div className="d-flex align-items-center gap-2 position-relative">

                        {/* Previous Button */}
                        <button
                            type="button"
                            onClick={handlePrevTrack}
                            className="btn rounded-circle d-flex align-items-center justify-content-center transition-all p-0"
                            style={{
                                width: '36px',
                                height: '36px',
                                minWidth: '36px',
                                backgroundColor: '#fffdfa',
                                border: '2.5px solid #2f3e35',
                                color: '#2f3e35',
                            }}
                            title="Previous Track"
                            aria-label="Previous Track"
                        >
                            <i className="fa-solid fa-backward-step" style={{ fontSize: '0.82rem' }}></i>
                        </button>

                        {/* Play / Pause Main Button (Chopaeng ACNH Green) */}
                        <button
                            type="button"
                            onClick={togglePlay}
                            className="btn rounded-circle text-white d-flex align-items-center justify-content-center shadow-sm transition-all p-0"
                            style={{
                                width: '46px',
                                height: '46px',
                                minWidth: '46px',
                                backgroundColor: 'var(--nook-green, #37b06d)',
                                border: '2.5px solid #2f3e35',
                                transform: isPlaying ? 'scale(1.04)' : 'scale(1)',
                            }}
                            title={isPlaying ? 'Pause' : 'Play K.K. Slider'}
                            aria-label={isPlaying ? 'Pause' : 'Play'}
                        >
                            {isLoadingAudio ? (
                                <span className="spinner-border spinner-border-sm" role="status" />
                            ) : (
                                <i
                                    className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`}
                                    style={{
                                        fontSize: '1.15rem',
                                        marginLeft: isPlaying ? '0' : '3px',
                                    }}
                                ></i>
                            )}
                        </button>

                        {/* Next Button */}
                        <button
                            type="button"
                            onClick={handleNextTrack}
                            className="btn rounded-circle d-flex align-items-center justify-content-center transition-all p-0"
                            style={{
                                width: '36px',
                                height: '36px',
                                minWidth: '36px',
                                backgroundColor: '#fffdfa',
                                border: '2.5px solid #2f3e35',
                                color: '#2f3e35',
                            }}
                            title="Next Track"
                            aria-label="Next Track"
                        >
                            <i className="fa-solid fa-forward-step" style={{ fontSize: '0.82rem' }}></i>
                        </button>

                        {/* Track Selection Dropdown Pill */}
                        <div className="position-relative" ref={dropdownRef} style={{ minWidth: '150px', maxWidth: '210px' }}>
                            <button
                                type="button"
                                onClick={() => {
                                    playChimeClick();
                                    setDropdownOpen(!dropdownOpen);
                                }}
                                className="btn rounded-pill d-flex align-items-center justify-content-between px-3 py-1 text-dark fw-black w-100 transition-all text-truncate"
                                style={{
                                    backgroundColor: '#fffdfa',
                                    border: '2.5px solid #2f3e35',
                                    height: '38px',
                                    fontSize: '0.88rem',
                                    letterSpacing: '0.2px',
                                }}
                                title={activeTrack.title}
                            >
                                <span className="text-truncate me-1">
                                    {currentTrackIndex + 1}. {activeTrack.title}
                                </span>
                                <i
                                    className={`fa-solid fa-caret-down text-muted transition-all ${dropdownOpen ? 'rotate-180' : ''}`}
                                    style={{ fontSize: '0.75rem' }}
                                ></i>
                            </button>

                            {/* Track Dropdown Menu */}
                            {dropdownOpen && (
                                <div
                                    className="position-absolute bottom-100 start-0 mb-2 w-100 rounded-4 shadow-xl border overflow-hidden animate-up"
                                    style={{
                                        backgroundColor: '#fffdfa',
                                        borderColor: '#2f3e35',
                                        borderWidth: '2.5px',
                                        maxHeight: '260px',
                                        overflowY: 'auto',
                                        zIndex: 1070,
                                        minWidth: '220px',
                                    }}
                                >
                                    <div className="p-2 border-bottom bg-light d-flex align-items-center justify-content-between">
                                        <span className="tiny-text fw-bold text-muted text-uppercase">
                                            <i className="fa-solid fa-music text-success me-1"></i> K.K. Tracks ({KK_JUKEBOX_TRACKS.length})
                                        </span>
                                        <div className="d-flex align-items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsShuffling(!isShuffling);
                                                    playChimeClick();
                                                }}
                                                className={`btn btn-xs rounded-circle p-0 d-flex align-items-center justify-content-center ${isShuffling ? 'btn-success text-white' : 'btn-white border text-muted'}`}
                                                style={{ width: '22px', height: '22px' }}
                                                title={isShuffling ? 'Shuffle On' : 'Shuffle Off'}
                                            >
                                                <i className="fa-solid fa-shuffle x-small"></i>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsLooping(!isLooping);
                                                    playChimeClick();
                                                }}
                                                className={`btn btn-xs rounded-circle p-0 d-flex align-items-center justify-content-center ${isLooping ? 'btn-success text-white' : 'btn-white border text-muted'}`}
                                                style={{ width: '22px', height: '22px' }}
                                                title={isLooping ? 'Loop Single Track On' : 'Loop Off'}
                                            >
                                                <i className="fa-solid fa-repeat x-small"></i>
                                            </button>
                                        </div>
                                    </div>
                                    {KK_JUKEBOX_TRACKS.map((track, idx) => {
                                        const isSelected = idx === currentTrackIndex;
                                        return (
                                            <button
                                                key={track.id}
                                                type="button"
                                                onClick={() => selectTrack(idx)}
                                                className={`btn btn-sm w-100 text-start px-3 py-2 d-flex align-items-center justify-content-between border-0 transition-all ${
                                                    isSelected
                                                        ? 'text-white'
                                                        : 'text-dark hover-bg-light'
                                                }`}
                                                style={{
                                                    backgroundColor: isSelected ? 'var(--nook-green, #37b06d)' : 'transparent',
                                                    fontSize: '0.82rem',
                                                    fontWeight: isSelected ? 'bold' : '600',
                                                }}
                                            >
                                                <span className="text-truncate">
                                                    {idx + 1}. {track.title}
                                                </span>
                                                {isSelected && isPlaying && (
                                                    <i className="fa-solid fa-volume-high x-small ms-2"></i>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Minimize / Close Button */}
                        <button
                            type="button"
                            onClick={toggleWidget}
                            className="btn btn-link text-muted p-0 ms-1 border-0"
                            style={{ color: '#2f3e35', fontSize: '0.85rem' }}
                            title="Minimize widget"
                            aria-label="Minimize"
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    {/* ── Bottom Secondary Row: Volume Slider + Collapse Chevron ── */}
                    {showVolume ? (
                        <div className="d-flex align-items-center justify-content-center gap-2 mt-2 pt-1">
                            {/* Volume Mute Toggle */}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsMuted(!isMuted);
                                    playChimeClick();
                                }}
                                className="btn btn-link text-muted p-0 border-0"
                                title={isMuted ? 'Unmute' : 'Mute'}
                                style={{ color: '#2f3e35' }}
                            >
                                <i
                                    className={`fa-solid ${
                                        isMuted || volume === 0
                                            ? 'fa-volume-xmark text-danger'
                                            : 'fa-volume-low'
                                    }`}
                                    style={{ fontSize: '0.85rem' }}
                                ></i>
                            </button>

                            {/* Chopaeng Green Volume Slider */}
                            <div style={{ width: '130px' }}>
                                <input
                                    type="range"
                                    className="form-range kk-custom-range"
                                    min={0}
                                    max={1}
                                    step={0.05}
                                    value={isMuted ? 0 : volume}
                                    onChange={(e) => {
                                        setVolume(parseFloat(e.target.value));
                                        setIsMuted(false);
                                    }}
                                    style={{
                                        height: '6px',
                                        accentColor: 'var(--nook-green, #37b06d)',
                                    }}
                                />
                            </div>

                            {/* Collapse Volume Chevron */}
                            <button
                                type="button"
                                onClick={() => {
                                    playChimeClick();
                                    setShowVolume(false);
                                }}
                                className="btn rounded-circle d-flex align-items-center justify-content-center p-0 transition-all"
                                style={{
                                    width: '22px',
                                    height: '22px',
                                    backgroundColor: '#fffdfa',
                                    border: '1.5px solid #2f3e35',
                                    color: '#2f3e35',
                                }}
                                title="Collapse volume slider"
                                aria-label="Collapse volume"
                            >
                                <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.62rem' }}></i>
                            </button>
                        </div>
                    ) : (
                        <div className="text-center mt-1">
                            <button
                                type="button"
                                onClick={() => {
                                    playChimeClick();
                                    setShowVolume(true);
                                }}
                                className="btn btn-link text-muted p-0 border-0"
                                style={{ fontSize: '0.68rem', color: '#2f3e35' }}
                                title="Expand volume slider"
                            >
                                <i className="fa-solid fa-chevron-up"></i>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Custom Styling for the ACNH Widget */}
            <style>{`
                .kk-custom-range::-webkit-slider-runnable-track {
                    background: #e4e0d7;
                    height: 6px;
                    border-radius: 4px;
                    border: 1px solid #2f3e35;
                }
                .kk-custom-range::-webkit-slider-thumb {
                    background: var(--nook-green, #37b06d);
                    border: 2px solid #2f3e35;
                    width: 14px;
                    height: 14px;
                    margin-top: -5px;
                    border-radius: 50%;
                    cursor: pointer;
                }
                .rotate-180 {
                    transform: rotate(180deg);
                }
                @keyframes bounceSlow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
                .animate-bounce {
                    display: inline-block;
                    animation: bounceSlow 1.2s infinite ease-in-out;
                }
                .equalizer-bar {
                    width: 3px;
                    height: 100%;
                    background-color: var(--nook-green, #37b06d);
                    border-radius: 2px;
                    animation: eqDance 0.8s ease-in-out infinite alternate;
                }
                @keyframes eqDance {
                    0% { height: 20%; }
                    100% { height: 100%; }
                }
            `}</style>
        </>
    );
};

export default KKSliderJukebox;
