import { useCallback, type ComponentProps, type SubmitEvent } from "react";

import { useFormContext } from "./form-context";
import { FormSubmissionError } from "./form-submission-error";

interface FormProps extends Omit<ComponentProps<"form">, "onError" | "onSubmit"> {
  onError?: (error: unknown) => void;
  onSuccess?: () => void;
}

function Form({ onError, onSuccess, ...props }: FormProps) {
  const form = useFormContext();

  const handleSubmit = useCallback(
    (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault();
      event.stopPropagation();
      void (async () => {
        try {
          await form.handleSubmit();
          if (form.state.isSubmitSuccessful) {
            onSuccess?.();
          }
        } catch (error) {
          form.setErrorMap({
            onSubmit:
              error instanceof FormSubmissionError
                ? error.message
                : "Something went wrong. Please try again.",
          });
          onError?.(error);
        }
      })();
    },
    [form, onError, onSuccess],
  );

  return <form onSubmit={handleSubmit} {...props} />;
}

export { Form };
export type { FormProps };
