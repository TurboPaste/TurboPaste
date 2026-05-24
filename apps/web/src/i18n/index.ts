import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import tr from "./locales/tr.json";

export const defaultNS = "translation";
export const resources = {
	en: { translation: en },
	tr: { translation: tr },
} as const;

i18n.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		defaultNS,
		detection: {
			caches: ["localStorage"],
			lookupLocalStorage: "turbopaste-language",
			order: ["localStorage", "navigator"],
		},
		fallbackLng: "en",
		interpolation: { escapeValue: false },
		load: "languageOnly",
		resources,
		returnNull: false,
		supportedLngs: Object.keys(resources),
	});

export default i18n;
