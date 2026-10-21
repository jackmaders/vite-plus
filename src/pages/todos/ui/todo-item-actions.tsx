import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/shared/ui/shadcn/button";

interface TodoItemActionsProps {
  isUpdating?: boolean;
  onDelete: () => void;
  onEdit: () => void;
}

function TodoItemActions({ isUpdating = false, onDelete, onEdit }: TodoItemActionsProps) {
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

export { TodoItemActions };
export type { TodoItemActionsProps };
