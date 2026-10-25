import { useCallback, type ComponentProps, type SubmitEvent } from "react";

import { ApplicationError } from "../../errors";
import { useFormContext } from "./form-context";
import { FormSubmissionError } from "./form-submission-error";

function Form({ ...props }: Omit<ComponentProps<"form">, "onSubmit">) {
  const form = useFormContext();

  const handleSubmit = useCallback(
    (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault();
      event.stopPropagation();
      void (async () => {
        try {
          // oxlint-disable-next-line no-undefined -- Form clears a validation slot with undefined.
          form.setErrorMap({ onSubmit: undefined });
          await form.handleSubmit();
        } catch (error) {
          form.setErrorMap({
            onSubmit:
              error instanceof ApplicationError || error instanceof FormSubmissionError
                ? error.message
                : "Something went wrong. Please try again.",
          });
        }
      })();
    },
    [form],
  );

  return <form onSubmit={handleSubmit} {...props} />;
}

export { Form };
