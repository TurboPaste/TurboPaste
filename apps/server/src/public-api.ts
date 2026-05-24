import {
	EXPIRATION_OPTIONS,
	expirationToDate,
	generatePasteId,
	hashApiKey,
	hashPassword,
	isExpired,
	MAX_CONTENT_BYTES,
	VISIBILITIES,
	verifyPassword,
} from "@turbopaste/api/lib/paste";
import prisma from "@turbopaste/db";
import { Hono } from "hono";
import { z } from "zod";

type AuthVariables = {
	apiKeyId: string | null;
	userId: string | null;
};

const REPORT_REASONS = [
	"spam",
	"malware",
	"phishing",
	"illegal",
	"personal-info",
	"other",
] as const;

const createSchema = z.object({
	burnAfterRead: z.boolean().optional(),
	content: z.string().min(1),
	expiration: z
		.enum(
			Object.keys(EXPIRATION_OPTIONS) as [
				keyof typeof EXPIRATION_OPTIONS,
			],
		)
		.optional(),
	language: z.string().min(1).max(40).optional(),
	password: z.string().min(1).max(128).optional(),
	title: z.string().max(120).optional(),
	visibility: z.enum(VISIBILITIES).optional(),
});

const updateSchema = createSchema.partial().extend({
	password: z.string().max(128).nullable().optional(),
	title: z.string().max(120).nullable().optional(),
});

const reportSchema = z.object({
	details: z.string().max(500).optional(),
	reason: z.enum(REPORT_REASONS),
});

const rateBuckets = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT_AUTHED = 120;
const RATE_LIMIT_ANON = 20;

const rateCheck = (key: string, limit: number) => {
	const now = Date.now();
	const bucket = rateBuckets.get(key);
	if (!bucket || bucket.resetAt <= now) {
		rateBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });

		return {
			allowed: true,
			remaining: limit - 1,
			resetAt: now + RATE_WINDOW_MS,
		};
	}

	if (bucket.count >= limit)
		return { allowed: false, remaining: 0, resetAt: bucket.resetAt };

	bucket.count += 1;

	return {
		allowed: true,
		remaining: limit - bucket.count,
		resetAt: bucket.resetAt,
	};
};

const extractKey = (
	authHeader: string | undefined,
	xApiKey: string | undefined,
) => {
	if (xApiKey) return xApiKey;

	if (authHeader?.toLowerCase().startsWith("bearer "))
		return authHeader.slice(7).trim();

	return null;
};

const clientIp = (headers: Headers) => {
	return (
		headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
		headers.get("x-real-ip") ||
		"unknown"
	);
};

const publicPaste = (p: {
	burnAfterRead: boolean;
	content?: string;
	createdAt: Date;
	expiresAt: Date | null;
	id: string;
	language: string;
	passwordHash: string | null;
	title: string | null;
	updatedAt?: Date;
	userId: string | null;
	views?: number;
	visibility: string;
}) => {
	const { passwordHash, ...rest } = p;

	return { ...rest, hasPassword: !!passwordHash };
};

export const createPublicApi = () => {
	const app = new Hono<{ Variables: AuthVariables }>();

	app.use("*", async (c, next) => {
		const key = extractKey(
			c.req.header("authorization"),
			c.req.header("x-api-key"),
		);

		if (key) {
			const record = await prisma.apiKey.findUnique({
				select: { id: true, revokedAt: true, userId: true },
				where: { hash: hashApiKey(key) },
			});
			if (!record || record.revokedAt) {
				return c.json({ error: "invalid_api_key" }, 401);
			}

			c.set("apiKeyId", record.id);
			c.set("userId", record.userId);

			prisma.apiKey
				.update({
					data: { lastUsedAt: new Date() },
					where: { id: record.id },
				})
				.catch(() => {});
		} else {
			c.set("apiKeyId", null);
			c.set("userId", null);
		}

		const subject = c.get("userId") ?? clientIp(c.req.raw.headers);
		const limit = c.get("userId") ? RATE_LIMIT_AUTHED : RATE_LIMIT_ANON;
		const result = rateCheck(subject, limit);

		c.header("X-RateLimit-Limit", String(limit));
		c.header("X-RateLimit-Remaining", String(result.remaining));
		c.header("X-RateLimit-Reset", String(Math.ceil(result.resetAt / 1000)));

		if (!result.allowed) return c.json({ error: "rate_limited" }, 429);

		await next();
	});

	app.get("/", (c) =>
		c.json({
			docs: "https://github.com/TurboPaste",
			name: "TurboPaste public api",
			version: "v1",
		}),
	);

	app.post("/pastes", async (c) => {
		let body: unknown;

		try {
			body = await c.req.json();
		} catch {
			return c.json({ error: "invalid_json" }, 400);
		}

		const parsed = createSchema.safeParse(body);
		if (!parsed.success)
			return c.json(
				{ error: "validation_error", issues: parsed.error.issues },
				400,
			);

		const input = parsed.data;
		if (Buffer.byteLength(input.content, "utf8") > MAX_CONTENT_BYTES)
			return c.json(
				{ error: "content_too_large", maxBytes: MAX_CONTENT_BYTES },
				413,
			);

		const id = generatePasteId();
		const userId = c.get("userId");
		const paste = await prisma.paste.create({
			data: {
				burnAfterRead: input.burnAfterRead ?? false,
				content: input.content,
				expiresAt: expirationToDate(input.expiration ?? "never"),
				id,
				language: input.language ?? "plaintext",
				passwordHash: input.password
					? hashPassword(input.password)
					: null,
				title: input.title || null,
				userId: userId ?? null,
				visibility: input.visibility ?? "public",
			},
		});

		return c.json(
			{
				...publicPaste(paste),
				url: `${new URL(c.req.url).origin.replace(/\/api$/, "")}/p/${paste.id}`,
			},
			201,
		);
	});

	app.get("/pastes", async (c) => {
		const userId = c.get("userId");
		if (!userId) return c.json({ error: "api_key_required" }, 401);

		const limit = Math.min(
			50,
			Math.max(1, Number(c.req.query("limit") ?? 20)),
		);
		const cursor = c.req.query("cursor");
		const items = await prisma.paste.findMany({
			cursor: cursor ? { id: cursor } : undefined,
			orderBy: { createdAt: "desc" },
			select: {
				createdAt: true,
				expiresAt: true,
				hidden: true,
				id: true,
				language: true,
				title: true,
				updatedAt: true,
				views: true,
				visibility: true,
			},
			skip: cursor ? 1 : 0,
			take: limit + 1,
			where: { userId },
		});
		const nextCursor =
			items.length > limit ? (items.pop()?.id ?? null) : null;

		return c.json({ items, nextCursor });
	});

	app.get("/pastes/:id", async (c) => {
		const id = c.req.param("id");

		const paste = await prisma.paste.findUnique({ where: { id } });
		if (!paste || paste.hidden) return c.json({ error: "not_found" }, 404);

		if (isExpired(paste.expiresAt)) {
			await prisma.paste.delete({ where: { id } }).catch(() => {});
			return c.json({ error: "not_found" }, 404);
		}

		const isOwner = c.get("userId") && c.get("userId") === paste.userId;
		if (paste.visibility === "private" && !isOwner)
			return c.json({ error: "not_found" }, 404);

		if (paste.passwordHash && !isOwner) {
			const pw =
				c.req.header("x-paste-password") ?? c.req.query("password");

			if (!pw || !verifyPassword(pw, paste.passwordHash))
				return c.json({ error: "password_required" }, 401);
		}

		if (paste.burnAfterRead && !isOwner) {
			await prisma.paste.delete({ where: { id } });

			return c.json({ ...publicPaste(paste), burned: true });
		}

		await prisma.paste
			.update({ data: { views: { increment: 1 } }, where: { id } })
			.catch(() => {});

		return c.json({ ...publicPaste(paste), burned: false });
	});

	app.patch("/pastes/:id", async (c) => {
		const userId = c.get("userId");
		if (!userId) return c.json({ error: "api_key_required" }, 401);

		const id = c.req.param("id");
		const existing = await prisma.paste.findUnique({
			select: { userId: true },
			where: { id },
		});
		if (!existing || existing.userId !== userId) {
			return c.json({ error: "not_found" }, 404);
		}

		let body: unknown;
		try {
			body = await c.req.json();
		} catch {
			return c.json({ error: "invalid_json" }, 400);
		}

		const parsed = updateSchema.safeParse(body);
		if (!parsed.success)
			return c.json(
				{ error: "validation_error", issues: parsed.error.issues },
				400,
			);

		const input = parsed.data;
		if (
			input.content !== undefined &&
			Buffer.byteLength(input.content, "utf8") > MAX_CONTENT_BYTES
		)
			return c.json(
				{ error: "content_too_large", maxBytes: MAX_CONTENT_BYTES },
				413,
			);

		const data: Record<string, unknown> = {};
		if (input.content !== undefined) data.content = input.content;
		if (input.title !== undefined) data.title = input.title;
		if (input.language !== undefined) data.language = input.language;
		if (input.visibility !== undefined) data.visibility = input.visibility;
		if (input.burnAfterRead !== undefined)
			data.burnAfterRead = input.burnAfterRead;
		if (input.expiration !== undefined)
			data.expiresAt = expirationToDate(input.expiration);
		if (input.password !== undefined)
			data.passwordHash = input.password
				? hashPassword(input.password)
				: null;

		const updated = await prisma.paste.update({ data, where: { id } });

		return c.json(publicPaste(updated));
	});

	app.delete("/pastes/:id", async (c) => {
		const userId = c.get("userId");
		if (!userId) return c.json({ error: "api_key_required" }, 401);

		const id = c.req.param("id");
		const existing = await prisma.paste.findUnique({
			select: { userId: true },
			where: { id },
		});
		if (!existing || existing.userId !== userId)
			return c.json({ error: "not_found" }, 404);

		await prisma.paste.delete({ where: { id } });

		return c.json({ ok: true });
	});

	app.post("/pastes/:id/report", async (c) => {
		const id = c.req.param("id");
		const paste = await prisma.paste.findUnique({
			select: { id: true },
			where: { id },
		});
		if (!paste) return c.json({ error: "not_found" }, 404);

		let body: unknown;
		try {
			body = await c.req.json();
		} catch {
			return c.json({ error: "invalid_json" }, 400);
		}

		const parsed = reportSchema.safeParse(body);
		if (!parsed.success)
			return c.json(
				{ error: "validation_error", issues: parsed.error.issues },
				400,
			);

		await prisma.report.create({
			data: {
				details: parsed.data.details || null,
				pasteId: id,
				reason: parsed.data.reason,
				reporterId: c.get("userId"),
				reporterIp: clientIp(c.req.raw.headers),
			},
		});

		return c.json({ ok: true }, 201);
	});

	return app;
};
