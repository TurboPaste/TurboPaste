import { createFileRoute } from "@tanstack/react-router";
import { env } from "@turbopaste/env/web";
import { type FC, useEffect } from "react";

const DocsRedirect: FC = () => {
	useEffect(() => {
		window.location.replace(env.VITE_DOCS_URL);
	}, []);

	return (
		<div className="mx-auto max-w-md px-4 py-20 text-center text-muted-foreground text-sm">
			Redirecting to the docs...{" "}
			<a className="underline" href={env.VITE_DOCS_URL}>
				Click here
			</a>{" "}
			if it doesn't happen automatically.
		</div>
	);
};

export const Route = createFileRoute("/docs")({
	component: DocsRedirect,
});
