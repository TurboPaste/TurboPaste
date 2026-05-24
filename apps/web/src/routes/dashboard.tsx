import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Badge } from "@turbopaste/ui/components/badge";
import { Button } from "@turbopaste/ui/components/button";
import {
	Dialog,
	DialogHeader,
	DialogTitle,
} from "@turbopaste/ui/components/dialog";
import { Input } from "@turbopaste/ui/components/input";
import { Label } from "@turbopaste/ui/components/label";
import { motion } from "framer-motion";
import {
	Check,
	Copy,
	ExternalLink,
	KeyRound,
	Plus,
	Trash2,
} from "lucide-react";
import { type FC, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

const Dashboard: FC = () => (
	<div className="mx-auto w-full max-w-6xl space-y-10 px-4 py-10">
		<motion.section
			animate={{ opacity: 1, y: 0 }}
			initial={{ opacity: 0, y: 8 }}
			transition={{ duration: 0.3 }}
		>
			<h2 className="mb-3 font-semibold text-xl">Your pastes</h2>
			<PastesList />
		</motion.section>

		<motion.section
			animate={{ opacity: 1, y: 0 }}
			initial={{ opacity: 0, y: 8 }}
			transition={{ delay: 0.05, duration: 0.3 }}
		>
			<div className="mb-3 flex items-center justify-between">
				<h2 className="font-semibold text-xl">API keys</h2>
			</div>
			<ApiKeyList />
		</motion.section>
	</div>
);

const PastesList: FC = () => {
	const list = useQuery(trpc.paste.mine.queryOptions());

	if (list.isLoading)
		return (
			<div className="rounded-xl border border-border/60 bg-card/30 p-6 text-muted-foreground text-sm">
				Loading...
			</div>
		);

	if (!list.data || list.data.items.length === 0)
		return (
			<div className="rounded-xl border border-border/60 border-dashed bg-card/20 p-10 text-center">
				<p className="text-muted-foreground">
					You haven't created any pastes yet.
				</p>
				<Link className="mt-3 inline-block underline" to="/">
					Create your first paste
				</Link>
			</div>
		);

	return (
		<div className="overflow-hidden rounded-xl border border-border/60 bg-card/30">
			<table className="w-full text-sm">
				<thead className="bg-muted/30 text-left text-muted-foreground text-xs uppercase tracking-wider">
					<tr>
						<th className="px-4 py-2.5 font-medium">Title</th>
						<th className="px-4 py-2.5 font-medium">Language</th>
						<th className="px-4 py-2.5 font-medium">Visibility</th>
						<th className="px-4 py-2.5 font-medium">Views</th>
						<th className="px-4 py-2.5 font-medium">Created</th>
						<th className="px-4 py-2.5" />
					</tr>
				</thead>
				<tbody>
					{list.data.items.map((p) => (
						<tr
							className="border-border/40 border-t transition-colors hover:bg-muted/20"
							key={p.id}
						>
							<td className="px-4 py-3">
								<Link
									className="font-medium hover:underline"
									params={{ id: p.id }}
									to="/p/$id"
								>
									{p.title || "Untitled"}
								</Link>
								{p.hidden && (
									<Badge
										className="ml-2"
										variant="destructive"
									>
										Hidden
									</Badge>
								)}
							</td>
							<td className="px-4 py-3 text-muted-foreground">
								{p.language}
							</td>
							<td className="px-4 py-3">
								<Badge variant="outline">{p.visibility}</Badge>
							</td>
							<td className="px-4 py-3 text-muted-foreground">
								{p.views}
							</td>
							<td className="px-4 py-3 text-muted-foreground">
								{new Date(p.createdAt).toLocaleDateString()}
							</td>
							<td className="px-4 py-3 text-right">
								<Link params={{ id: p.id }} to="/p/$id">
									<Button size="sm" variant="ghost">
										<ExternalLink className="size-3.5" />
									</Button>
								</Link>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

const ApiKeyList: FC = () => {
	const qc = useQueryClient();
	const keys = useQuery(trpc.apiKey.list.queryOptions());

	const [createOpen, setCreateOpen] = useState(false);
	const [name, setName] = useState("");
	const [createdKey, setCreatedKey] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);

	const create = useMutation(
		trpc.apiKey.create.mutationOptions({
			onError: (e) => toast.error(e.message),
			onSuccess: (k) => {
				setCreatedKey(k.key);
				setName("");
				qc.invalidateQueries({ queryKey: trpc.apiKey.list.queryKey() });
			},
		}),
	);
	const revoke = useMutation(
		trpc.apiKey.revoke.mutationOptions({
			onError: (e) => toast.error(e.message),
			onSuccess: () => {
				toast.success("Key revoked");
				qc.invalidateQueries({ queryKey: trpc.apiKey.list.queryKey() });
			},
		}),
	);

	return (
		<>
			<div className="overflow-hidden rounded-xl border border-border/60 bg-card/30">
				<div className="flex items-center justify-between border-border/40 border-b bg-muted/20 px-4 py-2.5">
					<p className="text-muted-foreground text-xs">
						Use a key to authenticate against the public API at{" "}
						<code className="text-foreground">/v1/*</code>
					</p>
					<Button onClick={() => setCreateOpen(true)} size="sm">
						<Plus className="size-3.5" /> New key
					</Button>
				</div>
				{!keys.data || keys.data.length === 0 ? (
					<div className="p-8 text-center text-muted-foreground text-sm">
						No API keys yet.
					</div>
				) : (
					<table className="w-full text-sm">
						<thead className="text-left text-muted-foreground text-xs uppercase tracking-wider">
							<tr>
								<th className="px-4 py-2.5 font-medium">
									Name
								</th>
								<th className="px-4 py-2.5 font-medium">
									Prefix
								</th>
								<th className="px-4 py-2.5 font-medium">
									Last used
								</th>
								<th className="px-4 py-2.5 font-medium">
									Status
								</th>
								<th className="px-4 py-2.5" />
							</tr>
						</thead>
						<tbody>
							{keys.data.map((k) => (
								<tr
									className="border-border/40 border-t"
									key={k.id}
								>
									<td className="px-4 py-3 font-medium">
										{k.name}
									</td>
									<td className="px-4 py-3 font-mono text-muted-foreground text-xs">
										{k.prefix}...
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										{k.lastUsedAt
											? new Date(
													k.lastUsedAt,
												).toLocaleString()
											: "never"}
									</td>
									<td className="px-4 py-3">
										{k.revokedAt ? (
											<Badge variant="destructive">
												Revoked
											</Badge>
										) : (
											<Badge variant="success">
												Active
											</Badge>
										)}
									</td>
									<td className="px-4 py-3 text-right">
										{!k.revokedAt && (
											<Button
												disabled={revoke.isPending}
												onClick={() => {
													if (
														confirm(
															"Revoke this API key?",
														)
													) {
														revoke.mutate({
															id: k.id,
														});
													}
												}}
												size="sm"
												variant="ghost"
											>
												<Trash2 className="size-3.5" />
											</Button>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>

			<Dialog
				onClose={() => {
					setCreateOpen(false);
					setCreatedKey(null);
				}}
				open={createOpen}
			>
				<DialogHeader>
					<DialogTitle>
						{createdKey ? "Copy your API key" : "Create API key"}
					</DialogTitle>
				</DialogHeader>
				{createdKey ? (
					<div className="space-y-3">
						<p className="text-muted-foreground text-sm">
							This is the only time you'll see this key. Store it
							somewhere safe.
						</p>
						<div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 font-mono text-xs">
							<code className="flex-1 break-all">
								{createdKey}
							</code>
							<Button
								onClick={async () => {
									await navigator.clipboard.writeText(
										createdKey,
									);
									setCopied(true);
									setTimeout(() => setCopied(false), 1500);
								}}
								size="sm"
								variant="outline"
							>
								{copied ? (
									<Check className="size-3.5" />
								) : (
									<Copy className="size-3.5" />
								)}
							</Button>
						</div>
						<div className="flex justify-end">
							<Button
								onClick={() => {
									setCreateOpen(false);
									setCreatedKey(null);
								}}
							>
								Done
							</Button>
						</div>
					</div>
				) : (
					<form
						className="space-y-3"
						onSubmit={(e) => {
							e.preventDefault();
							if (!name.trim()) return;
							create.mutate({ name: name.trim() });
						}}
					>
						<div className="space-y-1.5">
							<Label>Name</Label>
							<Input
								autoFocus
								onChange={(e) => setName(e.target.value)}
								placeholder="My CLI script"
								value={name}
							/>
						</div>
						<div className="flex justify-end gap-2 pt-2">
							<Button
								onClick={() => setCreateOpen(false)}
								type="button"
								variant="ghost"
							>
								Cancel
							</Button>
							<Button
								disabled={create.isPending || !name.trim()}
								type="submit"
							>
								<KeyRound className="size-3.5" />
								{create.isPending
									? "Creating..."
									: "Create key"}
							</Button>
						</div>
					</form>
				)}
			</Dialog>
		</>
	);
};

export const Route = createFileRoute("/dashboard")({
	beforeLoad: async () => {
		const session = await authClient.getSession();
		if (!session.data) throw redirect({ to: "/login" });
		return { session };
	},
	component: Dashboard,
});
