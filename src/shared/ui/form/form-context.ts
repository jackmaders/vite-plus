import { createFormHookContexts } from "@tanstack/react-form";
import { createContext } from "react";

const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts();
const FormSubmissionErrorContext = createContext("");

export { fieldContext, formContext, FormSubmissionErrorContext, useFieldContext, useFormContext };
