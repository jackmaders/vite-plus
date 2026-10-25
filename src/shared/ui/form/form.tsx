import { useCallback, useState, type ComponentProps, type SubmitEvent } from "react";

import { ApplicationError } from "../../errors";
import { FormSubmissionErrorContext, useFormContext } from "./form-context";
import { FormSubmissionError } from "./form-submission-error";

function Form({ children, ...props }: Omit<ComponentProps<"form">, "onSubmit">) {
  const form = useFormContext();
  const [submissionError, setSubmissionError] = useState("");

  const handleSubmit = useCallback(
    (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setSubmissionError("");
      void (async () => {
        try {
          await form.handleSubmit();
        } catch (error) {
          setSubmissionError(
            error instanceof ApplicationError || error instanceof FormSubmissionError
              ? error.message
              : "Something went wrong. Please try again.",
          );
        }
      })();
    },
    [form],
  );

  return (
    <form onSubmit={handleSubmit} {...props}>
      <FormSubmissionErrorContext value={submissionError}>{children}</FormSubmissionErrorContext>
    </form>
  );
}

export { Form };
