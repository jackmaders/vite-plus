import { useCallback, type ComponentProps, type SubmitEvent } from "react";

import { useFormContext } from "./form-context";
import { FormSubmissionError } from "./form-submission-error";

interface FormProps extends Omit<ComponentProps<"form">, "onError"> {
  onError?: (error: unknown) => void;
}

function Form({ onError, onSubmit, ...props }: FormProps) {
  const form = useFormContext();

  const handleSubmit = useCallback(
    (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault();
      event.stopPropagation();
      void (async () => {
        try {
          await form.handleSubmit();
          form.reset();
          onSubmit?.(event);
        } catch (error) {
          form.setErrorMap({
            onSubmit: {
              fields: {},
              form:
                error instanceof FormSubmissionError
                  ? error.message
                  : "Something went wrong. Please try again.",
            },
          });
          onError?.(error);
        }
      })();
    },
    [form, onError, onSubmit],
  );

  return <form onSubmit={handleSubmit} {...props} />;
}

export { Form };
export type { FormProps };
