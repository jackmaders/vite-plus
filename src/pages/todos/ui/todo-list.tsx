import type { Todo } from "@/shared/db";
import { Badge } from "@/shared/ui/shadcn/badge";
import { Button } from "@/shared/ui/shadcn/button";
import { Checkbox } from "@/shared/ui/shadcn/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/shadcn/table";

import { useUpdateTodo } from "../api/use-update-todo";
import { DeleteTodoDialog } from "./delete-todo-dialog";
import { UpdateTodoDialog } from "./update-todo-dialog";

interface TodoListProps {
  todos: Todo[];
}

interface TodoRowProps {
  todo: Todo;
}

const EditTriggerButton = <Button variant="ghost" size="icon-sm" aria-label="Edit todo" />;
const DeleteTriggerButton = <Button variant="ghost" size="icon-sm" aria-label="Delete todo" />;

function TodoRow({ todo }: TodoRowProps) {
  const { mutate: updateTodo } = useUpdateTodo();

  return (
    <TableRow>
      <TableCell>
        <Checkbox
          aria-label={`Toggle ${todo.title}`}
          checked={todo.completed}
          onCheckedChange={(checked) => {
            updateTodo({ data: { completed: checked }, id: todo.id });
          }}
        />
      </TableCell>
      <TableCell className="font-medium">
        <span className={todo.completed ? "text-muted-foreground line-through" : ""}>
          {todo.title}
        </span>
        <span className="ml-2">
          <Badge variant={todo.completed ? "secondary" : "outline"}>
            {todo.completed ? "Done" : "Pending"}
          </Badge>
        </span>
      </TableCell>
      <TableCell className="text-muted-foreground">{todo.description ?? ""}</TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <UpdateTodoDialog aria-label="Edit todo" render={EditTriggerButton} todo={todo}>
            Edit
          </UpdateTodoDialog>
          <DeleteTodoDialog aria-label="Delete todo" render={DeleteTriggerButton} todo={todo}>
            Delete
          </DeleteTodoDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}

function TodoList({ todos }: TodoListProps) {
  if (todos.length === 0) {
    return <p className="text-sm text-muted-foreground">No todos found</p>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Status</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-24 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {todos.map((todo) => (
            <TodoRow key={todo.id} todo={todo} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export { TodoList };
export type { TodoListProps };
