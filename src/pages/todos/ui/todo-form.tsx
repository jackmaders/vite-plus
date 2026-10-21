import { useAppForm } from "@/shared/ui/form";
import { Card } from "@/shared/ui/shadcn/card";

import { createTodoInputSchema } from "../model/todo-schema";

interface TodoFormProps {
  isCreating?: boolean;
  onCreate: (input: { description?: string | null; title: string }) => void;
}

function createTodoPayload(title: string, description: string) {
  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();
  return trimmedDescription === ""
    ? { title: trimmedTitle }
    : { description: trimmedDescription, title: trimmedTitle };
}

function validateTodoInput({ value }: { value: { description: string; title: string } }) {
  const result = createTodoInputSchema.safeParse(value);
  return result.success ? "" : "Title is required";
}

function TodoForm({ isCreating = false, onCreate }: TodoFormProps) {
  const form = useAppForm({
    defaultValues: { description: "", title: "" },
    onSubmit: ({ value }) => {
      if (value.title.trim() === "" || isCreating) {
        return;
      }
      onCreate(createTodoPayload(value.title, value.description));
      form.reset();
    },
    validators: {
      onChange: validateTodoInput,
      onMount: validateTodoInput,
    },
  });

  return (
    <Card className="p-4">
      <form.AppForm>
        <form.Form className="flex flex-col gap-3">
          <form.AppField name="title">
            {(field) => <field.TextField disabled={isCreating} label="Title" placeholder="Title" />}
          </form.AppField>
          <form.AppField name="description">
            {(field) => (
              <field.TextField
                disabled={isCreating}
                label="Description"
                placeholder="Description"
              />
            )}
          </form.AppField>
          <form.SubmitButton disabled={isCreating}>
            {isCreating ? "Adding..." : "Add Todo"}
          </form.SubmitButton>
        </form.Form>
      </form.AppForm>
    </Card>
  );
}

export { TodoForm };
export type { TodoFormProps };
