import { type FC, useEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { highlight } from "@/lib/shiki";

export const CodeBlock: FC<{
	code: string;
	language: string;
}> = ({ code, language }) => {
	const { theme } = useTheme();
	const dark =
		theme === "dark" ||
		(theme === "system" &&
			typeof window !== "undefined" &&
			window.matchMedia("(prefers-color-scheme: dark)").matches);
	const [html, setHtml] = useState<string>("");

	useEffect(() => {
		let cancelled = false;
		highlight(code, language, dark)
			.then((h) => {
				if (!cancelled) setHtml(h);
			})
			.catch(() => {
				if (!cancelled) setHtml("");
			});

		return () => {
			cancelled = true;
		};
	}, [code, language, dark]);

	if (!html)
		<pre className="scrollbar-thin overflow-auto rounded-lg border border-border/60 bg-card/60 p-4 font-mono text-sm leading-relaxed">
			{code}
		</pre>;

	return (
		<div
			className="[&_pre]:!bg-card/60 [&_pre]:scrollbar-thin overflow-hidden rounded-lg border border-border/60 [&_pre]:overflow-auto [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-sm [&_pre]:leading-relaxed"
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	);
};
