import { TRPCError } from "@trpc/server";
import prisma from "@turbopaste/db";
import { z } from "zod";
import { publicProcedure, router } from "../index";

const REASONS = [
	"spam",
	"malware",
	"phishing",
	"illegal",
	"personal-info",
	"other",
] as const;

export const reportRouter = router({
	reasons: publicProcedure.query(() => REASONS),

	submit: publicProcedure
		.input(
			z.object({
				details: z.string().max(500).optional(),
				pasteId: z.string(),
				reason: z.enum(REASONS),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const paste = await prisma.paste.findUnique({
				select: { id: true },
				where: { id: input.pasteId },
			});
			if (!paste) throw new TRPCError({ code: "NOT_FOUND" });

			await prisma.report.create({
				data: {
					details: input.details || null,
					pasteId: input.pasteId,
					reason: input.reason,
					reporterId: ctx.session?.user.id ?? null,
				},
			});

			return { ok: true };
		}),
});
