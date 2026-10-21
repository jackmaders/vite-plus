import { useSelector } from "@tanstack/react-form";

import { useAppForm } from "@/shared/ui/form";
import { Card } from "@/shared/ui/shadcn/card";

import { createTodoInputSchema, type CreateTodoInput } from "../model/todo-schema";

const EMPTY_LENGTH = 0;

interface TodoFormProps {
  onCreate: (input: CreateTodoInput) => void | Promise<void>;
}

const DEFAULT_FORM_VALUES: CreateTodoInput = {
  description: "",
  title: "",
};

function TodoForm({ onCreate }: TodoFormProps) {
  const form = useAppForm({
    defaultValues: DEFAULT_FORM_VALUES,
    onSubmit: async ({ value: { description, title } }) => {
      const trimmedDescription = description?.trim();
      const hasDescription =
        typeof trimmedDescription === "string" && trimmedDescription.length > EMPTY_LENGTH;

      await onCreate(
        hasDescription
          ? { description: trimmedDescription, title: title.trim() }
          : { title: title.trim() },
      );

      form.reset();
    },
    validators: {
      onChange: createTodoInputSchema,
      onMount: createTodoInputSchema,
    },
  });

  const isSubmitting = useSelector(form.store, (state) => state.isSubmitting);

  return (
    <Card className="p-4">
      <form.AppForm>
        <form.Form className="flex flex-col gap-3">
          <form.AppField name="title">
            {(field) => (
              <field.TextField disabled={isSubmitting} label="Title" placeholder="Title" />
            )}
          </form.AppField>
          <form.AppField name="description">
            {(field) => (
              <field.TextField
                disabled={isSubmitting}
                label="Description"
                placeholder="Description"
              />
            )}
          </form.AppField>
          <form.SubmitButton busyLabel="Adding...">Add Todo</form.SubmitButton>
        </form.Form>
      </form.AppForm>
    </Card>
  );
}

export { TodoForm };
export type { TodoFormProps };
