import { Badge } from "@/shared/ui/shadcn/badge";
import { Button } from "@/shared/ui/shadcn/button";

type TodoFilter = "active" | "all" | "completed";

interface TodoFiltersProps {
  counts: Record<TodoFilter, number>;
  filter: TodoFilter;
  onFilterChange: (filter: TodoFilter) => void;
}

const FILTER_TABS: readonly TodoFilter[] = ["all", "active", "completed"];

function TodoFilters({ counts, filter, onFilterChange }: TodoFiltersProps) {
  return (
    <div className="flex gap-2">
      {FILTER_TABS.map((tab) => {
        const variant = filter === tab ? "default" : "outline";
        function handleClick() {
          onFilterChange(tab);
        }

        return (
          <Button key={tab} onClick={handleClick} size="sm" variant={variant}>
            <span className="capitalize">{tab}</span>
            <Badge variant="secondary">{counts[tab]}</Badge>
          </Button>
        );
      })}
    </div>
  );
}

export { TodoFilters };
export type { TodoFilter, TodoFiltersProps };
