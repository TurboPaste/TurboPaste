import { TRPCError } from "@trpc/server";
import prisma from "@turbopaste/db";
import { z } from "zod";
import { adminProcedure, router } from "../index";

export const adminRouter = router({
	deletePaste: adminProcedure
		.input(z.object({ pasteId: z.string() }))
		.mutation(async ({ input }) => {
			await prisma.paste.delete({ where: { id: input.pasteId } });

			return { ok: true };
		}),

	hidePaste: adminProcedure
		.input(z.object({ pasteId: z.string(), reason: z.string().max(200) }))
		.mutation(async ({ input }) => {
			await prisma.paste.update({
				data: { hidden: true, hiddenReason: input.reason },
				where: { id: input.pasteId },
			});

			await prisma.report.updateMany({
				data: { status: "actioned" },
				where: { pasteId: input.pasteId, status: "open" },
			});

			return { ok: true };
		}),

	reports: adminProcedure
		.input(
			z
				.object({
					status: z
						.enum(["open", "dismissed", "actioned"])
						.default("open"),
				})
				.optional(),
		)
		.query(async ({ input }) => {
			const status = input?.status ?? "open";

			return prisma.report.findMany({
				include: {
					paste: {
						select: {
							createdAt: true,
							hidden: true,
							id: true,
							language: true,
							title: true,
							userId: true,
							visibility: true,
						},
					},
					reporter: { select: { email: true, id: true, name: true } },
				},
				orderBy: { createdAt: "desc" },
				take: 100,
				where: { status },
			});
		}),

	resolveReport: adminProcedure
		.input(
			z.object({
				action: z.enum(["dismiss", "action"]),
				reportId: z.string(),
			}),
		)
		.mutation(async ({ input }) => {
			const report = await prisma.report.findUnique({
				where: { id: input.reportId },
			});
			if (!report) throw new TRPCError({ code: "NOT_FOUND" });

			await prisma.report.update({
				data: {
					status:
						input.action === "dismiss" ? "dismissed" : "actioned",
				},
				where: { id: input.reportId },
			});

			return { ok: true };
		}),

	unhidePaste: adminProcedure
		.input(z.object({ pasteId: z.string() }))
		.mutation(async ({ input }) => {
			await prisma.paste.update({
				data: { hidden: false, hiddenReason: null },
				where: { id: input.pasteId },
			});

			return { ok: true };
		}),
});
