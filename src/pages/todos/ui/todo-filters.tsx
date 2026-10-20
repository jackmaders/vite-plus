import { Badge } from "@/shared/ui/shadcn/badge";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/shadcn/tabs";

type TodoFilter = "active" | "all" | "completed";

interface TodoFiltersProps {
  counts: Record<TodoFilter, number>;
  filter: TodoFilter;
  onFilterChange: (filter: TodoFilter) => void;
}

const FILTER_TABS: readonly TodoFilter[] = ["all", "active", "completed"];

function TodoFilters({ counts, filter, onFilterChange }: TodoFiltersProps) {
  function handleValueChange(value: TodoFilter) {
    onFilterChange(value);
  }

  return (
    <Tabs<TodoFilter> onValueChange={handleValueChange} value={filter}>
      <TabsList>
        {FILTER_TABS.map((tab) => (
          <TabsTrigger key={tab} value={tab}>
            <span className="capitalize">{tab}</span>
            <Badge variant="secondary">{counts[tab]}</Badge>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

export { TodoFilters };
export type { TodoFilter, TodoFiltersProps };
