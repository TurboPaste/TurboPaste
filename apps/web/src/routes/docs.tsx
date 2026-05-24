import { createFileRoute } from "@tanstack/react-router";
import { env } from "@turbopaste/env/web";
import { type FC, useEffect } from "react";
import { useTranslation } from "react-i18next";

const DocsRedirect: FC = () => {
	const { t } = useTranslation();

	useEffect(() => {
		window.location.replace(env.VITE_DOCS_URL);
	}, []);

	return (
		<div className="mx-auto max-w-md px-4 py-20 text-center text-muted-foreground text-sm">
			{t("docs.redirecting")}{" "}
			<a className="underline" href={env.VITE_DOCS_URL}>
				{t("docs.clickHere")}
			</a>{" "}
			{t("docs.fallback")}
		</div>
	);
};

export const Route = createFileRoute("/docs")({
	component: DocsRedirect,
});
