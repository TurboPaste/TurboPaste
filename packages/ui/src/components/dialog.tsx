import { cn } from "@turbopaste/ui/lib/utils";
import { type FC, type ReactNode, useEffect } from "react";

interface DialogProps {
	children: ReactNode;
	className?: string;
	onClose: () => void;
	open: boolean;
}

export const Dialog: FC<DialogProps> = ({
	children,
	className,
	onClose,
	open,
}) => {
	useEffect(() => {
		if (!open) return;
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		document.addEventListener("keydown", onKey);
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = "";
		};
	}, [open, onClose]);

	if (!open) return null;

	return (
		<div
			aria-modal="true"
			className="fade-in fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
			role="dialog"
		>
			<button
				aria-label="Close dialog"
				className="absolute inset-0 cursor-default"
				onClick={onClose}
				tabIndex={-1}
				type="button"
			/>
			<div
				className={cn(
					"glass fade-in zoom-in-95 relative max-h-[85vh] w-full max-w-md animate-in overflow-y-auto rounded-xl border border-border/60 p-5 shadow-2xl",
					className,
				)}
			>
				{children}
			</div>
		</div>
	);
};

export const DialogHeader: FC<{
	children: ReactNode;
	className?: string;
}> = ({ children, className }) => (
	<div className={cn("mb-4 space-y-1.5", className)}>{children}</div>
);

export const DialogTitle: FC<{
	children: ReactNode;
}> = ({ children }) => (
	<h2 className="font-semibold text-base leading-none">{children}</h2>
);

export const DialogDescription: FC<{
	children: ReactNode;
}> = ({ children }) => (
	<p className="text-muted-foreground text-sm">{children}</p>
);
