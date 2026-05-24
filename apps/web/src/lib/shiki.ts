import { createHighlighter, type Highlighter } from "shiki";

import { LANGUAGES } from "./languages";

let highlighterPromise: Promise<Highlighter> | null = null;

export const getHighlighter = () => {
	if (!highlighterPromise)
		highlighterPromise = createHighlighter({
			langs: LANGUAGES.filter((l) => l !== "plaintext"),
			themes: ["vesper", "vitesse-light"],
		});

	return highlighterPromise;
};

export const highlight = async (code: string, lang: string, dark: boolean) => {
	const h = await getHighlighter();
	const loaded = h.getLoadedLanguages();
	const useLang = loaded.includes(lang) ? lang : "txt";

	return h.codeToHtml(code, {
		lang: useLang,
		theme: dark ? "vesper" : "vitesse-light",
	});
};
