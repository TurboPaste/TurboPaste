import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@turbopaste/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@turbopaste/ui/components/dropdown-menu";
import { Skeleton } from "@turbopaste/ui/components/skeleton";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { authClient } from "@/lib/auth-client";

export const UserMenu: FC = () => {
	const navigate = useNavigate();
	const { data: session, isPending } = authClient.useSession();
	const { t } = useTranslation();

	if (isPending) return <Skeleton className="h-9 w-24" />;

	if (!session)
		return (
			<Link to="/login">
				<Button variant="outline">{t("userMenu.signIn")}</Button>
			</Link>
		);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger render={<Button variant="outline" />}>
				{session.user.name}
			</DropdownMenuTrigger>
			<DropdownMenuContent className="bg-card">
				<DropdownMenuGroup>
					<DropdownMenuLabel>
						{t("userMenu.myAccount")}
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem>{session.user.email}</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => {
							authClient.signOut({
								fetchOptions: {
									onSuccess: () => {
										navigate({
											to: "/",
										});
									},
								},
							});
						}}
						variant="destructive"
					>
						{t("userMenu.signOut")}
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
