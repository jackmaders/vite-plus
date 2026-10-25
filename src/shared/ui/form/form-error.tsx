import { useContext, type ComponentProps } from "react";

import { FieldError } from "@/shared/ui/shadcn/field";

import { FormSubmissionErrorContext, useFormContext } from "./form-context";

function selectSubmitError(state: { errorMap: { onSubmit?: unknown } }) {
  return state.errorMap.onSubmit;
}

function FormError(props: Omit<ComponentProps<typeof FieldError>, "children" | "errors">) {
  const form = useFormContext();
  const submissionError = useContext(FormSubmissionErrorContext);
  return (
    <form.Subscribe selector={selectSubmitError}>
      {(error) => {
        const message = submissionError === "" ? error : submissionError;
        return typeof message === "string" && <FieldError {...props}>{message}</FieldError>;
      }}
    </form.Subscribe>
  );
}

export { FormError };
