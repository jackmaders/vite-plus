import { createFormHook } from "@tanstack/react-form";
import type { ComponentProps } from "react";

import { Form } from "./form";
import { fieldContext, formContext } from "./form-context";
import { FormError } from "./form-error";
import { SubmitButton } from "./submit-button";
import { TextField } from "./text-field";

const { useAppForm } = createFormHook({
  fieldComponents: { TextField },
  fieldContext,
  formComponents: { Form, FormError, SubmitButton },
  formContext,
});

type AppForm = ComponentProps<ReturnType<typeof useAppForm>["Form"]>;

export { useAppForm };
export type { AppForm };
