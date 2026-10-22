import { Badge } from "@/shared/ui/shadcn/badge";
import { Button } from "@/shared/ui/shadcn/button";

type TodoFilter = "active" | "all" | "completed";

interface TodoFiltersProps {
  counts: Record<TodoFilter, number>;
  filter: TodoFilter;
  onFilterChange: (filter: TodoFilter) => void;
}

const FILTERS: readonly TodoFilter[] = ["all", "active", "completed"];

function TodoFilters({ counts, filter, onFilterChange }: TodoFiltersProps) {
  return (
    <nav aria-label="Filter todos" className="flex items-center gap-1.5">
      {FILTERS.map((item) => {
        const isActive = filter === item;
        return (
          <Button
            aria-pressed={isActive}
            key={item}
            onClick={() => {
              onFilterChange(item);
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

export { TodoFilters };
export type { TodoFilter, TodoFiltersProps };
