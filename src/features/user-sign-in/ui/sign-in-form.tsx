import { cn } from "cn";
import { z } from "zod";

import { signIn } from "@/shared/auth";
import { useAppForm, type AppForm } from "@/shared/ui/form";

const signInSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export function SignInForm({ className, ...props }: AppForm) {
  const form = useAppForm({
    defaultValues: { email: "", password: "" },
    onSubmit: async ({ value }) => await signIn.email(value),
    validators: { onChange: signInSchema },
  });

  return (
    <form.AppForm>
      <form.Form className={cn("flex flex-col gap-4", className)} {...props}>
        <form.AppField name="email">
          {(field) => (
            <field.TextField
              label="Email"
              type="email"
              autoComplete="email"
              required
              placeholder="name@example.com"
            />
          )}
        </form.AppField>
        <form.AppField name="password">
          {(field) => (
            <field.TextField
              label="Password"
              type="password"
              autoComplete="current-password"
              required
            />
          )}
        </form.AppField>
        <form.FormError />
        <form.SubmitButton className="w-full">Sign in</form.SubmitButton>
      </form.Form>
    </form.AppForm>
  );
}
