import { useAppForm, type FormProps } from "@/shared/ui/form";
import { Card } from "@/shared/ui/shadcn/card";

import { useCreateTodo } from "../api/use-create-todo";
import { createTodoInputSchema, type CreateTodoInput } from "../model/todo-schema";

type TodoFormProps = FormProps;

const DEFAULT_FORM_VALUES: CreateTodoInput = {
  description: "",
  title: "",
};

function CreateTodoForm(props: TodoFormProps = {}) {
  const { mutateAsync: createTodo } = useCreateTodo();

  const form = useAppForm({
    defaultValues: DEFAULT_FORM_VALUES,
    onSubmit: async ({ value }) => {
      await createTodo(value);
    },
    validators: {
      onChange: createTodoInputSchema,
      onMount: createTodoInputSchema,
    },
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
          <form.SubmitButton busyLabel="Adding...">Add Todo</form.SubmitButton>
        </form.Form>
      </form.AppForm>
    </Card>
  );
}

export { CreateTodoForm };
