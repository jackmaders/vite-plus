import { Badge } from "@/shared/ui/shadcn/badge";
import { Button } from "@/shared/ui/shadcn/button";

import type { TodoCompletionStatus } from "../model/todo-schema";

interface TodoStatusTabsProps {
  counts: Record<TodoCompletionStatus, number>;
  onStatusChange: (status: TodoCompletionStatus) => void;
  status: TodoCompletionStatus;
}

const STATUSES: readonly TodoCompletionStatus[] = ["all", "active", "completed"];

function TodoStatusTabs({ counts, onStatusChange, status }: TodoStatusTabsProps) {
  return (
    <nav aria-label="Filter todos by status" className="flex items-center gap-1.5">
      {STATUSES.map((item) => {
        const isActive = status === item;
        return (
          <Button
            aria-pressed={isActive}
            key={item}
            onClick={() => {
              onStatusChange(item);
            }}
            size="sm"
            variant={isActive ? "secondary" : "ghost"}
          >
            <span className="capitalize">{item}</span>
            <Badge variant={isActive ? "default" : "secondary"}>{counts[item]}</Badge>
          </Button>
        );
      })}
    </nav>
  );
}

export { TodoStatusTabs };
export type { TodoStatusTabsProps };
