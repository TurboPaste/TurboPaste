import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "@turbopaste/ui/components/sonner";
import type { FC } from "react";
import { Header } from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import type { trpc } from "@/utils/trpc";

import "../index.css";

export interface RouterAppContext {
	queryClient: QueryClient;
	trpc: typeof trpc;
}

const RootComponent: FC = () => {
	return (
		<>
			<HeadContent />
			<ThemeProvider
				attribute="class"
				defaultTheme="dark"
				disableTransitionOnChange
				storageKey="turbopaste-theme"
			>
				<div className="relative z-10 flex min-h-svh flex-col">
					<Header />
					<main className="flex-1">
						<Outlet />
					</main>
				</div>
				<Toaster richColors theme="dark" />
			</ThemeProvider>
			<TanStackRouterDevtools position="bottom-left" />
			<ReactQueryDevtools
				buttonPosition="bottom-right"
				position="bottom"
			/>
		</>
	);
};

export const Route = createRootRouteWithContext<RouterAppContext>()({
	component: RootComponent,
	head: () => ({
		links: [{ href: "/favicon.ico", rel: "icon" }],
		meta: [
			{ title: "TurboPaste - modern, futuristic pastebin" },
			{
				content:
					"TurboPaste - share code and text with a futuristic pastebin.",
				name: "description",
			},
		],
	}),
});
