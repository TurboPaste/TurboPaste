import { protectedProcedure, publicProcedure, router } from "../index";
import { adminRouter } from "./admin";
import { apiKeyRouter } from "./apiKey";
import { pasteRouter } from "./paste";
import { reportRouter } from "./report";

export const appRouter = router({
	admin: adminRouter,
	apiKey: apiKeyRouter,
	healthCheck: publicProcedure.query(() => "OK"),
	me: protectedProcedure.query(({ ctx }) => ctx.session.user),
	paste: pasteRouter,
	report: reportRouter,
});

export type AppRouter = typeof appRouter;
