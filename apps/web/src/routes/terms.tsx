import { createFileRoute } from "@tanstack/react-router";
import type { FC } from "react";
import { useTranslation } from "react-i18next";

const TermsComponent: FC = () => {
	const { t } = useTranslation();

	return (
		<div className="mx-auto max-w-3xl space-y-6 px-4 py-16 text-sm leading-relaxed">
			<h1 className="font-semibold text-2xl tracking-tight">
				{t("terms.title")}
			</h1>
			<p className="text-muted-foreground">{t("terms.intro")}</p>
			<section className="space-y-2">
				<h2 className="font-medium text-base text-foreground">
					{t("terms.useTitle")}
				</h2>
				<p className="text-muted-foreground">{t("terms.useBody")}</p>
			</section>
			<section className="space-y-2">
				<h2 className="font-medium text-base text-foreground">
					{t("terms.moderationTitle")}
				</h2>
				<p className="text-muted-foreground">
					{t("terms.moderationBody")}
				</p>
			</section>
			<section className="space-y-2">
				<h2 className="font-medium text-base text-foreground">
					{t("terms.availabilityTitle")}
				</h2>
				<p className="text-muted-foreground">
					{t("terms.availabilityBody")}
				</p>
			</section>
		</div>
	);
};

export const Route = createFileRoute("/terms")({
	component: TermsComponent,
});
