import { Pencil, Trash2 } from "lucide-react";
import { useState, type ChangeEvent } from "react";

import type { Todo } from "@/shared/db";
import { Badge } from "@/shared/ui/shadcn/badge";
import { Button } from "@/shared/ui/shadcn/button";
import { Card } from "@/shared/ui/shadcn/card";
import { Checkbox } from "@/shared/ui/shadcn/checkbox";
import { Input } from "@/shared/ui/shadcn/input";

interface TodoItemProps {
  isUpdating?: boolean;
  onDelete: (id: string) => void;
  onToggle: (id: string, completed: boolean) => void;
  onUpdate: (id: string, input: { description?: string | null; title?: string }) => void;
  todo: Todo;
}

// eslint-disable-next-line eslint/max-lines-per-function, eslint/max-statements
function TodoItem({ isUpdating = false, onDelete, onToggle, onUpdate, todo }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description ?? "");

  function handleSave() {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    onUpdate(
      todo.id,
      trimmedDescription === ""
        ? { title: trimmedTitle }
        : { description: trimmedDescription, title: trimmedTitle },
    );
    setIsEditing(false);
  }

  function handleDelete() {
    onDelete(todo.id);
  }

  function handleStartEditing() {
    setIsEditing(true);
  }

  function handleCancelEditing() {
    setIsEditing(false);
  }

  function handleToggle(checked: boolean) {
    onToggle(todo.id, checked);
  }

  function handleTitleChange(event: ChangeEvent<HTMLInputElement>) {
    setTitle(event.target.value);
  }

  function handleDescriptionChange(event: ChangeEvent<HTMLInputElement>) {
    setDescription(event.target.value);
  }

  const titleStyle = todo.completed ? "text-muted-foreground line-through" : "font-medium";

  if (isEditing) {
    return (
      <Card className="flex flex-col gap-2 p-4">
        <Input
          disabled={isUpdating}
          onChange={handleTitleChange}
          placeholder="Title"
          value={title}
        />
        <Input
          disabled={isUpdating}
          onChange={handleDescriptionChange}
          placeholder="Description"
          value={description}
        />
        <div className="flex justify-end gap-2">
          <Button disabled={isUpdating} onClick={handleCancelEditing} size="sm" variant="outline">
            Cancel
          </Button>
          <Button disabled={title.trim() === "" || isUpdating} onClick={handleSave} size="sm">
            Save
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <Checkbox
          aria-label={`Toggle ${todo.title}`}
          checked={todo.completed}
          disabled={isUpdating}
          onCheckedChange={handleToggle}
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
      <div className="flex items-center gap-1">
        <Button
          aria-label="Edit todo"
          disabled={isUpdating}
          onClick={handleStartEditing}
          size="sm"
          variant="ghost"
        >
          <Pencil />
        </Button>
        <Button
          aria-label="Delete todo"
          disabled={isUpdating}
          onClick={handleDelete}
          size="sm"
          variant="ghost"
        >
          <Trash2 />
        </Button>
      </div>
    </Card>
  );
}

export { TodoItem };
export type { TodoItemProps };
