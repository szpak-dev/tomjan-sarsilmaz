import { useTranslations } from "../i18n/utils";
import type { ui } from "../i18n/ui";

export type AvailableLanguage = {
    code: string;
    label: string;
    flag: string;
}

export function findAvailableLanguages(): AvailableLanguage[] {
    const languages = [
        { code: 'en', label: 'EN', flag: '🇬🇧' },
        { code: 'pl', label: 'PL', flag: '🇵🇱' },
    ];

    return languages;
}

export function getLanguage(code: string): AvailableLanguage {
    const languages = findAvailableLanguages();
    const language = languages.find((lang) => lang.code === code);
    
    if (!language) {
        throw new Error(`Language with code ${code} not found`);
    }
    
    return language;
}

export function getDefaultLanguage(): AvailableLanguage {
    return { code: 'pl', label: 'PL', flag: '🇵🇱' };
}

export function getTranslator(lang: string) {
    return useTranslations(lang as keyof typeof ui);
}

