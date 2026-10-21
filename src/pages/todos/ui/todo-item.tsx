import { useState } from "react";

import type { Todo } from "@/shared/db";
import { Card } from "@/shared/ui/shadcn/card";

import { TodoItemActions } from "./todo-item-actions";
import { TodoItemEdit } from "./todo-item-edit";
import { TodoItemSummary } from "./todo-item-summary";

interface TodoItemProps {
  isUpdating?: boolean;
  onDelete: (id: string) => void;
  onToggle: (id: string, completed: boolean) => void;
  onUpdate: (id: string, input: { description?: string | null; title?: string }) => void;
  todo: Todo;
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
