import type { ComponentProps } from "react";

import { Button } from "@/shared/ui/shadcn/button";
import { FieldError } from "@/shared/ui/shadcn/field";

import { useFormContext } from "./form-context";

function selectSubmitError(state: { errorMap: { onSubmit?: unknown } }) {
  return state.errorMap.onSubmit;
}

function FormError(props: Omit<ComponentProps<typeof FieldError>, "children" | "errors">) {
  const form = useFormContext();
  return (
    <form.Subscribe selector={selectSubmitError}>
      {(error) =>
        typeof error === "string" && (
          <div className="flex flex-col gap-2">
            <FieldError {...props}>{error}</FieldError>
            <Button
              type="button"
              variant="outline"
              onClick={(event) => {
                const element = event.currentTarget.closest("form");
                // A submission error makes Form invalid; clear it before validating the retry.
                // eslint-disable-next-line no-undefined -- Native Form API clears this validation slot with undefined.
                form.setErrorMap({ onSubmit: undefined });
                element?.requestSubmit();
              }}
            >
              Try again
            </Button>
          </div>
        )
      }
    </form.Subscribe>
  );
}

export { FormError };
