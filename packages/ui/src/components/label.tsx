import { cn } from "@turbopaste/ui/lib/utils";
import type { ComponentProps, FC } from "react";

export const Label: FC<ComponentProps<"label">> = ({ className, ...props }) => (
	// biome-ignore lint/a11y/noLabelWithoutControl: This component is meant to be used as a wrapper for form controls, so it may not always have a control associated with it.
	<label
		className={cn(
			"flex select-none items-center gap-2 text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
			className,
		)}
		data-slot="label"
		{...props}
	/>
);
