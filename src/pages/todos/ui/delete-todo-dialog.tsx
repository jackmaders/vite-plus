import type { ComponentProps } from "react";

import type { Todo } from "@/shared/db";
import { Button } from "@/shared/ui/shadcn/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/shadcn/dialog";

import { useDeleteTodo } from "../api/use-delete-todo";

interface DeleteTodoDialogProps extends ComponentProps<typeof DialogTrigger> {
  todo: Todo;
}

export function DeleteTodoDialog({
  children = "Delete Item",
  todo,
  ...props
}: DeleteTodoDialogProps) {
  const { mutate: deleteTodo } = useDeleteTodo();

  return (
    <Dialog>
      <DialogTrigger {...props}>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Todo Item?</DialogTitle>
          <DialogDescription>Are you sure? This actions is not reversable</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose render={() => <Button variant="ghost">Cancel</Button>} />

          <Button
            variant="destructive"
            onClick={() => {
              deleteTodo({ id: todo.id });
            }}
          >
            Delete Todo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
