import { cn } from "cn";

import type { Todo } from "@/shared/db";
import { Badge } from "@/shared/ui/shadcn/badge";
import { Checkbox } from "@/shared/ui/shadcn/checkbox";

import { useUpdateTodo } from "../api/use-update-todo";

interface TodoItemSummaryProps {
  todo: Todo;
}

function TodoItemSummary({ todo }: TodoItemSummaryProps) {
  const { mutate: updateTodo } = useUpdateTodo();

  return (
    <div className="flex items-center gap-3">
      <Checkbox
        aria-label={`Toggle ${todo.title}`}
        checked={todo.completed}
        onCheckedChange={(checked) => {
          updateTodo({ data: { completed: checked }, id: todo.id });
        }}
      />
      <div>
        <span className={cn({ "line-through": todo.completed })}>{todo.title}</span>
        {Boolean(todo.description) && (
          <p className="text-xs text-muted-foreground">{todo.description}</p>
        )}
      </div>
      <Badge variant={todo.completed ? "secondary" : "outline"}>
        {todo.completed ? "Done" : "Pending"}
      </Badge>
    </div>
  );
}

export { TodoItemSummary };
export type { TodoItemSummaryProps };
