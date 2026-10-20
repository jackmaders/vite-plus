import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import type { Todo } from "@/shared/db";
import { Badge } from "@/shared/ui/shadcn/badge";
import { Button } from "@/shared/ui/shadcn/button";
import { Card } from "@/shared/ui/shadcn/card";
import { Checkbox } from "@/shared/ui/shadcn/checkbox";

import { TodoItemEdit } from "./todo-item-edit";

interface TodoItemProps {
  isUpdating?: boolean;
  onDelete: (id: string) => void;
  onToggle: (id: string, completed: boolean) => void;
  onUpdate: (id: string, input: { description?: string | null; title?: string }) => void;
  todo: Todo;
}

interface TodoItemActionsProps {
  isUpdating: boolean;
  onDelete: () => void;
  onEdit: () => void;
}

function TodoItemActions({ isUpdating, onDelete, onEdit }: TodoItemActionsProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        aria-label="Edit todo"
        disabled={isUpdating}
        onClick={onEdit}
        size="sm"
        variant="ghost"
      >
        <Pencil />
      </Button>
      <Button
        aria-label="Delete todo"
        disabled={isUpdating}
        onClick={onDelete}
        size="sm"
        variant="ghost"
      >
        <Trash2 />
      </Button>
    </div>
  );
}

interface TodoItemSummaryProps {
  isUpdating: boolean;
  onToggle: (checked: boolean) => void;
  todo: Todo;
}

function TodoItemSummary({ isUpdating, onToggle, todo }: TodoItemSummaryProps) {
  const titleStyle = todo.completed ? "text-muted-foreground line-through" : "font-medium";
  return (
    <div className="flex items-center gap-3">
      <Checkbox
        aria-label={`Toggle ${todo.title}`}
        checked={todo.completed}
        disabled={isUpdating}
        onCheckedChange={onToggle}
      />
      <div>
        <span className={titleStyle}>{todo.title}</span>
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

function TodoItem({ isUpdating = false, onDelete, onToggle, onUpdate, todo }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);

  function handleStartEditing() {
    setIsEditing(true);
  }

  function handleCancelEditing() {
    setIsEditing(false);
  }

  function handleSave(input: { description?: string | null; title: string }) {
    onUpdate(todo.id, input);
    setIsEditing(false);
  }

  function handleDelete() {
    onDelete(todo.id);
  }

  function handleToggle(checked: boolean) {
    onToggle(todo.id, checked);
  }

  if (isEditing) {
    return (
      <TodoItemEdit
        isUpdating={isUpdating}
        onCancel={handleCancelEditing}
        onSave={handleSave}
        todo={todo}
      />
    );
  }

  return (
    <Card className="flex items-center justify-between p-4">
      <TodoItemSummary isUpdating={isUpdating} onToggle={handleToggle} todo={todo} />
      <TodoItemActions
        isUpdating={isUpdating}
        onDelete={handleDelete}
        onEdit={handleStartEditing}
      />
    </Card>
  );
}

export { TodoItem };
export type { TodoItemProps };
