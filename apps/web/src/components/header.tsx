import { Link } from "@tanstack/react-router";
import { env } from "@turbopaste/env/web";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { authClient } from "@/lib/auth-client";
import { LanguageToggle } from "./language-toggle";
import { ModeToggle } from "./mode-toggle";
import { UserMenu } from "./user-menu";

export const Header: FC = () => {
	const { data: session } = authClient.useSession();
	const role = (session?.user as { role?: string } | undefined)?.role;
	const { t } = useTranslation();

	return (
		<header className="sticky top-0 z-40 border-border/60 border-b bg-background/60 backdrop-blur-md">
			<div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
				<div className="flex items-center gap-6">
					<Link
						className="flex items-center gap-2 font-semibold tracking-tight"
						to="/"
					>
						<div className="h-5 w-5 rounded-sm bg-gradient-to-br from-zinc-900 via-zinc-700 to-zinc-400 shadow-[0_0_24px_-4px_oklch(0.145_0_0/0.4)] dark:from-white dark:via-white dark:to-zinc-500 dark:shadow-[0_0_24px_-4px_oklch(0.985_0_0/0.5)]" />
						<span>turbopaste</span>
					</Link>
					<nav className="hidden items-center gap-1 text-muted-foreground text-sm md:flex">
						<Link
							activeProps={{ className: "text-foreground" }}
							className="rounded-md px-3 py-1.5 transition-colors hover:text-foreground"
							to="/"
						>
							{t("header.navNew")}
						</Link>
						{session && (
							<Link
								activeProps={{ className: "text-foreground" }}
								className="rounded-md px-3 py-1.5 transition-colors hover:text-foreground"
								to="/dashboard"
							>
								{t("header.navDashboard")}
							</Link>
						)}
						<a
							className="rounded-md px-3 py-1.5 transition-colors hover:text-foreground"
							href={env.VITE_DOCS_URL}
							rel="noreferrer"
							target="_blank"
						>
							{t("header.navDocs")}
						</a>
						{role === "admin" && (
							<Link
								activeProps={{ className: "text-foreground" }}
								className="rounded-md px-3 py-1.5 transition-colors hover:text-foreground"
								to="/admin"
							>
								{t("header.navAdmin")}
							</Link>
						)}
					</nav>
				</div>
				<div className="flex items-center gap-2">
					<ModeToggle />
					<LanguageToggle />
					<UserMenu />
				</div>
			</div>
		</header>
	);
};
