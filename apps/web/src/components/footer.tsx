import { Link } from "@tanstack/react-router";
import type { FC } from "react";
import { useTranslation } from "react-i18next";

export const Footer: FC = () => {
	const { t } = useTranslation();
	const year = new Date().getFullYear();

	return (
		<footer className="border-border/60 border-t bg-background/60 backdrop-blur-md">
			<div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4 text-muted-foreground text-sm">
				<span>{t("footer.copyright", { year })}</span>
				<nav className="flex items-center gap-4">
					<Link
						activeProps={{ className: "text-foreground" }}
						className="transition-colors hover:text-foreground"
						to="/privacy"
					>
						{t("footer.privacy")}
					</Link>
					<Link
						activeProps={{ className: "text-foreground" }}
						className="transition-colors hover:text-foreground"
						to="/terms"
					>
						{t("footer.terms")}
					</Link>
				</nav>
			</div>
		</footer>
	);
};
