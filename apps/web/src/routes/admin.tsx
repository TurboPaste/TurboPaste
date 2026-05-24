import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Badge } from "@turbopaste/ui/components/badge";
import { Button } from "@turbopaste/ui/components/button";
import { motion } from "framer-motion";
import { Eye, EyeOff, ShieldX, X } from "lucide-react";
import { type FC, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

const AdminPage: FC = () => {
	const [status, setStatus] = useState<"open" | "actioned" | "dismissed">(
		"open",
	);
	const qc = useQueryClient();
	const reports = useQuery(trpc.admin.reports.queryOptions({ status }));

	const hide = useMutation(
		trpc.admin.hidePaste.mutationOptions({
			onError: (e) => toast.error(e.message),
			onSuccess: () => {
				toast.success("Paste hidden");
				qc.invalidateQueries({
					queryKey: trpc.admin.reports.queryKey(),
				});
			},
		}),
	);
	const unhide = useMutation(
		trpc.admin.unhidePaste.mutationOptions({
			onError: (e) => toast.error(e.message),
			onSuccess: () => {
				toast.success("Paste restored");
				qc.invalidateQueries({
					queryKey: trpc.admin.reports.queryKey(),
				});
			},
		}),
	);
	const resolve = useMutation(
		trpc.admin.resolveReport.mutationOptions({
			onError: (e) => toast.error(e.message),
			onSuccess: () => {
				qc.invalidateQueries({
					queryKey: trpc.admin.reports.queryKey(),
				});
			},
		}),
	);

	return (
		<div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-10">
			<motion.div
				animate={{ opacity: 1, y: 0 }}
				initial={{ opacity: 0, y: 8 }}
				transition={{ duration: 0.3 }}
			>
				<h1 className="font-semibold text-2xl tracking-tight">
					Moderation
				</h1>
				<p className="text-muted-foreground text-sm">
					Review reported pastes.
				</p>
			</motion.div>

			<div className="flex w-fit gap-1 rounded-lg border border-border/60 bg-card/40 p-1">
				{(["open", "actioned", "dismissed"] as const).map((s) => (
					<button
						className={`rounded-md px-3 py-1 text-xs transition-colors ${
							status === s
								? "bg-foreground text-background"
								: "text-muted-foreground hover:text-foreground"
						}`}
						key={s}
						onClick={() => setStatus(s)}
						type="button"
					>
						{s}
					</button>
				))}
			</div>

			{reports.isLoading ? (
				<div className="rounded-xl border border-border/60 bg-card/30 p-6 text-muted-foreground text-sm">
					Loading...
				</div>
			) : !reports.data || reports.data.length === 0 ? (
				<div className="rounded-xl border border-border/60 border-dashed bg-card/20 p-10 text-center text-muted-foreground">
					No reports with status “{status}”.
				</div>
			) : (
				<div className="space-y-3">
					{reports.data.map((r) => (
						<div
							className="rounded-xl border border-border/60 bg-card/40 p-4"
							key={r.id}
						>
							<div className="flex flex-wrap items-start justify-between gap-3">
								<div className="space-y-1">
									<div className="flex flex-wrap items-center gap-2">
										<Badge variant="destructive">
											{r.reason}
										</Badge>
										<Badge variant="outline">
											{r.paste.visibility}
										</Badge>
										{r.paste.hidden && (
											<Badge variant="secondary">
												Hidden
											</Badge>
										)}
										<span className="text-muted-foreground text-xs">
											{new Date(
												r.createdAt,
											).toLocaleString()}
										</span>
									</div>
									<Link
										className="block font-medium text-sm hover:underline"
										params={{ id: r.paste.id }}
										to="/p/$id"
									>
										{r.paste.title || "Untitled paste"}
									</Link>
									{r.details && (
										<p className="text-muted-foreground text-sm">
											{r.details}
										</p>
									)}
									<p className="text-muted-foreground text-xs">
										Reporter:{" "}
										{r.reporter?.email ??
											r.reporterIp ??
											"anonymous"}
									</p>
								</div>
								<div className="flex flex-wrap gap-2">
									{r.paste.hidden ? (
										<Button
											onClick={() =>
												unhide.mutate({
													pasteId: r.paste.id,
												})
											}
											size="sm"
											variant="outline"
										>
											<Eye className="size-3.5" /> Unhide
										</Button>
									) : (
										<Button
											onClick={() =>
												hide.mutate({
													pasteId: r.paste.id,
													reason: r.reason,
												})
											}
											size="sm"
											variant="destructive"
										>
											<EyeOff className="size-3.5" /> Hide
										</Button>
									)}
									{status === "open" && (
										<>
											<Button
												onClick={() =>
													resolve.mutate({
														action: "dismiss",
														reportId: r.id,
													})
												}
												size="sm"
												variant="ghost"
											>
												<X className="size-3.5" />{" "}
												Dismiss
											</Button>
											<Button
												onClick={() =>
													resolve.mutate({
														action: "action",
														reportId: r.id,
													})
												}
												size="sm"
												variant="outline"
											>
												<ShieldX className="size-3.5" />{" "}
												Mark actioned
											</Button>
										</>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export const Route = createFileRoute("/admin")({
	beforeLoad: async () => {
		const session = await authClient.getSession();
		const role = (session.data?.user as { role?: string } | undefined)
			?.role;
		if (!session.data) throw redirect({ to: "/login" });
		if (role !== "admin") throw redirect({ to: "/" });
	},
	component: AdminPage,
});
