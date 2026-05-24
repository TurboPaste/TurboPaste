import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Badge } from "@turbopaste/ui/components/badge";
import { Button } from "@turbopaste/ui/components/button";
import {
	Dialog,
	DialogHeader,
	DialogTitle,
} from "@turbopaste/ui/components/dialog";
import { Input } from "@turbopaste/ui/components/input";
import { Label } from "@turbopaste/ui/components/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@turbopaste/ui/components/select";
import { Textarea } from "@turbopaste/ui/components/textarea";
import { motion } from "framer-motion";
import {
	Calendar,
	Check,
	Copy,
	Edit3,
	Eye,
	Flag,
	Flame,
	Lock,
	Pencil,
	Save,
	Trash2,
} from "lucide-react";
import { type FC, useEffect, useState } from "react";
import { toast } from "sonner";
import { CodeBlock } from "@/components/code-block";
import { authClient } from "@/lib/auth-client";
import { LANGUAGES } from "@/lib/languages";
import { trpc } from "@/utils/trpc";

type PasteData = {
	burnAfterRead: boolean;
	burned: boolean;
	content: string;
	createdAt: string | Date;
	expiresAt: string | Date | null;
	hasPassword: boolean;
	id: string;
	language: string;
	title: string | null;
	updatedAt?: string | Date;
	userId: string | null;
	views?: number;
	visibility: string;
};

const REPORT_REASONS = [
	{ label: "Spam", value: "spam" },
	{ label: "Malware", value: "malware" },
	{ label: "Phishing", value: "phishing" },
	{ label: "Illegal content", value: "illegal" },
	{ label: "Personal information", value: "personal-info" },
	{ label: "Other", value: "other" },
] as const;

const fmtDate = (d: string | Date | null | undefined) => {
	if (!d) return "";

	return new Date(d).toLocaleString(undefined, {
		dateStyle: "medium",
		timeStyle: "short",
	});
};

const PasteView: FC = () => {
	const { id } = Route.useParams();
	const navigate = useNavigate();
	const { data: session } = authClient.useSession();

	const meta = useQuery(trpc.paste.meta.queryOptions({ id }));

	const [unlocked, setUnlocked] = useState(false);
	const [passwordInput, setPasswordInput] = useState("");
	const [data, setData] = useState<PasteData | null>(null);

	const fetchPaste = useMutation(
		trpc.paste.get.mutationOptions({
			onError: (e) => {
				if (e.data?.code === "UNAUTHORIZED")
					toast.error("Password required or incorrect");
				else if (e.data?.code === "NOT_FOUND")
					toast.error("Paste not found or expired");
				else toast.error(e.message);
			},
			onSuccess: (paste) => {
				setData(paste as PasteData);
				setUnlocked(true);
				if ((paste as PasteData).burned)
					toast.info("🔥 This paste was burned after read");
			},
		}),
	);

	useEffect(() => {
		if (meta.data && !meta.data.hasPassword && !unlocked)
			fetchPaste.mutate({ id });
	}, [meta.data, unlocked, id, fetchPaste.mutate]);

	if (meta.isLoading)
		return (
			<div className="mx-auto max-w-4xl px-4 py-20 text-center text-muted-foreground">
				Loading...
			</div>
		);

	if (meta.error || !meta.data)
		return (
			<div className="mx-auto max-w-4xl px-4 py-20 text-center">
				<h1 className="font-semibold text-2xl">Paste not found</h1>
				<p className="mt-2 text-muted-foreground">
					It may have expired or been removed.
				</p>
				<Link className="mt-6 inline-block underline" to="/">
					Create a new paste
				</Link>
			</div>
		);

	const isOwner = session && data && session.user.id === data.userId;

	return (
		<div className="mx-auto w-full max-w-5xl px-4 py-8 md:py-12">
			<PasteHeader
				meta={meta.data}
				onUnlockClick={() => setUnlocked(false)}
				url={typeof window !== "undefined" ? window.location.href : ""}
			/>

			{!unlocked || !data ? (
				<PasswordGate
					hasPassword={meta.data.hasPassword}
					onSubmit={(pw) => {
						setPasswordInput(pw);
						fetchPaste.mutate({ id, password: pw || undefined });
					}}
					pending={fetchPaste.isPending}
				/>
			) : isOwner ? (
				<OwnerView
					initial={data}
					onDelete={() => navigate({ to: "/dashboard" })}
					onUpdate={(updated) =>
						setData((d) => (d ? { ...d, ...updated } : d))
					}
				/>
			) : (
				<ReaderView data={data} />
			)}

			{unlocked && data && (
				<ReportSection
					anonView={!isOwner}
					passwordUsed={passwordInput}
					pasteId={id}
				/>
			)}
		</div>
	);
};

const PasteHeader: FC<{
	meta: {
		burnAfterRead: boolean;
		createdAt: string | Date;
		expiresAt: string | Date | null;
		hasPassword: boolean;
		language: string;
		title: string | null;
		visibility: string;
	};
	onUnlockClick: () => void;
	url: string;
}> = ({ meta, onUnlockClick, url }) => {
	const [copied, setCopied] = useState(false);

	return (
		<motion.div
			animate={{ opacity: 1, y: 0 }}
			className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
			initial={{ opacity: 0, y: 8 }}
			transition={{ duration: 0.35 }}
		>
			<div className="space-y-2">
				<h1 className="font-semibold text-2xl tracking-tight">
					{meta.title || "Untitled paste"}
				</h1>
				<div className="flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
					<Badge variant="outline">{meta.language}</Badge>
					<Badge variant="secondary">{meta.visibility}</Badge>
					{meta.hasPassword && (
						<Badge variant="outline">
							<Lock className="size-3" /> Password
						</Badge>
					)}
					{meta.burnAfterRead && (
						<Badge variant="destructive">
							<Flame className="size-3" /> Burn after read
						</Badge>
					)}
					<span className="inline-flex items-center gap-1">
						<Calendar className="size-3" />{" "}
						{fmtDate(meta.createdAt)}
					</span>
					{meta.expiresAt && (
						<span className="inline-flex items-center gap-1">
							expires {fmtDate(meta.expiresAt)}
						</span>
					)}
				</div>
			</div>
			<div className="flex flex-wrap gap-2">
				<Button
					onClick={async () => {
						await navigator.clipboard.writeText(url);
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
					{copied ? "Copied" : "Copy link"}
				</Button>
				{meta.hasPassword && (
					<Button onClick={onUnlockClick} size="sm" variant="outline">
						<Lock className="size-3.5" /> Re-enter password
					</Button>
				)}
			</div>
		</motion.div>
	);
};

const PasswordGate: FC<{
	hasPassword: boolean;
	onSubmit: (pw: string) => void;
	pending: boolean;
}> = ({ hasPassword, onSubmit, pending }) => {
	const [pw, setPw] = useState("");
	if (!hasPassword)
		return (
			<div className="rounded-xl border border-border/60 bg-card/40 p-6 text-muted-foreground text-sm">
				Loading paste...
			</div>
		);

	return (
		<form
			className="glass mx-auto max-w-md rounded-xl border border-border/60 p-6"
			onSubmit={(e) => {
				e.preventDefault();
				onSubmit(pw);
			}}
		>
			<h2 className="mb-1 flex items-center gap-2 font-semibold text-base">
				<Lock className="size-4" /> Password required
			</h2>
			<p className="mb-4 text-muted-foreground text-sm">
				This paste is password-protected.
			</p>
			<div className="space-y-2">
				<Label htmlFor="pw">Password</Label>
				<Input
					autoComplete="off"
					autoFocus
					id="pw"
					onChange={(e) => setPw(e.target.value)}
					type="password"
					value={pw}
				/>
			</div>
			<Button className="mt-4 w-full" disabled={pending} type="submit">
				{pending ? "Unlocking..." : "Unlock"}
			</Button>
		</form>
	);
};

const ReaderView: FC<{ data: PasteData }> = ({ data }) => {
	const [copied, setCopied] = useState(false);
	return (
		<motion.div
			animate={{ opacity: 1 }}
			className="space-y-3"
			initial={{ opacity: 0 }}
			transition={{ duration: 0.3 }}
		>
			<div className="flex items-center justify-between text-muted-foreground text-xs">
				<span className="inline-flex items-center gap-1.5">
					<Eye className="size-3.5" /> {data.views ?? 0} views
				</span>
				<Button
					onClick={async () => {
						await navigator.clipboard.writeText(data.content);
						setCopied(true);
						setTimeout(() => setCopied(false), 1500);
					}}
					size="sm"
					variant="ghost"
				>
					{copied ? (
						<Check className="size-3.5" />
					) : (
						<Copy className="size-3.5" />
					)}
					{copied ? "Copied" : "Copy content"}
				</Button>
			</div>
			<CodeBlock code={data.content} language={data.language} />
		</motion.div>
	);
};

const OwnerView: FC<{
	initial: PasteData;
	onDelete: () => void;
	onUpdate: (p: Partial<PasteData>) => void;
}> = ({ initial, onDelete, onUpdate }) => {
	const [editing, setEditing] = useState(false);
	const [content, setContent] = useState(initial.content);
	const [title, setTitle] = useState(initial.title ?? "");
	const [language, setLanguage] = useState(initial.language);
	const [visibility, setVisibility] = useState(initial.visibility);

	const update = useMutation(
		trpc.paste.update.mutationOptions({
			onError: (e) => toast.error(e.message),
			onSuccess: () => {
				toast.success("Saved");
				setEditing(false);
				onUpdate({ content, language, title, visibility });
			},
		}),
	);

	const del = useMutation(
		trpc.paste.delete.mutationOptions({
			onError: (e) => toast.error(e.message),
			onSuccess: () => {
				toast.success("Paste deleted");
				onDelete();
			},
		}),
	);

	if (!editing)
		return (
			<motion.div
				animate={{ opacity: 1 }}
				className="space-y-3"
				initial={{ opacity: 0 }}
				transition={{ duration: 0.3 }}
			>
				<div className="flex flex-wrap items-center justify-between gap-2 text-muted-foreground text-xs">
					<span className="inline-flex items-center gap-1.5">
						<Eye className="size-3.5" /> {initial.views ?? 0} views
					</span>
					<div className="flex gap-2">
						<Button
							onClick={() => setEditing(true)}
							size="sm"
							variant="outline"
						>
							<Pencil className="size-3.5" /> Edit
						</Button>
						<Button
							disabled={del.isPending}
							onClick={() => {
								if (
									confirm(
										"Delete this paste? This cannot be undone.",
									)
								) {
									del.mutate({ id: initial.id });
								}
							}}
							size="sm"
							variant="destructive"
						>
							<Trash2 className="size-3.5" /> Delete
						</Button>
					</div>
				</div>
				<CodeBlock code={initial.content} language={initial.language} />
			</motion.div>
		);

	return (
		<form
			className="space-y-4 rounded-xl border border-border/60 bg-card/40 p-5"
			onSubmit={(e) => {
				e.preventDefault();
				update.mutate({
					content,
					id: initial.id,
					language,
					title: title || null,
					visibility: visibility as never,
				});
			}}
		>
			<div className="grid gap-3 md:grid-cols-[1fr_180px_160px]">
				<div className="space-y-1.5">
					<Label>Title</Label>
					<Input
						onChange={(e) => setTitle(e.target.value)}
						value={title}
					/>
				</div>
				<div className="space-y-1.5">
					<Label>Language</Label>
					<Select onValueChange={setLanguage} value={language}>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{LANGUAGES.map((l) => (
								<SelectItem key={l} value={l}>
									{l}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-1.5">
					<Label>Visibility</Label>
					<Select
						onValueChange={(v) =>
							setVisibility(v as typeof visibility)
						}
						value={visibility}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="public">public</SelectItem>
							<SelectItem value="unlisted">unlisted</SelectItem>
							<SelectItem value="private">private</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>
			<Textarea
				className="min-h-[300px] font-mono text-sm"
				onChange={(e) => setContent(e.target.value)}
				value={content}
			/>
			<div className="flex justify-end gap-2">
				<Button
					onClick={() => {
						setEditing(false);
						setContent(initial.content);
						setTitle(initial.title ?? "");
						setLanguage(initial.language);
						setVisibility(initial.visibility);
					}}
					type="button"
					variant="ghost"
				>
					Cancel
				</Button>
				<Button disabled={update.isPending} type="submit">
					<Save className="size-3.5" />
					{update.isPending ? "Saving..." : "Save changes"}
				</Button>
			</div>
		</form>
	);
};

const ReportSection: FC<{
	anonView: boolean;
	pasteId: string;
	passwordUsed: string;
}> = ({ anonView, pasteId, passwordUsed: _passwordUsed }) => {
	const [open, setOpen] = useState(false);
	const [reason, setReason] = useState<string>("spam");
	const [details, setDetails] = useState("");

	const submit = useMutation(
		trpc.report.submit.mutationOptions({
			onError: (e) => toast.error(e.message),
			onSuccess: () => {
				toast.success("Report submitted — thank you");
				setOpen(false);
				setDetails("");
			},
		}),
	);

	if (!anonView) return null;

	return (
		<>
			<div className="mt-8 flex items-center justify-center">
				<Button onClick={() => setOpen(true)} size="sm" variant="ghost">
					<Flag className="size-3.5" /> Report this paste
				</Button>
			</div>
			<Dialog onClose={() => setOpen(false)} open={open}>
				<DialogHeader>
					<DialogTitle>Report paste</DialogTitle>
				</DialogHeader>
				<form
					className="space-y-3"
					onSubmit={(e) => {
						e.preventDefault();
						submit.mutate({
							details: details || undefined,
							pasteId,
							reason: reason as never,
						});
					}}
				>
					<div className="space-y-1.5">
						<Label>Reason</Label>
						<Select onValueChange={setReason} value={reason}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{REPORT_REASONS.map((r) => (
									<SelectItem key={r.value} value={r.value}>
										{r.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-1.5">
						<Label>Details (optional)</Label>
						<Textarea
							maxLength={500}
							onChange={(e) => setDetails(e.target.value)}
							placeholder="Anything that would help moderators..."
							value={details}
						/>
					</div>
					<div className="flex justify-end gap-2 pt-2">
						<Button
							onClick={() => setOpen(false)}
							type="button"
							variant="ghost"
						>
							Cancel
						</Button>
						<Button disabled={submit.isPending} type="submit">
							{submit.isPending ? "Sending..." : "Submit report"}
						</Button>
					</div>
				</form>
			</Dialog>
		</>
	);
};

export const Route = createFileRoute("/p/$id")({
	component: PasteView,
});

// silence unused-import warnings if tree-shaken
void Edit3;
