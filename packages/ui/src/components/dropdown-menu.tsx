"use client";

import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { cn } from "@turbopaste/ui/lib/utils";
import { CheckIcon, ChevronRightIcon } from "lucide-react";
import type { ComponentProps, FC } from "react";

export const DropdownMenu: FC<MenuPrimitive.Root.Props> = ({ ...props }) => (
	<MenuPrimitive.Root data-slot="dropdown-menu" {...props} />
);

export const DropdownMenuPortal: FC<MenuPrimitive.Portal.Props> = ({
	...props
}) => <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />;

export const DropdownMenuTrigger: FC<MenuPrimitive.Trigger.Props> = ({
	...props
}) => <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;

export const DropdownMenuContent: FC<
	MenuPrimitive.Popup.Props &
		Pick<
			MenuPrimitive.Positioner.Props,
			"align" | "alignOffset" | "side" | "sideOffset"
		>
> = ({
	align = "start",
	alignOffset = 0,
	side = "bottom",
	sideOffset = 4,
	className,
	...props
}) => (
	<MenuPrimitive.Portal>
		<MenuPrimitive.Positioner
			align={align}
			alignOffset={alignOffset}
			className="isolate z-50 outline-none"
			side={side}
			sideOffset={sideOffset}
		>
			<MenuPrimitive.Popup
				className={cn(
					"data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:fade-in-0 data-open:zoom-in-95 data-closed:fade-out-0 data-closed:zoom-out-95 z-50 max-h-(--available-height) w-(--anchor-width) min-w-32 origin-(--transform-origin) overflow-y-auto overflow-x-hidden rounded-none bg-popover text-popover-foreground shadow-md outline-none ring-1 ring-foreground/10 duration-100 data-closed:animate-out data-open:animate-in data-closed:overflow-hidden",
					className,
				)}
				data-slot="dropdown-menu-content"
				{...props}
			/>
		</MenuPrimitive.Positioner>
	</MenuPrimitive.Portal>
);

export const DropdownMenuGroup: FC<MenuPrimitive.Group.Props> = ({
	...props
}) => <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;

export const DropdownMenuLabel: FC<
	MenuPrimitive.GroupLabel.Props & {
		inset?: boolean;
	}
> = ({ className, inset, ...props }) => (
	<MenuPrimitive.GroupLabel
		className={cn(
			"px-2 py-2 text-muted-foreground text-xs data-inset:pl-7",
			className,
		)}
		data-inset={inset}
		data-slot="dropdown-menu-label"
		{...props}
	/>
);

export const DropdownMenuItem: FC<
	MenuPrimitive.Item.Props & {
		inset?: boolean;
		variant?: "default" | "destructive";
	}
> = ({ className, inset, variant = "default", ...props }) => (
	<MenuPrimitive.Item
		className={cn(
			"group/dropdown-menu-item relative flex cursor-default select-none items-center gap-2 rounded-none px-2 py-2 text-xs outline-hidden focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-disabled:pointer-events-none data-inset:pl-7 data-[variant=destructive]:text-destructive data-disabled:opacity-50 data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 data-[variant=destructive]:*:[svg]:text-destructive",
			className,
		)}
		data-inset={inset}
		data-slot="dropdown-menu-item"
		data-variant={variant}
		{...props}
	/>
);

export const DropdownMenuSub: FC<MenuPrimitive.SubmenuRoot.Props> = ({
	...props
}) => <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />;

export const DropdownMenuSubTrigger: FC<
	MenuPrimitive.SubmenuTrigger.Props & {
		inset?: boolean;
	}
> = ({ className, inset, children, ...props }) => (
	<MenuPrimitive.SubmenuTrigger
		className={cn(
			"flex cursor-default select-none items-center gap-2 rounded-none px-2 py-2 text-xs outline-hidden focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-open:bg-accent data-popup-open:bg-accent data-inset:pl-7 data-open:text-accent-foreground data-popup-open:text-accent-foreground [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
			className,
		)}
		data-inset={inset}
		data-slot="dropdown-menu-sub-trigger"
		{...props}
	>
		{children}
		<ChevronRightIcon className="ml-auto" />
	</MenuPrimitive.SubmenuTrigger>
);

export const DropdownMenuSubContent: FC<
	ComponentProps<typeof DropdownMenuContent>
> = ({
	align = "start",
	alignOffset = -3,
	side = "right",
	sideOffset = 0,
	className,
	...props
}) => (
	<DropdownMenuContent
		align={align}
		alignOffset={alignOffset}
		className={cn(
			"data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:fade-in-0 data-open:zoom-in-95 data-closed:fade-out-0 data-closed:zoom-out-95 w-auto min-w-[96px] rounded-none bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/10 duration-100 data-closed:animate-out data-open:animate-in",
			className,
		)}
		data-slot="dropdown-menu-sub-content"
		side={side}
		sideOffset={sideOffset}
		{...props}
	/>
);

export const DropdownMenuCheckboxItem: FC<
	MenuPrimitive.CheckboxItem.Props & {
		inset?: boolean;
	}
> = ({ className, children, checked, inset, ...props }) => (
	<MenuPrimitive.CheckboxItem
		checked={checked}
		className={cn(
			"relative flex cursor-default select-none items-center gap-2 rounded-none py-2 pr-8 pl-2 text-xs outline-hidden focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-disabled:pointer-events-none data-inset:pl-7 data-disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
			className,
		)}
		data-inset={inset}
		data-slot="dropdown-menu-checkbox-item"
		{...props}
	>
		<span
			className="pointer-events-none absolute right-2 flex items-center justify-center"
			data-slot="dropdown-menu-checkbox-item-indicator"
		>
			<MenuPrimitive.CheckboxItemIndicator>
				<CheckIcon />
			</MenuPrimitive.CheckboxItemIndicator>
		</span>
		{children}
	</MenuPrimitive.CheckboxItem>
);

export const DropdownMenuRadioGroup: FC<MenuPrimitive.RadioGroup.Props> = ({
	...props
}) => (
	<MenuPrimitive.RadioGroup
		data-slot="dropdown-menu-radio-group"
		{...props}
	/>
);

export const DropdownMenuRadioItem: FC<
	MenuPrimitive.RadioItem.Props & {
		inset?: boolean;
	}
> = ({ className, children, inset, ...props }) => (
	<MenuPrimitive.RadioItem
		className={cn(
			"relative flex cursor-default select-none items-center gap-2 rounded-none py-2 pr-8 pl-2 text-xs outline-hidden focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-disabled:pointer-events-none data-inset:pl-7 data-disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
			className,
		)}
		data-inset={inset}
		data-slot="dropdown-menu-radio-item"
		{...props}
	>
		<span
			className="pointer-events-none absolute right-2 flex items-center justify-center"
			data-slot="dropdown-menu-radio-item-indicator"
		>
			<MenuPrimitive.RadioItemIndicator>
				<CheckIcon />
			</MenuPrimitive.RadioItemIndicator>
		</span>
		{children}
	</MenuPrimitive.RadioItem>
);

export const DropdownMenuSeparator: FC<MenuPrimitive.Separator.Props> = ({
	className,
	...props
}) => (
	<MenuPrimitive.Separator
		className={cn("-mx-1 h-px bg-border", className)}
		data-slot="dropdown-menu-separator"
		{...props}
	/>
);

export const DropdownMenuShortcut: FC<ComponentProps<"span">> = ({
	className,
	...props
}) => (
	<span
		className={cn(
			"ml-auto text-muted-foreground text-xs tracking-widest group-focus/dropdown-menu-item:text-accent-foreground",
			className,
		)}
		data-slot="dropdown-menu-shortcut"
		{...props}
	/>
);
