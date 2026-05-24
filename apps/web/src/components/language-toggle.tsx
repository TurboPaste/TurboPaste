import { Button } from "@turbopaste/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@turbopaste/ui/components/dropdown-menu";
import { Languages } from "lucide-react";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { resources } from "@/i18n";

const LANGUAGE_NAMES: Record<string, string> = {
	en: "English",
	tr: "Türkçe",
};

export const LanguageToggle: FC = () => {
	const { i18n, t } = useTranslation();
	const languages = Object.keys(resources);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={<Button size="icon" variant="outline" />}
			>
				<Languages className="h-[1.2rem] w-[1.2rem]" />
				<span className="sr-only">{t("languageToggle.label")}</span>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{languages.map((lng) => (
					<DropdownMenuItem
						key={lng}
						onClick={() => i18n.changeLanguage(lng)}
					>
						{LANGUAGE_NAMES[lng] ?? lng.toUpperCase()}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
