import type { ComponentProps } from "react";

import { Button } from "@/shared/ui/shadcn/button";

import { useFormContext } from "./form-context";

function selectSubmitState(state: { canSubmit: boolean; isSubmitting: boolean }) {
  return [state.canSubmit, state.isSubmitting] as const;
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
