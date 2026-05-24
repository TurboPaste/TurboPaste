import { cn } from "@turbopaste/ui/lib/utils";
import type { FC, HTMLAttributes } from "react";

type Variant = "default" | "secondary" | "outline" | "success" | "destructive";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
	variant?: Variant;
}

const variants: Record<Variant, string> = {
	default: "bg-primary text-primary-foreground",
	destructive:
		"bg-destructive/15 text-destructive border border-destructive/30",
	outline: "border border-border text-foreground",
	secondary: "bg-secondary text-secondary-foreground",
	success: "bg-success/15 text-success border border-success/30",
};

export const Badge: FC<BadgeProps> = ({
	className,
	variant = "default",
	...props
}) => (
	<span
		className={cn(
			"inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium text-[10px] uppercase tracking-wider",
			variants[variant],
			className,
		)}
		{...props}
	/>
);
