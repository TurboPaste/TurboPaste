import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	client: {
		VITE_DOCS_URL: z.url().default("http://localhost:4321"),
		VITE_SERVER_URL: z.url(),
	},
	clientPrefix: "VITE_",
	emptyStringAsUndefined: true,
	// biome-ignore lint/suspicious/noExplicitAny: This is required to access the environment variables in the client-side code.
	runtimeEnv: (import.meta as any).env,
});
