import { useState, type ComponentProps } from "react";

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
  const [open, setOpen] = useState(false);
  const { isPending, mutate: deleteTodo } = useDeleteTodo({
    onSuccess: () => {
      setOpen(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger {...props}>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Todo Item?</DialogTitle>
          <DialogDescription>Are you sure? This action is not reversible</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose render={() => <Button variant="ghost">Cancel</Button>} />

          <Button
            disabled={isPending}
            variant="destructive"
            onClick={() => {
              deleteTodo({ id: todo.id });
            }}
          >
            {isPending ? "Deleting..." : "Delete Todo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
