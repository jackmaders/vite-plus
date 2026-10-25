import type { ComponentProps } from "react";

import { Button } from "@/shared/ui/shadcn/button";

import { useFormContext } from "./form-context";

interface SubmitButtonProps extends ComponentProps<typeof Button> {
  busyLabel?: string;
}

function SubmitButton({
  busyLabel = "Please wait…",
  children,
  disabled,
  type = "submit",
  ...props
}: SubmitButtonProps) {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
      {([canSubmit, isSubmitting]) => (
        <Button
          {...props}
          aria-busy={isSubmitting}
          disabled={Boolean(disabled) || !canSubmit || isSubmitting}
          type={type}
        >
          {isSubmitting ? busyLabel : children}
        </Button>
      )}
    </form.Subscribe>
  );
}

export { SubmitButton };
export type { SubmitButtonProps };
