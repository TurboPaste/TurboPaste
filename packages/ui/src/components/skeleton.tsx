import { cn } from "@turbopaste/ui/lib/utils";
import type { ComponentProps, FC } from "react";

export const Skeleton: FC<ComponentProps<"div">> = ({
	className,
	...props
}) => (
	<div
		className={cn("animate-pulse rounded-none bg-muted", className)}
		data-slot="skeleton"
		{...props}
	/>
);
