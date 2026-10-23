import { useCallback, type ComponentProps, type SubmitEvent } from "react";

import { getErrorMessage } from "../../errors";
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
          await form.handleSubmit();
        } catch (error) {
          form.setErrorMap({
            onSubmit: error instanceof FormSubmissionError ? error.message : getErrorMessage(error),
          });
        }
      })();
    },
    [form],
  );

  return <form onSubmit={handleSubmit} {...props} />;
}

export { Form };
