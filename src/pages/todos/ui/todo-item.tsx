import { cn } from "cn";
import type { ComponentProps } from "react";

import type { Todo } from "@/shared/db";
import { Card } from "@/shared/ui/shadcn/card";

import { TodoItemActions } from "./todo-item-actions";
import { TodoItemSummary } from "./todo-item-summary";

interface TodoItemProps extends ComponentProps<typeof Card> {
  todo: Todo;
}

function TodoItem({ todo, className, ...props }: TodoItemProps) {
  return (
    <Card className={cn("flex items-center justify-between p-4", className)} {...props}>
      <TodoItemSummary todo={todo} />
      <TodoItemActions todo={todo} />
    </Card>
  );
}

export { TodoItem };
export type { TodoItemProps };
