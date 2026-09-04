import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { getAuthToken } from '../context/authToken';
import {
    generateNicknamePresets,
    isValidAcnhNickname,
    getNicknameValidationError,
    formatCharactersToNickname,
    type NicknamePreset,
} from '../utils/characterParser';
import { updateDiscordNickname } from '../utils/userProfileApi';
import { playChimeClick } from '../utils/kkAudioSynthesizer';
import { type SavedCharacter, MAX_CHARACTER_SLOTS } from '../hooks/useSavedCharacters';
import { setUserScopedItem } from '../utils/accountStorage';
import './DiscordNicknameModal.css';

export interface DiscordNicknameModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentNickname?: string | null;
    characters: SavedCharacter[];
    onSuccess?: (newNickname: string) => void;
    onCharacterAdded?: (ign: string, islandName: string) => boolean;
    title?: string;
    subtitle?: string;
    canDismiss?: boolean;
}

export const DiscordNicknameModal: React.FC<DiscordNicknameModalProps> = ({
    isOpen,
    onClose,
    currentNickname,
    characters = [],
    onSuccess,
    onCharacterAdded,
    title = 'Set Up Server Nickname',
    subtitle = 'ChoPaeng server requires Character Name | Island Name format to use Order Bot.',
    canDismiss = true,
}) => {
    const { user } = useAuth();
    const [nickname, setNickname] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Inline Add Character state
    const [showAddChar, setShowAddChar] = useState(false);
    const [newCharIgn, setNewCharIgn] = useState('');
    const [newCharIsland, setNewCharIsland] = useState('');
    const [addCharError, setAddCharError] = useState<string | null>(null);

    // Initialize nickname when modal opens
    useEffect(() => {
        if (!isOpen) return;
        setErrorMsg(null);
        setSuccessMsg(null);
        setShowAddChar(false);

        if (currentNickname && currentNickname.trim()) {
            setNickname(currentNickname.trim().slice(0, 32));
        } else if (characters.length > 0) {
            const formatted = formatCharactersToNickname(characters);
            const defaultChar = characters.find((c) => c.isDefault) || characters[0];
            setNickname((formatted || `${defaultChar.ign} | ${defaultChar.islandName}`).slice(0, 32));
        } else if (user?.nickname && user.nickname.trim()) {
            setNickname(user.nickname.trim().slice(0, 32));
        } else {
            setNickname('');
        }
    }, [isOpen, currentNickname, characters, user]);

    if (!isOpen) return null;

    const trimmed = nickname.trim();
    const isValid = isValidAcnhNickname(trimmed);
    const validationError = getNicknameValidationError(nickname);
    const presets: NicknamePreset[] = generateNicknamePresets(characters);

    const handleSelectPreset = (val: string) => {
        setNickname(val.slice(0, 32));
        setErrorMsg(null);
        playChimeClick();
    };

    const handleInsertPipe = () => {
        const text = nickname.trim();
        if (!text.includes('|')) {
            setNickname((text ? `${text} | ` : '| ').slice(0, 32));
        } else {
            setNickname(`${text} | `.slice(0, 32));
        }
        playChimeClick();
    };

    const handleSaveNewCharacter = (e: React.FormEvent) => {
        e.preventDefault();
        const ign = newCharIgn.trim();
        const isl = newCharIsland.trim();
        if (!ign) {
            setAddCharError('Character IGN is required.');
            return;
        }
        if (!isl) {
            setAddCharError('Island name is required.');
            return;
        }

        if (onCharacterAdded) {
            const ok = onCharacterAdded(ign, isl);
            if (!ok) {
                setAddCharError('Failed to add character (slot limit reached).');
                return;
            }
        }

        // Auto apply to nickname: sync all slots (Slot 1, 2, and 3) using | and /
        const updatedSlots = [...characters, { ign, islandName: isl, isDefault: characters.length === 0 }];
        const multiNick = formatCharactersToNickname(updatedSlots);
        setNickname((multiNick || `${ign} | ${isl}`).slice(0, 32));
        setShowAddChar(false);
        setNewCharIgn('');
        setNewCharIsland('');
        setAddCharError(null);
        playChimeClick();
    };

    const handleSaveDiscordNick = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trimmed) {
            setErrorMsg('Nickname cannot be empty.');
            return;
        }
        if (!isValid) {
            setErrorMsg("Format must be 'Character Name | Island Name' separated by a '|'.");
            return;
        }

        setIsSaving(true);
        setErrorMsg(null);
        setSuccessMsg(null);
        playChimeClick();

        const token = getAuthToken();
        const res = await updateDiscordNickname(trimmed, token);
        setIsSaving(false);

        if (res.success) {
            const finalNick = res.nickname || trimmed;
            setSuccessMsg(res.message || `Server nickname updated to "${finalNick}"!`);
            setUserScopedItem('chopaeng_discord_nickname', finalNick, user?.user_id);

            // Dispatch event to sync navbar, auth, profile, and orderbot
            window.dispatchEvent(
                new CustomEvent('chopaeng_nickname_updated', {
                    detail: { nickname: finalNick },
                })
            );

            if (onSuccess) {
                onSuccess(finalNick);
            }

            setTimeout(() => {
                onClose();
            }, 1200);
        } else {
            setErrorMsg(res.message || 'Failed to update nickname on Discord. Please try again.');
        }
    };

    return (
        <div
            className="dnm-backdrop"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={canDismiss ? onClose : undefined}
        >
            <div className="dnm-card" onClick={(e) => e.stopPropagation()}>
                {/* ── HEADER ── */}
                <div className="dnm-header">
                    <div className="d-flex align-items-center gap-3 min-w-0">
                        <div className="dnm-header-icon-wrap" aria-hidden="true">
                            <i className="fa-brands fa-discord" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="dnm-title ac-font">{title}</h2>
                            <p className="dnm-subtitle mb-0 text-truncate">{subtitle}</p>
                        </div>
                    </div>
                    {canDismiss && (
                        <button
                            type="button"
                            className="dnm-close-btn"
                            onClick={onClose}
                            aria-label="Close modal"
                        >
                            <i className="fa-solid fa-xmark" />
                        </button>
                    )}
                </div>

                {/* ── BODY ── */}
                <div className="dnm-body">
                    {/* Status Alerts */}
                    {errorMsg && (
                        <div className="alert alert-danger py-2 px-3 rounded-3 d-flex align-items-center gap-2 small mb-0 animate-fade">
                            <i className="fa-solid fa-triangle-exclamation flex-shrink-0" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {successMsg && (
                        <div className="alert alert-success py-2 px-3 rounded-3 d-flex align-items-center gap-2 small mb-0 animate-fade">
                            <i className="fa-solid fa-circle-check flex-shrink-0 text-success" />
                            <span>{successMsg}</span>
                        </div>
                    )}

                    {/* Discord Member Live Preview Box */}
                    <div className="dnm-discord-preview">
                        <div className="dnm-discord-header-row">
                            <span>
                                <i className="fa-brands fa-discord me-1" /> Discord Live Preview
                            </span>
                            <span className="dnm-discord-badge">ChoPaeng Camp</span>
                        </div>

                        <div className="dnm-discord-user-row">
                            <div className="dnm-discord-avatar-wrap">
                                <img
                                    src={user?.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                                    alt={user?.username || 'Resident'}
                                    className="dnm-discord-avatar"
                                />
                                <span className="dnm-discord-status-dot" title="Online" />
                            </div>
                            <div className="min-w-0 flex-grow-1">
                                <div className="d-flex align-items-center gap-2 flex-wrap">
                                    <span className="dnm-discord-nick-text text-truncate">
                                        {trimmed || user?.username || 'Character | Island'}
                                    </span>
                                    <span className="badge bg-secondary text-white" style={{ fontSize: '0.62rem' }}>
                                        MEMBER
                                    </span>
                                </div>
                                <div className="dnm-discord-handle">
                                    @{user?.username || 'resident'}
                                </div>
                            </div>
                        </div>

                        {/* Format Validation Status Badge */}
                        <div className={`dnm-format-badge ${isValid ? 'valid' : 'invalid'}`}>
                            {isValid ? (
                                <>
                                    <i className="fa-solid fa-circle-check" />
                                    <span>Verified ACNH Format (Character | Island)</span>
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-triangle-exclamation" />
                                    <span>
                                        {validationError || 'Must be in Character Name | Island Name format'}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ── SECTION 1: CHOOSE FROM PRESETS & CHARACTERS ── */}
                    <div>
                        <div className="dnm-section-title">
                            <span>1. Choose from Characters or Presets</span>
                            <span className="tiny-text text-muted fw-bold">Click to populate</span>
                        </div>

                        {/* Character Slots */}
                        {characters.length > 0 && (
                            <div className="dnm-char-list mb-2">
                                {characters.map((char) => {
                                    const expected = `${char.ign} | ${char.islandName}`.toLowerCase();
                                    const isChosen = trimmed.toLowerCase() === expected;
                                    return (
                                        <div
                                            key={char.id}
                                            className={`dnm-char-card ${isChosen ? 'selected' : ''}`}
                                            onClick={() => handleSelectPreset(`${char.ign} | ${char.islandName}`)}
                                            role="button"
                                            tabIndex={0}
                                        >
                                            <div className="d-flex align-items-center gap-2 min-w-0">
                                                <div className="dnm-char-icon">
                                                    <i className={`fa-solid ${char.icon || 'fa-leaf'}`} />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="dnm-char-ign text-truncate">{char.ign}</div>
                                                    <div className="dnm-char-island text-truncate">
                                                        <i className="fa-solid fa-mountain-sun me-1 text-success" />
                                                        {char.islandName}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center gap-1 flex-shrink-0">
                                                {char.isDefault && (
                                                    <span className="badge bg-success bg-opacity-10 text-success rounded-pill x-small fw-bold">
                                                        Primary
                                                    </span>
                                                )}
                                                <span
                                                    className={`badge rounded-pill x-small ${
                                                        isChosen
                                                            ? 'bg-primary text-white'
                                                            : 'bg-light text-secondary border'
                                                    }`}
                                                >
                                                    {isChosen ? 'Selected' : 'Use Slot'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Multi-slot Presets if available */}
                        {presets.length > 1 && (
                            <div className="dnm-preset-grid mb-2">
                                {presets.map((preset) => {
                                    const isPresetActive =
                                        trimmed.toLowerCase() === preset.value.toLowerCase();
                                    return (
                                        <button
                                            key={preset.id}
                                            type="button"
                                            className={`dnm-preset-btn ${isPresetActive ? 'active' : ''}`}
                                            onClick={() => handleSelectPreset(preset.value)}
                                        >
                                            <div className="min-w-0 flex-grow-1">
                                                <div className="dnm-preset-val text-truncate">
                                                    {preset.value}
                                                </div>
                                                <div className="dnm-preset-desc text-truncate">
                                                    {preset.description}
                                                </div>
                                            </div>
                                            {preset.badge && (
                                                <span
                                                    className={`badge rounded-pill x-small flex-shrink-0 ${
                                                        isPresetActive
                                                            ? 'bg-primary text-white'
                                                            : 'bg-light text-secondary border'
                                                    }`}
                                                >
                                                    {preset.badge}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Inline Add Character toggle */}
                        {!showAddChar && characters.length < MAX_CHARACTER_SLOTS && (
                            <button
                                type="button"
                                className="dnm-chip-btn"
                                onClick={() => setShowAddChar(true)}
                            >
                                <i className="fa-solid fa-plus" />
                                <span>Add New In-Game Character Slot</span>
                            </button>
                        )}

                        {/* Inline Add Character Form */}
                        {showAddChar && (
                            <div className="p-3 bg-light rounded-4 border animate-fade mb-2">
                                <div className="fw-bold small text-dark mb-2 d-flex align-items-center justify-content-between">
                                    <span>
                                        <i className="fa-solid fa-user-plus text-success me-1" /> Add In-Game Character
                                    </span>
                                    <button
                                        type="button"
                                        className="btn-close x-small"
                                        onClick={() => setShowAddChar(false)}
                                        aria-label="Cancel"
                                    />
                                </div>
                                <div className="row g-2 mb-2">
                                    <div className="col-12 col-sm-6">
                                        <input
                                            type="text"
                                            className="form-control form-control-sm rounded-3"
                                            placeholder="IGN (e.g. Bitress)"
                                            value={newCharIgn}
                                            onChange={(e) => setNewCharIgn(e.target.value)}
                                            maxLength={24}
                                        />
                                    </div>
                                    <div className="col-12 col-sm-6">
                                        <input
                                            type="text"
                                            className="form-control form-control-sm rounded-3"
                                            placeholder="Island Name (e.g. Pearl)"
                                            value={newCharIsland}
                                            onChange={(e) => setNewCharIsland(e.target.value)}
                                            maxLength={24}
                                        />
                                    </div>
                                </div>
                                {addCharError && (
                                    <div className="text-danger tiny-text mb-2">
                                        <i className="fa-solid fa-triangle-exclamation me-1" />
                                        {addCharError}
                                    </div>
                                )}
                                <div className="d-flex gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-success rounded-pill fw-bold px-3"
                                        style={{ backgroundColor: '#37b06d', borderColor: '#37b06d' }}
                                        onClick={handleSaveNewCharacter}
                                    >
                                        <i className="fa-solid fa-check me-1" />
                                        Save &amp; Apply
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary rounded-pill"
                                        onClick={() => setShowAddChar(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── SECTION 2: EDIT NICKNAME INPUT ── */}
                    <div>
                        <div className="dnm-section-title">
                            <span>2. Or Edit Custom Server Nickname</span>
                            <span className="tiny-text text-muted">Max 32 chars</span>
                        </div>

                        <div className="dnm-input-wrap">
                            <input
                                id="dnm-nickname-input"
                                type="text"
                                className="dnm-input"
                                placeholder="Character Name | Island Name"
                                value={nickname}
                                onChange={(e) => {
                                    setNickname(e.target.value);
                                    setErrorMsg(null);
                                }}
                                maxLength={32}
                            />
                            <span
                                className={`dnm-char-counter ${
                                    nickname.length >= 32 ? 'danger' : ''
                                }`}
                            >
                                {nickname.length}/32
                            </span>
                        </div>

                        {/* Quick Action Helpers */}
                        <div className="dnm-quick-actions">
                            <button
                                type="button"
                                className="dnm-chip-btn"
                                onClick={handleInsertPipe}
                                title="Insert | delimiter"
                            >
                                <i className="fa-solid fa-bars" />
                                <span>Insert &quot; | &quot; Separator</span>
                            </button>
                            <span className="tiny-text text-muted ms-auto">
                                Standard: <code>Character Name | Island Name</code>
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── FOOTER ── */}
                <div className="dnm-footer">
                    {canDismiss && (
                        <button
                            type="button"
                            className="dnm-cancel-btn"
                            onClick={onClose}
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="button"
                        className="dnm-submit-btn"
                        onClick={handleSaveDiscordNick}
                        disabled={isSaving || !trimmed || !isValid}
                    >
                        {isSaving ? (
                            <>
                                <span className="spinner-border spinner-border-sm" aria-hidden="true" />
                                <span>Updating Discord Server…</span>
                            </>
                        ) : (
                            <>
                                <i className="fa-brands fa-discord" />
                                <span>Save &amp; Update on Discord</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
