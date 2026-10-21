import { useState, type ChangeEvent, type ReactNode } from "react";

import type { Todo } from "@/shared/db";
import { Button } from "@/shared/ui/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/shadcn/dialog";
import { Input } from "@/shared/ui/shadcn/input";

interface TodoItemEditProps {
  isUpdating?: boolean;
  onCancel: () => void;
  onSave: (input: { description?: string | null; title: string }) => void;
  open?: boolean;
  todo: Todo;
}

interface TodoItemEditFieldsProps {
  description: string;
  isUpdating: boolean;
  onDescriptionChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onTitleChange: (event: ChangeEvent<HTMLInputElement>) => void;
  title: string;
}

interface TodoItemEditFooterProps {
  disabled: boolean;
  isUpdating: boolean;
  onCancel: () => void;
  onSave: () => void;
}

interface TodoItemEditDialogProps {
  children: ReactNode;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

function createUpdatePayload(title: string, description: string) {
  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();
  return trimmedDescription === ""
    ? { title: trimmedTitle }
    : { description: trimmedDescription, title: trimmedTitle };
}

function TodoItemEditDialog({ children, onOpenChange, open }: TodoItemEditDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Todo</DialogTitle>
          <DialogDescription>Update the title and description of your todo item.</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

function TodoItemEditFields({
  description,
  isUpdating,
  onDescriptionChange,
  onTitleChange,
  title,
}: TodoItemEditFieldsProps) {
  return (
    <div className="flex flex-col gap-3">
      <Input
        aria-label="Title"
        disabled={isUpdating}
        onChange={onTitleChange}
        placeholder="Title"
        value={title}
      />
      <Input
        aria-label="Description"
        disabled={isUpdating}
        onChange={onDescriptionChange}
        placeholder="Description"
        value={description}
      />
    </div>
  );
}

function TodoItemEditFooter({ disabled, isUpdating, onCancel, onSave }: TodoItemEditFooterProps) {
  return (
    <DialogFooter>
      <Button disabled={isUpdating} onClick={onCancel} size="sm" variant="outline">
        Cancel
      </Button>
      <Button disabled={disabled || isUpdating} onClick={onSave} size="sm">
        Save
      </Button>
    </DialogFooter>
  );
}

function useTodoEdit(todo: Todo, onSave: TodoItemEditProps["onSave"], onCancel: () => void) {
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

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      handleCancel();
    }
  }

  return {
    description,
    handleCancel,
    handleDescriptionChange,
    handleOpenChange,
    handleSave,
    handleTitleChange,
    title,
  };
}

function TodoItemEdit({
  isUpdating = false,
  onCancel,
  onSave,
  open = true,
  todo,
}: TodoItemEditProps) {
  const {
    description,
    handleCancel,
    handleDescriptionChange,
    handleOpenChange,
    handleSave,
    handleTitleChange,
    title,
  } = useTodoEdit(todo, onSave, onCancel);

  return (
    <TodoItemEditDialog onOpenChange={handleOpenChange} open={open}>
      <TodoItemEditFields
        description={description}
        isUpdating={isUpdating}
        onDescriptionChange={handleDescriptionChange}
        onTitleChange={handleTitleChange}
        title={title}
      />
      <TodoItemEditFooter
        disabled={title.trim() === ""}
        isUpdating={isUpdating}
        onCancel={handleCancel}
        onSave={handleSave}
      />
    </TodoItemEditDialog>
  );
}

export { TodoItemEdit };
export type { TodoItemEditProps };
