import { Loader } from "lucide-react";
import type { ComponentProps } from "react";

import { Button } from "@/shared/ui/shadcn/button";

import { useFormContext } from "./form-context";

function SubmitButton({
  children,
  disabled,
  type = "submit",
  ...props
}: ComponentProps<typeof Button>) {
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
          {isSubmitting ? (
            <>
              <Loader aria-hidden="true" />
              <span className="sr-only">Please wait…</span>
            </>
          ) : (
            children
          )}
        </Button>
      )}
    </form.Subscribe>
  );
}

export { SubmitButton };
