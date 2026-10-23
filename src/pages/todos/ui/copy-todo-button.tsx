import { useState } from "react";

import type { Todo } from "@/shared/db";
import { getErrorMessage } from "@/shared/errors";
import { Button } from "@/shared/ui/shadcn/button";
import { FieldError } from "@/shared/ui/shadcn/field";

import { copyTodo } from "../lib/copy-todo";

function CopyTodoButton({ todo }: { todo: Todo }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleCopy() {
    setPending(true);
    const result = await copyTodo(todo);
    setPending(false);
    if (result.status === "error") {
      setMessage("");
      setError(getErrorMessage(result.error));
      return;
    }
    setError("");
    setMessage("Copied");
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        aria-label={`Copy ${todo.title}`}
        disabled={pending}
        type="button"
        variant="ghost"
        onClick={() => {
          void handleCopy();
        }}
      >
        Copy
      </Button>
      <output>{message}</output>
      {error && <FieldError>{error}</FieldError>}
    </div>
  );
}

export { CopyTodoButton };
