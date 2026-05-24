import { QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { Loader } from "./components/loader";
import "./i18n";
import { routeTree } from "./routeTree.gen";
import { queryClient, trpc } from "./utils/trpc";

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const rootElement = document.getElementById("app");
if (!rootElement) throw new Error("Root element not found");

const router = createRouter({
	context: { queryClient, trpc },
	defaultPendingComponent: () => <Loader />,
	defaultPreload: "intent",
	routeTree,
	scrollRestoration: true,
	Wrap: ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>
			{children}
		</QueryClientProvider>
	),
});

if (!rootElement.innerHTML) {
	const root = createRoot(rootElement);
	root.render(<RouterProvider router={router} />);
}
