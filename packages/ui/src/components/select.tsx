"use client";

import { Select as SelectPrimitive } from "@base-ui/react/select";
import { cn } from "@turbopaste/ui/lib/utils";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import type { FC } from "react";

export const Select = <Value extends string>({
	onValueChange,
	...props
}: Omit<SelectPrimitive.Root.Props<Value>, "onValueChange"> & {
	onValueChange?: (value: Value) => void;
}) => (
	<SelectPrimitive.Root
		{...props}
		onValueChange={
			onValueChange
				? (value) => {
						if (value != null) onValueChange(value as Value);
					}
				: undefined
		}
	/>
);

export const SelectTrigger: FC<SelectPrimitive.Trigger.Props> = ({
	className,
	children,
	...props
}) => (
	<SelectPrimitive.Trigger
		className={cn(
			"flex h-8 w-full items-center justify-between gap-2 rounded-none border border-input bg-transparent px-2.5 py-1 text-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground dark:bg-input/30 [&_svg:not([class*='size-'])]:size-3.5 [&_svg]:pointer-events-none [&_svg]:shrink-0",
			className,
		)}
		data-slot="select-trigger"
		{...props}
	>
		{children}
		<SelectPrimitive.Icon className="text-muted-foreground">
			<ChevronDownIcon />
		</SelectPrimitive.Icon>
	</SelectPrimitive.Trigger>
);

export const SelectValue: FC<SelectPrimitive.Value.Props> = ({
	className,
	...props
}) => (
	<SelectPrimitive.Value
		className={cn("truncate", className)}
		data-slot="select-value"
		{...props}
	/>
);

export const SelectContent: FC<
	SelectPrimitive.Popup.Props &
		Pick<SelectPrimitive.Positioner.Props, "align" | "side" | "sideOffset">
> = ({
	align = "start",
	side = "bottom",
	sideOffset = 4,
	className,
	...props
}) => (
	<SelectPrimitive.Portal>
		<SelectPrimitive.Positioner
			align={align}
			className="isolate z-50 outline-none"
			side={side}
			sideOffset={sideOffset}
		>
			<SelectPrimitive.Popup
				className={cn(
					"data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-open:fade-in-0 data-open:zoom-in-95 data-closed:fade-out-0 data-closed:zoom-out-95 z-50 max-h-(--available-height) min-w-(--anchor-width) origin-(--transform-origin) overflow-y-auto overflow-x-hidden rounded-md bg-popover py-1 text-popover-foreground shadow-md outline-none ring-1 ring-foreground/10 duration-100 data-closed:animate-out data-open:animate-in",
					className,
				)}
				data-slot="select-content"
				{...props}
			/>
		</SelectPrimitive.Positioner>
	</SelectPrimitive.Portal>
);

export const SelectItem: FC<SelectPrimitive.Item.Props> = ({
	className,
	children,
	...props
}) => (
	<SelectPrimitive.Item
		className={cn(
			"relative flex w-full cursor-default select-none items-center gap-2 rounded-none py-1.5 pr-8 pl-2 text-xs outline-hidden data-disabled:pointer-events-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:opacity-50",
			className,
		)}
		data-slot="select-item"
		{...props}
	>
		<SelectPrimitive.ItemIndicator className="pointer-events-none absolute right-2 flex items-center justify-center">
			<CheckIcon className="size-3.5" />
		</SelectPrimitive.ItemIndicator>
		<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
	</SelectPrimitive.Item>
);
