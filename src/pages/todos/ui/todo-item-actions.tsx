import { Pencil, Trash2 } from "lucide-react";
import type { ComponentProps } from "react";

import type { Todo } from "@/shared/db";

import { DeleteTodoDialog } from "./delete-todo-dialog";
import { UpdateTodoDialog } from "./update-todo-dialog";

interface TodoItemActionsProps extends ComponentProps<"div"> {
  todo: Todo;
}

function TodoItemActions({ todo, ...props }: TodoItemActionsProps) {
  return (
    <div className="flex items-center gap-1" {...props}>
      <UpdateTodoDialog aria-label="Edit todo" todo={todo}>
        <Pencil />
      </UpdateTodoDialog>
      <DeleteTodoDialog aria-label="Delete todo" todo={todo}>
        <Trash2 />
      </DeleteTodoDialog>
    </div>
  );
}

export { TodoItemActions };
export type { TodoItemActionsProps };
