import { useState, type ChangeEvent } from "react";

import type { Todo } from "@/shared/db";
import { Button } from "@/shared/ui/shadcn/button";
import { Card } from "@/shared/ui/shadcn/card";
import { Input } from "@/shared/ui/shadcn/input";

interface TodoItemEditProps {
  isUpdating?: boolean;
  onCancel: () => void;
  onSave: (input: { description?: string | null; title: string }) => void;
  todo: Todo;
}

function createUpdatePayload(title: string, description: string) {
  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();
  return trimmedDescription === ""
    ? { title: trimmedTitle }
    : { description: trimmedDescription, title: trimmedTitle };
}

function TodoItemEdit({ isUpdating = false, onCancel, onSave, todo }: TodoItemEditProps) {
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description ?? "");

  function handleTitleChange(event: ChangeEvent<HTMLInputElement>) {
    setTitle(event.target.value);
  }

  function handleDescriptionChange(event: ChangeEvent<HTMLInputElement>) {
    setDescription(event.target.value);
  }

  function handleSave() {
    onSave(createUpdatePayload(title, description));
  }

  function handleCancel() {
    setTitle(todo.title);
    setDescription(todo.description ?? "");
    onCancel();
  }

  return (
    <Card className="flex flex-col gap-2 p-4">
      <Input disabled={isUpdating} onChange={handleTitleChange} placeholder="Title" value={title} />
      <Input
        disabled={isUpdating}
        onChange={handleDescriptionChange}
        placeholder="Description"
        value={description}
      />
      <div className="flex justify-end gap-2">
        <Button disabled={isUpdating} onClick={handleCancel} size="sm" variant="outline">
          Cancel
        </Button>
        <Button disabled={title.trim() === "" || isUpdating} onClick={handleSave} size="sm">
          Save
        </Button>
      </div>
    </Card>
  );
}

export { TodoItemEdit };
export type { TodoItemEditProps };
