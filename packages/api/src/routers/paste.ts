import { TRPCError } from "@trpc/server";
import prisma from "@turbopaste/db";
import { removeProperties } from "remove-properties";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../index";
import {
	EXPIRATION_OPTIONS,
	expirationToDate,
	generatePasteId,
	hashPassword,
	isExpired,
	MAX_CONTENT_BYTES,
	VISIBILITIES,
	verifyPassword,
} from "../lib/paste";

const createInput = z.object({
	burnAfterRead: z.boolean().default(false),
	content: z
		.string()
		.min(1)
		.refine(
			(v) => Buffer.byteLength(v, "utf8") <= MAX_CONTENT_BYTES,
			"Content exceeds 1MB limit",
		),
	expiration: z
		.enum(
			Object.keys(EXPIRATION_OPTIONS) as [
				keyof typeof EXPIRATION_OPTIONS,
			],
		)
		.default("never"),
	language: z.string().min(1).max(40).default("plaintext"),
	password: z.string().min(1).max(128).optional(),
	title: z.string().max(120).optional(),
	visibility: z.enum(VISIBILITIES).default("public"),
});

const publicPaste = <T extends { passwordHash: string | null }>(p: T) => {
	const clean = removeProperties(p, ["passwordHash"]);

	return { ...clean, hasPassword: !!p.passwordHash };
};

export const pasteRouter = router({
	create: publicProcedure
		.input(createInput)
		.mutation(async ({ ctx, input }) => {
			const id = generatePasteId();
			const expiresAt = expirationToDate(input.expiration);
			const passwordHash = input.password
				? hashPassword(input.password)
				: null;

			const paste = await prisma.paste.create({
				data: {
					burnAfterRead: input.burnAfterRead,
					content: input.content,
					expiresAt,
					id,
					language: input.language,
					passwordHash,
					title: input.title || null,
					userId: ctx.session?.user.id ?? null,
					visibility: input.visibility,
				},
				select: { createdAt: true, expiresAt: true, id: true },
			});

			return paste;
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const paste = await prisma.paste.findUnique({
				select: { userId: true },
				where: { id: input.id },
			});
			if (!paste || paste.userId !== ctx.session.user.id)
				throw new TRPCError({ code: "NOT_FOUND" });

			await prisma.paste.delete({ where: { id: input.id } });

			return { ok: true };
		}),

	get: publicProcedure
		.input(z.object({ id: z.string(), password: z.string().optional() }))
		.mutation(async ({ ctx, input }) => {
			const paste = await prisma.paste.findUnique({
				where: { id: input.id },
			});
			if (!paste || paste.hidden)
				throw new TRPCError({ code: "NOT_FOUND" });

			if (isExpired(paste.expiresAt)) {
				await prisma.paste
					.delete({ where: { id: paste.id } })
					.catch(() => {});

				throw new TRPCError({ code: "NOT_FOUND" });
			}

			const isOwner =
				ctx.session?.user.id && ctx.session.user.id === paste.userId;
			if (paste.visibility === "private" && !isOwner)
				throw new TRPCError({ code: "NOT_FOUND" });

			if (paste.passwordHash && !isOwner)
				if (
					!input.password ||
					!verifyPassword(input.password, paste.passwordHash)
				)
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "Password required",
					});

			if (paste.burnAfterRead && !isOwner) {
				await prisma.paste.delete({ where: { id: paste.id } });

				return { ...publicPaste(paste), burned: true };
			}

			await prisma.paste
				.update({
					data: { views: { increment: 1 } },
					where: { id: paste.id },
				})
				.catch(() => {});

			return { ...publicPaste(paste), burned: false };
		}),

	meta: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			const paste = await prisma.paste.findUnique({
				select: {
					burnAfterRead: true,
					createdAt: true,
					expiresAt: true,
					hidden: true,
					id: true,
					language: true,
					passwordHash: true,
					title: true,
					visibility: true,
				},
				where: { id: input.id },
			});
			if (!paste || paste.hidden || isExpired(paste.expiresAt))
				throw new TRPCError({ code: "NOT_FOUND" });

			return publicPaste(paste);
		}),

	mine: protectedProcedure
		.input(
			z
				.object({
					cursor: z.string().optional(),
					limit: z.number().min(1).max(50).default(20),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			const limit = input?.limit ?? 20;
			const cursor = input?.cursor;
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
					views: true,
					visibility: true,
				},
				skip: cursor ? 1 : 0,
				take: limit + 1,
				where: { userId: ctx.session.user.id },
			});
			const nextCursor =
				items.length > limit ? (items.pop()?.id ?? null) : null;

			return { items, nextCursor };
		}),

	update: protectedProcedure
		.input(
			z.object({
				burnAfterRead: z.boolean().optional(),
				content: z
					.string()
					.min(1)
					.refine(
						(v) =>
							Buffer.byteLength(v, "utf8") <= MAX_CONTENT_BYTES,
						"Content exceeds 1MB limit",
					)
					.optional(),
				expiration: z
					.enum(
						Object.keys(EXPIRATION_OPTIONS) as [
							keyof typeof EXPIRATION_OPTIONS,
						],
					)
					.optional(),
				id: z.string(),
				language: z.string().min(1).max(40).optional(),
				password: z.string().max(128).nullable().optional(),
				title: z.string().max(120).nullable().optional(),
				visibility: z.enum(VISIBILITIES).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const existing = await prisma.paste.findUnique({
				select: { userId: true },
				where: { id: input.id },
			});
			if (!existing || existing.userId !== ctx.session.user.id)
				throw new TRPCError({ code: "NOT_FOUND" });

			return prisma.paste.update({
				data: {
					burnAfterRead: input.burnAfterRead,
					content: input.content,
					expiresAt:
						input.expiration === undefined
							? undefined
							: expirationToDate(input.expiration),
					language: input.language,
					passwordHash:
						input.password === undefined
							? undefined
							: input.password
								? hashPassword(input.password)
								: null,
					title: input.title,
					visibility: input.visibility,
				},
				select: { id: true, updatedAt: true },
				where: { id: input.id },
			});
		}),
});
