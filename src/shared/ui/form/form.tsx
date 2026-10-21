import { useCallback, type ComponentProps, type SyntheticEvent } from "react";

import { useFormContext } from "./form-context";
import { FormSubmissionError } from "./form-submission-error";

interface FormProps extends Omit<ComponentProps<"form">, "onError" | "onSubmit"> {
  onError?: (error: unknown) => void;
}

function Form({ onError, ...props }: FormProps) {
  const form = useFormContext();

  const handleSubmit = useCallback(
    (event: SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault();
      event.stopPropagation();
      void (async () => {
        try {
          await form.handleSubmit();
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
    [form, onError],
  );

  return <form onSubmit={handleSubmit} {...props} />;
}

export { Form };
export type { FormProps };
