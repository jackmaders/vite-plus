import type { Todo } from "@/shared/db";
import { Badge } from "@/shared/ui/shadcn/badge";
import { Button } from "@/shared/ui/shadcn/button";
import { Checkbox } from "@/shared/ui/shadcn/checkbox";

import { useUpdateTodo } from "../api/use-update-todo";
import { DeleteTodoDialog } from "./delete-todo-dialog";
import { UpdateTodoDialog } from "./update-todo-dialog";

function TodoCompletionCell({ todo }: { todo: Todo }) {
  const { mutate: updateTodo } = useUpdateTodo();

  return (
    <Checkbox
      aria-label={`Toggle ${todo.title}`}
      checked={todo.completed}
      onCheckedChange={(checked) => {
        updateTodo({ data: { completed: checked }, id: todo.id });
      }}
    />
  );
}

function TodoTitleCell({ todo }: { todo: Todo }) {
  return (
    <>
      <span className={todo.completed ? "text-muted-foreground line-through" : ""}>
        {todo.title}
      </span>
      <span className="ml-2">
        <Badge variant={todo.completed ? "secondary" : "outline"}>
          {todo.completed ? "Done" : "Pending"}
        </Badge>
      </span>
    </>
  );
}

function TodoActionsCell({ todo }: { todo: Todo }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <UpdateTodoDialog aria-label="Edit todo" render={EditTriggerButton} todo={todo}>
        Edit
      </UpdateTodoDialog>
      <DeleteTodoDialog aria-label="Delete todo" render={DeleteTriggerButton} todo={todo}>
        Delete
      </DeleteTodoDialog>
    </div>
  );
}

const EditTriggerButton = <Button variant="ghost" size="icon-sm" aria-label="Edit todo" />;
const DeleteTriggerButton = <Button variant="ghost" size="icon-sm" aria-label="Delete todo" />;

export { TodoCompletionCell, TodoTitleCell, TodoActionsCell };
