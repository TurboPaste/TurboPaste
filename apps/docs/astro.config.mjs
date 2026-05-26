import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

export default defineConfig({
	integrations: [
		starlight({
			components: {
				Footer: "./src/components/Footer.astro",
			},
			customCss: ["./src/styles/custom.css"],
			description:
				"A futuristic pastebin with syntax highlighting, expirations, password protection, and a public REST API.",
			favicon: "/favicon-dark.svg",
			head: [
				{
					attrs: {
						href: "/favicon-light.svg",
						media: "(prefers-color-scheme: light)",
						rel: "icon",
						type: "image/svg+xml",
					},
					tag: "link",
				},
				{
					attrs: {
						href: "/favicon-dark.svg",
						media: "(prefers-color-scheme: dark)",
						rel: "icon",
						type: "image/svg+xml",
					},
					tag: "link",
				},
			],
			sidebar: [
				{
					items: [
						{ label: "Introduction", slug: "introduction" },
						{ label: "Quickstart", slug: "quickstart" },
					],
					label: "Start here",
				},
				{
					items: [
						{
							label: "Creating pastes",
							slug: "guides/creating-pastes",
						},
						{
							label: "Visibility & access",
							slug: "guides/visibility",
						},
						{
							label: "Expirations & burn after read",
							slug: "guides/expirations",
						},
						{
							label: "Editing your pastes",
							slug: "guides/editing",
						},
						{
							label: "Reporting & moderation",
							slug: "guides/moderation",
						},
					],
					label: "Guides",
				},
				{
					items: [
						{ label: "Overview", slug: "api/overview" },
						{ label: "Authentication", slug: "api/authentication" },
						{ label: "Pastes", slug: "api/pastes" },
						{ label: "Reports", slug: "api/reports" },
						{ label: "Errors & rate limits", slug: "api/errors" },
					],
					label: "Public API",
				},
				{
					items: [
						{
							label: "Architecture",
							slug: "reference/architecture",
						},
						{ label: "Data model", slug: "reference/data-model" },
						{
							label: "Self-hosting",
							slug: "reference/self-hosting",
						},
						{
							label: "Localization",
							slug: "reference/localization",
						},
					],
					label: "Reference",
				},
			],
			social: [
				{
					href: "https://github.com/TurboPaste/TurboPaste",
					icon: "github",
					label: "GitHub",
				},
			],
			title: "TurboPaste",
		}),
	],
});
