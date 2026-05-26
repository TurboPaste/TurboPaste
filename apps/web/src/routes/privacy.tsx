import { createFileRoute } from "@tanstack/react-router";
import type { FC } from "react";
import { useTranslation } from "react-i18next";

const PrivacyComponent: FC = () => {
	const { t } = useTranslation();

	return (
		<div className="mx-auto max-w-3xl space-y-6 px-4 py-16 text-sm leading-relaxed">
			<h1 className="font-semibold text-2xl tracking-tight">
				{t("privacy.title")}
			</h1>
			<p className="text-muted-foreground">{t("privacy.intro")}</p>
			<section className="space-y-2">
				<h2 className="font-medium text-base text-foreground">
					{t("privacy.dataTitle")}
				</h2>
				<p className="text-muted-foreground">{t("privacy.dataBody")}</p>
			</section>
			<section className="space-y-2">
				<h2 className="font-medium text-base text-foreground">
					{t("privacy.moderationTitle")}
				</h2>
				<p className="text-muted-foreground">
					{t("privacy.moderationBody")}
				</p>
			</section>
			<section className="space-y-2">
				<h2 className="font-medium text-base text-foreground">
					{t("privacy.contactTitle")}
				</h2>
				<p className="text-muted-foreground">
					{t("privacy.contactBody")}
				</p>
			</section>
		</div>
	);
};

export const Route = createFileRoute("/privacy")({
	component: PrivacyComponent,
});
