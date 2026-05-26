import { Redis } from "ioredis";

export interface RateResult {
	allowed: boolean;
	remaining: number;
	resetAt: number;
}

export type RateLimiter = (key: string, limit: number) => Promise<RateResult>;

export const RATE_WINDOW_MS = 60_000;
export const RATE_LIMIT_AUTHED = 120;
export const RATE_LIMIT_ANON = 20;

const REDIS_KEY_PREFIX = "tp:rl:";

const CHECK_INCR_LUA = `
local count = tonumber(redis.call('GET', KEYS[1]) or '0')
local limit = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
if count >= limit then
	local ttl = redis.call('PTTL', KEYS[1])
	if ttl < 0 then ttl = window end
	return {0, count, ttl}
end
local new = redis.call('INCR', KEYS[1])
if new == 1 then
	redis.call('PEXPIRE', KEYS[1], window)
	return {1, new, window}
end
local ttl = redis.call('PTTL', KEYS[1])
if ttl < 0 then ttl = window end
return {1, new, ttl}
`;

const memoryLimiter = (): RateLimiter => {
	const buckets = new Map<string, { count: number; resetAt: number }>();

	return async (key, limit) => {
		const now = Date.now();
		const bucket = buckets.get(key);
		if (!bucket || bucket.resetAt <= now) {
			buckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });

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
};

const redisLimiter = (url: string): RateLimiter => {
	const client = new Redis(url, {
		enableOfflineQueue: false,
		maxRetriesPerRequest: 1,
	});
	const fallback = memoryLimiter();
	let warned = false;

	client.on("error", (err) => {
		if (warned) return;

		warned = true;

		console.error(
			"[rate-limit] redis error, falling back to in-memory:",
			err.message,
		);
	});

	client.on("ready", () => {
		warned = false;
	});

	return async (key, limit) => {
		try {
			const result = (await client.eval(
				CHECK_INCR_LUA,
				1,
				`${REDIS_KEY_PREFIX}${key}`,
				String(limit),
				String(RATE_WINDOW_MS),
			)) as [number, number, number];
			const [allowed, count, ttlMs] = result;

			return {
				allowed: allowed === 1,
				remaining: Math.max(0, limit - count),
				resetAt: Date.now() + ttlMs,
			};
		} catch {
			return fallback(key, limit);
		}
	};
};

export const createRateLimiter = (redisUrl?: string): RateLimiter =>
	redisUrl ? redisLimiter(redisUrl) : memoryLimiter();
