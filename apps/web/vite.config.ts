import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
	plugins: [
		tailwindcss(),
		tanstackRouter({
			autoCodeSplitting: true,
			target: "react",
		}),
		react(),
		VitePWA({
			devOptions: { enabled: false },
			manifest: {
				description: "TurboPaste",
				name: "turbopaste",
				short_name: "turbopaste",
				theme_color: "#0c0c0c",
			},
			pwaAssets: { config: true, disabled: false },
			registerType: "autoUpdate",
		}),
	],
	resolve: {
		tsconfigPaths: true,
	},
	server: {
		port: 3001,
	},
});
