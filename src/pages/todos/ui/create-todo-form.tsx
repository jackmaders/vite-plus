import type { ComponentProps } from "react";

import { FormSubmissionError, useAppForm, type Form } from "@/shared/ui/form";
import { Card } from "@/shared/ui/shadcn/card";

import { useCreateTodo } from "../api/use-create-todo";
import { getTodoErrorMessage } from "../model/mutation-error";
import { createTodoInputSchema, type CreateTodoInput } from "../model/todo-schema";

const DEFAULT_FORM_VALUES: CreateTodoInput = {
  description: "",
  title: "",
};

function CreateTodoForm({ ...props }: ComponentProps<typeof Form> = {}) {
  const { mutateAsync: createTodo } = useCreateTodo({ meta: { errorHandling: "inline" } });

  const form = useAppForm({
    defaultValues: DEFAULT_FORM_VALUES,
    onSubmit: async ({ value, formApi }) => {
      try {
        await createTodo(value);
      } catch (error) {
        throw new FormSubmissionError(getTodoErrorMessage(error));
      }
      formApi.reset();
    },
    validators: { onChange: createTodoInputSchema },
  });

  return (
    <Card>
      <form.AppForm>
        <form.Form className="flex flex-col gap-3" {...props}>
          <form.AppField name="title">
            {(field) => <field.TextField label="Title" placeholder="Title" />}
          </form.AppField>
          <form.AppField name="description">
            {(field) => <field.TextField label="Description" placeholder="Description" />}
          </form.AppField>
          <form.FormError />
          <form.SubmitButton busyLabel="Adding...">Add Todo</form.SubmitButton>
        </form.Form>
      </form.AppForm>
    </Card>
  );
}

export { CreateTodoForm };
