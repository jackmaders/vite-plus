import { useCallback, useId, type ChangeEvent, type ComponentProps } from "react";

import { Field, FieldError, FieldLabel } from "@/shared/ui/shadcn/field";
import { Input } from "@/shared/ui/shadcn/input";

import { useFieldContext, useFormContext } from "./form-context";

type TextFieldProps = Omit<
  ComponentProps<typeof Input>,
  "aria-describedby" | "aria-invalid" | "id" | "name" | "onBlur" | "onChange" | "value"
> & {
  label: string;
};

function selectIsSubmitting(state: { isSubmitting: boolean }) {
  return state.isSubmitting;
}

function TextField({ disabled, label, ...props }: TextFieldProps) {
  const field = useFieldContext<string>();
  const form = useFormContext();
  const id = useId();
  const errorId = `${id}-error`;
  const { errors, isTouched, isValid } = field.state.meta;
  const isInvalid = !isValid && isTouched;

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      field.handleChange(event.currentTarget.value);
    },
    [field],
  );

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <form.Subscribe selector={selectIsSubmitting}>
        {(isSubmitting) => (
          <Input
            {...props}
            {...(isInvalid ? { "aria-describedby": errorId } : {})}
            aria-invalid={isInvalid}
            disabled={Boolean(disabled) || isSubmitting}
            id={id}
            name={field.name}
            onBlur={field.handleBlur}
            onChange={handleChange}
            value={field.state.value}
          />
        )}
      </form.Subscribe>
      <FieldError errors={errors} hidden={!isInvalid} id={errorId} />
    </Field>
  );
}

export { TextField };
export type { TextFieldProps };
