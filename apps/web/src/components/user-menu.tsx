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
import { authClient } from "@/lib/auth-client";

export const UserMenu: FC = () => {
	const navigate = useNavigate();
	const { data: session, isPending } = authClient.useSession();

	if (isPending) return <Skeleton className="h-9 w-24" />;

	if (!session)
		return (
			<Link to="/login">
				<Button variant="outline">Sign In</Button>
			</Link>
		);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger render={<Button variant="outline" />}>
				{session.user.name}
			</DropdownMenuTrigger>
			<DropdownMenuContent className="bg-card">
				<DropdownMenuGroup>
					<DropdownMenuLabel>My Account</DropdownMenuLabel>
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
						Sign Out
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
