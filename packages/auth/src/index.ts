import { createPrismaClient } from "@turbopaste/db";
import { env } from "@turbopaste/env/server";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

export const createAuth = () => {
	const prisma = createPrismaClient();

	return betterAuth({
		advanced: {
			defaultCookieAttributes: {
				httpOnly: true,
				sameSite: "none",
				secure: true,
			},
		},
		baseURL: env.BETTER_AUTH_URL,
		database: prismaAdapter(prisma, {
			provider: "postgresql",
		}),
		emailAndPassword: {
			enabled: true,
		},
		plugins: [],
		secret: env.BETTER_AUTH_SECRET,
		trustedOrigins: [env.CORS_ORIGIN],
		user: {
			additionalFields: {
				role: {
					defaultValue: "user",
					input: false,
					required: false,
					type: "string",
				},
			},
		},
	});
};

export const auth = createAuth();
