import { cn } from "cn";
import { Pencil, Trash2 } from "lucide-react";
import type { ComponentProps } from "react";

import type { Todo } from "@/shared/db";
import { Card } from "@/shared/ui/shadcn/card";

import { CopyTodoButton } from "./copy-todo-button";
import { DeleteTodoDialog } from "./delete-todo-dialog";
import { TodoItemSummary } from "./todo-item-summary";
import { UpdateTodoDialog } from "./update-todo-dialog";

interface TodoItemProps extends ComponentProps<typeof Card> {
  todo: Todo;
}

function TodoItem({ todo, className, ...props }: TodoItemProps) {
  return (
    <Card className={cn("flex items-center justify-between p-4", className)} {...props}>
      <TodoItemSummary todo={todo} />
      <div className="flex items-center gap-1">
        <CopyTodoButton todo={todo} />
        <UpdateTodoDialog aria-label="Edit todo" todo={todo}>
          <Pencil />
        </UpdateTodoDialog>
        <DeleteTodoDialog aria-label="Delete todo" todo={todo}>
          <Trash2 />
        </DeleteTodoDialog>
      </div>
    </Card>
  );
}

export { TodoItem };
export type { TodoItemProps };
