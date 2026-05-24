import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

export default defineConfig({
	integrations: [
		starlight({
			customCss: ["./src/styles/custom.css"],
			description:
				"A futuristic pastebin with syntax highlighting, expirations, password protection, and a public REST API.",
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
