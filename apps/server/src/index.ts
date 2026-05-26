import { serve } from "@hono/node-server";
import { trpcServer } from "@hono/trpc-server";
import { createContext } from "@turbopaste/api/context";
import { appRouter } from "@turbopaste/api/routers/index";
import { auth } from "@turbopaste/auth";
import { env } from "@turbopaste/env/server";
import { initLogger } from "evlog";
import { createAuthMiddleware } from "evlog/better-auth";
import { type EvlogVariables, evlog } from "evlog/hono";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createPublicApi } from "./public-api";

initLogger({
	env: { service: "turbopaste-server" },
});

const identifyUser = createAuthMiddleware(auth, {
	exclude: ["/api/auth/**"],
	maskEmail: true,
});

const app = new Hono<EvlogVariables>();

app.use(evlog());

app.use("*", async (c, next) => {
	await identifyUser(c.get("log"), c.req.raw.headers, c.req.path);
	await next();
});

app.use(
	"/*",
	cors({
		allowHeaders: [
			"Content-Type",
			"Authorization",
			"x-api-key",
			"x-paste-password",
		],
		allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
		credentials: true,
		origin: env.CORS_ORIGIN,
	}),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.use(
	"/trpc/*",
	trpcServer({
		createContext: (_opts, context) => {
			return createContext({ context });
		},
		router: appRouter,
	}),
);

app.route("/v1", createPublicApi());

app.get("/", (c) => c.text("OK"));

serve(
	{
		fetch: app.fetch,
		port: 3000,
	},
	(info) => {
		console.log(`Server is running on http://localhost:${info.port}`);
	},
);
