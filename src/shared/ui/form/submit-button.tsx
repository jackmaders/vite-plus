import type { ComponentProps } from "react";

import { Button } from "@/shared/ui/shadcn/button";

import { useFormContext } from "./form-context";

interface SubmitState {
  canSubmit: boolean;
  errorMap: { onSubmit?: unknown };
  errors: unknown[];
  isFieldsValid: boolean;
  isSubmitting: boolean;
  isValidating: boolean;
}

function selectSubmitState(state: SubmitState) {
  const canRetry =
    typeof state.errorMap.onSubmit === "string" &&
    state.isFieldsValid &&
    !state.isValidating &&
    state.errors.length === 1;
  return [state.canSubmit || canRetry, state.isSubmitting] as const;
}

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
    <form.Subscribe selector={selectSubmitState}>
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
