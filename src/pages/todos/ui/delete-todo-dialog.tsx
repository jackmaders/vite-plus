import { useState, type ComponentProps } from "react";

import type { Todo } from "@/shared/db";
import { ApplicationError } from "@/shared/errors";
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
import { FieldError } from "@/shared/ui/shadcn/field";

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
  const deletion = useDeleteTodo({
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

        {deletion.isError && (
          <FieldError>{ApplicationError.from(deletion.error).clientMessage}</FieldError>
        )}

        <DialogFooter>
          <DialogClose render={() => <Button variant="ghost">Cancel</Button>} />

          <Button
            disabled={deletion.isPending}
            variant="destructive"
            onClick={() => {
              deletion.mutate({ id: todo.id });
            }}
          >
            {deletion.isPending ? "Deleting..." : "Delete Todo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
