import { useState, type ChangeEvent, type SyntheticEvent } from "react";

import { Button } from "@/shared/ui/shadcn/button";
import { Card } from "@/shared/ui/shadcn/card";
import { Input } from "@/shared/ui/shadcn/input";

interface TodoFormProps {
  isCreating?: boolean;
  onCreate: (input: { description?: string | null; title: string }) => void;
}

function createTodoPayload(title: string, description: string) {
  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();
  return trimmedDescription === ""
    ? { title: trimmedTitle }
    : { description: trimmedDescription, title: trimmedTitle };
}

function TodoForm({ isCreating = false, onCreate }: TodoFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  function handleTitleChange(event: ChangeEvent<HTMLInputElement>) {
    setTitle(event.target.value);
  }

  function handleDescriptionChange(event: ChangeEvent<HTMLInputElement>) {
    setDescription(event.target.value);
  }

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (title.trim() !== "" && !isCreating) {
      onCreate(createTodoPayload(title, description));
      setTitle("");
      setDescription("");
    }
  }

  const isSubmitDisabled = title.trim() === "" || isCreating;

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          disabled={isCreating}
          onChange={handleTitleChange}
          placeholder="Title"
          value={title}
        />
        <Input
          disabled={isCreating}
          onChange={handleDescriptionChange}
          placeholder="Description"
          value={description}
        />
        <Button disabled={isSubmitDisabled} type="submit">
          {isCreating ? "Adding..." : "Add Todo"}
        </Button>
      </form>
    </Card>
  );
}

export { TodoForm };
export type { TodoFormProps };
