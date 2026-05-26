import { createPrismaClient } from "@turbopaste/db";
import { env } from "@turbopaste/env/server";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { Redis } from "ioredis";

const buildRedisSecondaryStorage = (url: string) => {
	const client = new Redis(url, {
		keyPrefix: "tp:auth:",
		maxRetriesPerRequest: 1,
	});

	return {
		delete: async (key: string) => {
			await client.del(key);
		},
		get: (key: string) => client.get(key),
		set: async (key: string, value: string, ttl?: number) => {
			if (ttl) await client.set(key, value, "EX", ttl);
			else await client.set(key, value);
		},
	};
};

export const createAuth = () => {
	const prisma = createPrismaClient();
	const secondaryStorage = env.REDIS_URL
		? buildRedisSecondaryStorage(env.REDIS_URL)
		: undefined;

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
		rateLimit: secondaryStorage
			? { storage: "secondary-storage" }
			: undefined,
		secondaryStorage,
		secret: env.BETTER_AUTH_SECRET,
		session: secondaryStorage
			? { storeSessionInDatabase: true }
			: undefined,
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
