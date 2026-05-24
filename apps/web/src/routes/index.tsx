import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@turbopaste/ui/components/button";
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
import { ArrowRight, Flame, Lock } from "lucide-react";
import { type FC, type FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { LANGUAGES } from "@/lib/languages";
import { trpc } from "@/utils/trpc";

const EXPIRATIONS = [
	{ label: "Never", value: "never" },
	{ label: "10 minutes", value: "10m" },
	{ label: "1 hour", value: "1h" },
	{ label: "1 day", value: "1d" },
	{ label: "1 week", value: "1w" },
] as const;

const VISIBILITIES = [
	{ desc: "Listed in your dashboard", label: "Public", value: "public" },
	{ desc: "Only people with the link", label: "Unlisted", value: "unlisted" },
	{ desc: "Sign-in required (you only)", label: "Private", value: "private" },
] as const;

const MAX_BYTES = 1024 * 1024;

const HomeComponent: FC = () => {
	const navigate = useNavigate();
	const { data: session } = authClient.useSession();

	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [language, setLanguage] = useState<string>("plaintext");
	const [visibility, setVisibility] = useState<
		"public" | "unlisted" | "private"
	>("unlisted");
	const [expiration, setExpiration] = useState<string>("never");
	const [password, setPassword] = useState("");
	const [burn, setBurn] = useState(false);

	const bytes = useMemo(() => new Blob([content]).size, [content]);
	const over = bytes > MAX_BYTES;

	const createPaste = useMutation(
		trpc.paste.create.mutationOptions({
			onError: (e) => toast.error(e.message),
			onSuccess: (p) => {
				toast.success("Paste created");
				navigate({ params: { id: p.id }, to: "/p/$id" });
			},
		}),
	);

	if (visibility === "private" && !session) setVisibility("unlisted");

	function submit(e: FormEvent) {
		e.preventDefault();
		if (!content.trim()) {
			toast.error("Content is required");
			return;
		}

		if (over) {
			toast.error("Content exceeds 1MB");
			return;
		}

		createPaste.mutate({
			burnAfterRead: burn,
			content,
			expiration: expiration as never,
			language,
			password: password || undefined,
			title: title || undefined,
			visibility,
		});
	}

	return (
		<div className="mx-auto w-full max-w-5xl px-4 py-10 md:py-16">
			<motion.div
				animate={{ opacity: 1, y: 0 }}
				className="mb-8 space-y-3 text-center"
				initial={{ opacity: 0, y: 8 }}
				transition={{ duration: 0.4 }}
			>
				<h1 className="font-semibold text-4xl text-gradient tracking-tight md:text-5xl">
					Paste at the speed of thought.
				</h1>
				<p className="text-muted-foreground">
					A futuristic pastebin with syntax highlighting, expirations,
					password protection and a public API.
				</p>
			</motion.div>

			<motion.form
				animate={{ opacity: 1, y: 0 }}
				className="glass rounded-2xl border border-border/60 p-5 shadow-black/10 shadow-xl md:p-6 dark:shadow-2xl dark:shadow-black/40"
				initial={{ opacity: 0, y: 12 }}
				onSubmit={submit}
				transition={{ delay: 0.05, duration: 0.4 }}
			>
				<div className="mb-4 grid gap-4 md:grid-cols-[1fr_180px_160px]">
					<div className="space-y-1.5">
						<Label htmlFor="title">Title</Label>
						<Input
							id="title"
							maxLength={120}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="untitled"
							value={title}
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="lang">Language</Label>
						<Select onValueChange={setLanguage} value={language}>
							<SelectTrigger id="lang">
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
						<Label htmlFor="exp">Expiration</Label>
						<Select
							onValueChange={setExpiration}
							value={expiration}
						>
							<SelectTrigger id="exp">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{EXPIRATIONS.map((e) => (
									<SelectItem key={e.value} value={e.value}>
										{e.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				<Textarea
					className="min-h-[340px] font-mono text-sm leading-relaxed"
					onChange={(e) => setContent(e.target.value)}
					placeholder="// paste your content here"
					value={content}
				/>

				<div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-muted-foreground text-xs">
					<span className={over ? "text-destructive" : ""}>
						{bytes.toLocaleString()} / {MAX_BYTES.toLocaleString()}{" "}
						bytes
					</span>
				</div>

				<div className="mt-5 grid gap-4 md:grid-cols-2">
					<div className="space-y-1.5">
						<Label>Visibility</Label>
						<div className="grid gap-2">
							{VISIBILITIES.map((v) => {
								const disabled =
									v.value === "private" && !session;
								const active = visibility === v.value;
								return (
									<button
										className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
											active
												? "border-foreground/60 bg-foreground/5"
												: "border-border hover:border-border/80 hover:bg-muted/40"
										} ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
										disabled={disabled}
										key={v.value}
										onClick={() => setVisibility(v.value)}
										type="button"
									>
										<div className="flex items-center justify-between">
											<span className="font-medium">
												{v.label}
											</span>
											{disabled && (
												<span className="text-[10px] text-muted-foreground uppercase">
													Sign in
												</span>
											)}
										</div>
										<div className="text-muted-foreground text-xs">
											{v.desc}
										</div>
									</button>
								);
							})}
						</div>
					</div>

					<div className="space-y-3">
						<div className="space-y-1.5">
							<Label
								className="flex items-center gap-1.5"
								htmlFor="pw"
							>
								<Lock className="size-3.5" /> Password
								(optional)
							</Label>
							<Input
								autoComplete="new-password"
								id="pw"
								onChange={(e) => setPassword(e.target.value)}
								placeholder="********"
								type="password"
								value={password}
							/>
						</div>
						<label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-background/30 px-3 py-2.5 text-sm hover:border-border/80">
							<input
								checked={burn}
								className="mt-1 size-4 accent-foreground"
								onChange={(e) => setBurn(e.target.checked)}
								type="checkbox"
							/>
							<span>
								<span className="flex items-center gap-1.5 font-medium">
									<Flame className="size-3.5 text-orange-400" />{" "}
									Burn after read
								</span>
								<span className="text-muted-foreground text-xs">
									Deletes the paste after the first view.
								</span>
							</span>
						</label>
					</div>
				</div>

				<div className="mt-6 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
					<p className="text-muted-foreground text-xs">
						{session
							? `Signed in as ${session.user.name}. This paste will be saved to your account.`
							: "Posting anonymously. This paste will be read-only forever."}
					</p>
					<Button
						className="group/btn h-10 px-5 text-sm"
						disabled={
							createPaste.isPending || over || !content.trim()
						}
						size="lg"
						type="submit"
					>
						{createPaste.isPending
							? "Publishing..."
							: "Publish paste"}
						<ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-0.5" />
					</Button>
				</div>
			</motion.form>
		</div>
	);
};

export const Route = createFileRoute("/")({
	component: HomeComponent,
});
