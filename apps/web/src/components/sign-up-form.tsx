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

export const SignUpForm: FC<{
	onSwitchToSignIn: () => void;
}> = ({ onSwitchToSignIn }) => {
	const navigate = useNavigate({
		from: "/",
	});
	const { isPending } = authClient.useSession();
	const { t } = useTranslation();

	const form = useForm({
		defaultValues: {
			email: "",
			name: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signUp.email(
				{
					email: value.email,
					name: value.name,
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
						toast.success(t("auth.signUp.success"));
					},
				},
			);
		},
		validators: {
			onSubmit: z.object({
				email: z.email(t("auth.signUp.errors.invalidEmail")),
				name: z.string().min(2, t("auth.signUp.errors.nameTooShort")),
				password: z
					.string()
					.min(8, t("auth.signUp.errors.passwordTooShort")),
			}),
		},
	});

	if (isPending) return <Loader />;

	return (
		<div className="mx-auto mt-10 w-full max-w-md p-6">
			<h1 className="mb-6 text-center font-bold text-3xl">
				{t("auth.signUp.title")}
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
					<form.Field name="name">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>
									{t("auth.signUp.nameLabel")}
								</Label>
								<Input
									id={field.name}
									name={field.name}
									onBlur={field.handleBlur}
									onChange={(e) =>
										field.handleChange(e.target.value)
									}
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
					<form.Field name="email">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>
									{t("auth.signUp.emailLabel")}
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
									{t("auth.signUp.passwordLabel")}
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
								? t("auth.signUp.submitting")
								: t("auth.signUp.submit")}
						</Button>
					)}
				</form.Subscribe>
			</form>

			<div className="mt-4 text-center">
				<Button
					className="text-indigo-600 hover:text-indigo-800"
					onClick={onSwitchToSignIn}
					variant="link"
				>
					{t("auth.signUp.switchToSignIn")}
				</Button>
			</div>
		</div>
	);
};
