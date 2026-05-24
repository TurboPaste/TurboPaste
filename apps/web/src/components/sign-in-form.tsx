import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@turbopaste/ui/components/button";
import { Input } from "@turbopaste/ui/components/input";
import { Label } from "@turbopaste/ui/components/label";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import z from "zod";
import { authClient } from "@/lib/auth-client";
import { Loader } from "./loader";

export const SignInForm: FC<{
	onSwitchToSignUp: () => void;
}> = ({ onSwitchToSignUp }) => {
	const navigate = useNavigate({
		from: "/",
	});
	const { isPending } = authClient.useSession();
	const { t } = useTranslation();

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signIn.email(
				{
					email: value.email,
					password: value.password,
				},
				{
					onError: (error) => {
						toast.error(
							error.error.message || error.error.statusText,
						);
					},
					onSuccess: () => {
						navigate({
							to: "/dashboard",
						});
						toast.success(t("auth.signIn.success"));
					},
				},
			);
		},
		validators: {
			onSubmit: z.object({
				email: z.email(t("auth.signIn.errors.invalidEmail")),
				password: z
					.string()
					.min(8, t("auth.signIn.errors.passwordTooShort")),
			}),
		},
	});

	if (isPending) return <Loader />;

	return (
		<div className="mx-auto mt-10 w-full max-w-md p-6">
			<h1 className="mb-6 text-center font-bold text-3xl">
				{t("auth.signIn.title")}
			</h1>

			<form
				className="space-y-4"
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<div>
					<form.Field name="email">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>
									{t("auth.signIn.emailLabel")}
								</Label>
								<Input
									id={field.name}
									name={field.name}
									onBlur={field.handleBlur}
									onChange={(e) =>
										field.handleChange(e.target.value)
									}
									type="email"
									value={field.state.value}
								/>
								{field.state.meta.errors.map((error) => (
									<p
										className="text-red-500"
										key={error?.message}
									>
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</div>

				<div>
					<form.Field name="password">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>
									{t("auth.signIn.passwordLabel")}
								</Label>
								<Input
									id={field.name}
									name={field.name}
									onBlur={field.handleBlur}
									onChange={(e) =>
										field.handleChange(e.target.value)
									}
									type="password"
									value={field.state.value}
								/>
								{field.state.meta.errors.map((error) => (
									<p
										className="text-red-500"
										key={error?.message}
									>
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</div>

				<form.Subscribe
					selector={(state) => ({
						canSubmit: state.canSubmit,
						isSubmitting: state.isSubmitting,
					})}
				>
					{({ canSubmit, isSubmitting }) => (
						<Button
							className="w-full"
							disabled={!canSubmit || isSubmitting}
							type="submit"
						>
							{isSubmitting
								? t("auth.signIn.submitting")
								: t("auth.signIn.submit")}
						</Button>
					)}
				</form.Subscribe>
			</form>

			<div className="mt-4 text-center">
				<Button
					className="text-indigo-600 hover:text-indigo-800"
					onClick={onSwitchToSignUp}
					variant="link"
				>
					{t("auth.signIn.switchToSignUp")}
				</Button>
			</div>
		</div>
	);
};
