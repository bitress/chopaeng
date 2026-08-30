import { useState, useEffect, useCallback } from 'react';
import {
    SUPPORTED_LANGUAGES,
    buildTranslationIndex,
    searchByTranslation,
    searchAllTranslations,
    type TranslationIndex,
    type TranslationLanguage,
} from '../utils/translationSearch';

const LS_LANG_KEY = 'chopaeng_search_lang';

export const useTranslationSearch = () => {
    const [searchLang, setSearchLangState] = useState<string>(() => {
        try {
            return localStorage.getItem(LS_LANG_KEY) || 'en';
        } catch {
            return 'en';
        }
    });

    const [indexMap, setIndexMap] = useState<Map<string, TranslationIndex> | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Save language change
    const setSearchLang = useCallback((lang: string) => {
        setSearchLangState(lang);
        try {
            localStorage.setItem(LS_LANG_KEY, lang);
        } catch {
            // ignore
        }
    }, []);

    // Load translation index on demand when non-English language selected
    useEffect(() => {
        if (searchLang === 'en' && !indexMap) return;

        let mounted = true;
        setIsLoading(true);

        buildTranslationIndex()
            .then((idx) => {
                if (mounted) {
                    setIndexMap(idx);
                    setIsLoading(false);
                }
            })
            .catch(() => {
                if (mounted) setIsLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, [searchLang, indexMap]);

    /**
     * Matches item names against current search query and active language.
     * Returns a set of matching English lowercase names.
     */
    const getMatchingEnglishNames = useCallback((query: string): Set<string> | null => {
        if (!query || !query.trim()) return null;
        const q = query.trim().toLowerCase();

        if (searchLang === 'en' || !indexMap) {
            return null; // Signals caller to use standard English string match
        }

        const langIdx = indexMap.get(searchLang);
        if (!langIdx) {
            // Fallback: search across all translations
            const allMatches = searchAllTranslations(indexMap, q);
            return new Set(allMatches.map((m) => m.name.toLowerCase()));
        }

        const matches = searchByTranslation(langIdx, q);
        return new Set(matches.map((m) => m.name.toLowerCase()));
    }, [searchLang, indexMap]);

    const activeLanguage: TranslationLanguage =
        SUPPORTED_LANGUAGES.find((l) => l.code === searchLang) || SUPPORTED_LANGUAGES[0];

    return {
        searchLang,
        setSearchLang,
        activeLanguage,
        languages: SUPPORTED_LANGUAGES,
        isLoadingTranslations: isLoading,
        getMatchingEnglishNames,
        indexMap,
    };
};

export default useTranslationSearch;
