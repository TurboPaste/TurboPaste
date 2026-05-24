import {
	createHash,
	randomBytes,
	scryptSync,
	timingSafeEqual,
} from "node:crypto";
import { customAlphabet } from "nanoid";

const API_KEY_PREFIX = "tp_";
export const MAX_CONTENT_BYTES = 1024 * 1024;
export const VISIBILITIES = ["public", "unlisted", "private"] as const;
export type Visibility = (typeof VISIBILITIES)[number];

const idAlphabet = "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
const newPasteId = customAlphabet(idAlphabet, 10);

export const EXPIRATION_OPTIONS = {
	"1d": 24 * 60 * 60 * 1000,
	"1h": 60 * 60 * 1000,
	"1w": 7 * 24 * 60 * 60 * 1000,
	"10m": 10 * 60 * 1000,
	never: null,
} as const;

export type ExpirationKey = keyof typeof EXPIRATION_OPTIONS;

export const generatePasteId = () => {
	return newPasteId();
};

export const hashPassword = (password: string) => {
	const salt = randomBytes(16).toString("hex");
	const derived = scryptSync(password, salt, 64).toString("hex");

	return `${salt}:${derived}`;
};

export const verifyPassword = (password: string, stored: string) => {
	const [salt, derived] = stored.split(":");
	if (!salt || !derived) return false;

	const test = scryptSync(password, salt, 64);
	const ref = Buffer.from(derived, "hex");
	if (test.length !== ref.length) return false;

	return timingSafeEqual(test, ref);
};

export const generateApiKey = () => {
	const raw = randomBytes(24).toString("base64url");
	const key = `${API_KEY_PREFIX}${raw}`;
	const hash = hashApiKey(key);
	const prefix = key.slice(0, 11);

	return { hash, key, prefix };
};

export const hashApiKey = (key: string) =>
	createHash("sha256").update(key).digest("hex");

export const isExpired = (expiresAt: Date | null | undefined) =>
	!expiresAt ? false : expiresAt.getTime() <= Date.now();

export const expirationToDate = (key: ExpirationKey): Date | null => {
	const ms = EXPIRATION_OPTIONS[key];

	return ms === null ? null : new Date(Date.now() + ms);
};
