import React from 'react';
import { SUPPORTED_LANGUAGES, type TranslationLanguage } from '../utils/translationSearch';

interface LanguageSelectorPillProps {
    searchLang: string;
    onChangeLang: (lang: string) => void;
    isLoading?: boolean;
    compact?: boolean;
    className?: string;
}

export const LanguageSelectorPill: React.FC<LanguageSelectorPillProps> = ({
    searchLang,
    onChangeLang,
    isLoading = false,
    compact = false,
    className = '',
}) => {
    return (
        <div className={`d-inline-flex align-items-center gap-1 ${className}`}>
            <div className="position-relative">
                <select
                    className="form-select form-select-sm rounded-pill border-0 shadow-none px-2 py-1"
                    style={{
                        backgroundColor: 'var(--card-bg, #f1f5f9)',
                        color: 'var(--text-main, #1e293b)',
                        fontSize: compact ? '0.75rem' : '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        minWidth: compact ? '88px' : '110px',
                    }}
                    value={searchLang}
                    onChange={(e) => onChangeLang(e.target.value)}
                    aria-label="Select search language"
                >
                    {SUPPORTED_LANGUAGES.map((lang: TranslationLanguage) => (
                        <option key={lang.code} value={lang.code}>
                            {compact ? lang.label.split(' ')[0] : lang.label}
                        </option>
                    ))}
                </select>
            </div>
            {isLoading && searchLang !== 'en' && (
                <span className="spinner-border spinner-border-sm text-success ms-1" role="status" style={{ width: 12, height: 12 }}>
                    <span className="visually-hidden">Loading...</span>
                </span>
            )}
        </div>
    );
};

export default LanguageSelectorPill;
