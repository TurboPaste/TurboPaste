import { TRPCError } from "@trpc/server";
import prisma from "@turbopaste/db";
import { z } from "zod";
import { protectedProcedure, router } from "../index";
import { generateApiKey } from "../lib/paste";

export const apiKeyRouter = router({
	create: protectedProcedure
		.input(z.object({ name: z.string().min(1).max(60) }))
		.mutation(async ({ ctx, input }) => {
			const { hash, key, prefix } = generateApiKey();

			const record = await prisma.apiKey.create({
				data: {
					hash,
					name: input.name,
					prefix,
					userId: ctx.session.user.id,
				},
				select: { createdAt: true, id: true, name: true, prefix: true },
			});

			return { ...record, key };
		}),

	list: protectedProcedure.query(async ({ ctx }) => {
		return prisma.apiKey.findMany({
			orderBy: { createdAt: "desc" },
			select: {
				createdAt: true,
				id: true,
				lastUsedAt: true,
				name: true,
				prefix: true,
				revokedAt: true,
			},
			where: { userId: ctx.session.user.id },
		});
	}),

	revoke: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const key = await prisma.apiKey.findUnique({
				select: { userId: true },
				where: { id: input.id },
			});
			if (!key || key.userId !== ctx.session.user.id)
				throw new TRPCError({ code: "NOT_FOUND" });

			await prisma.apiKey.update({
				data: { revokedAt: new Date() },
				where: { id: input.id },
			});

			return { ok: true };
		}),
});
