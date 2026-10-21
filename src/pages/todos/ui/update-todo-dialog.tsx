import type { ComponentProps } from "react";

import type { Todo } from "@/shared/db";
import { useAppForm } from "@/shared/ui/form";
import { Button } from "@/shared/ui/shadcn/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/shadcn/dialog";

import { useUpdateTodo } from "../api/use-update-todo";
import { updateTodoDataSchema, type UpdateTodoData } from "../model/todo-schema";

interface UpdateTodoDialogProps extends ComponentProps<typeof DialogTrigger> {
  todo: Todo;
}

const DEFAULT_FORM_VALUES: UpdateTodoData = {
  description: "",
  title: "",
};

export function UpdateTodoDialog({
  children = "Update Item",
  todo,
  ...props
}: UpdateTodoDialogProps) {
  return (
    <Dialog>
      <DialogTrigger {...props}>{children}</DialogTrigger>
      <DialogContent>
        <UpdateTodoForm todo={todo} />
      </DialogContent>
    </Dialog>
  );
}

interface UpdateTodoFormProps {
  todo: Todo;
}

function UpdateTodoForm({ todo }: UpdateTodoFormProps) {
  const { mutate: updateTodo } = useUpdateTodo();

  const form = useAppForm({
    defaultValues: DEFAULT_FORM_VALUES,
    onSubmit: ({ value }) => {
      updateTodo({ data: value, id: todo.id });
    },
    validators: {
      onChange: updateTodoDataSchema,
      onMount: updateTodoDataSchema,
    },
  });

  return (
    <form.AppForm>
      <form.Form className="flex flex-col gap-3">
        <DialogHeader>
          <DialogTitle>Update Todo Item?</DialogTitle>
        </DialogHeader>
        <form.AppField name="title">
          {(field) => <field.TextField label="Title" placeholder="Title" />}
        </form.AppField>
        <form.AppField name="description">
          {(field) => <field.TextField label="Description" placeholder="Description" />}
        </form.AppField>
        <DialogFooter>
          <DialogClose render={() => <Button variant="ghost">Cancel</Button>} />
          <DialogClose render={() => <form.SubmitButton>Update</form.SubmitButton>} />
        </DialogFooter>
      </form.Form>
    </form.AppForm>
  );
}
