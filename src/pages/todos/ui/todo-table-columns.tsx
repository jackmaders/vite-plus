import { createColumnHelper } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import type { Todo } from "@/shared/db";
import type { DataTableFeatures } from "@/shared/ui/data-table";
import { Badge } from "@/shared/ui/shadcn/badge";
import { Button } from "@/shared/ui/shadcn/button";

import { DeleteTodoDialog } from "./delete-todo-dialog";
import { TodoCompletionCheckbox } from "./todo-completion-checkbox";
import { UpdateTodoDialog } from "./update-todo-dialog";

const columnHelper = createColumnHelper<DataTableFeatures, Todo>();
const editTrigger = <Button variant="ghost" size="icon-sm" aria-label="Edit todo" />;
const deleteTrigger = <Button variant="ghost" size="icon-sm" aria-label="Delete todo" />;

const todoTableColumns = columnHelper.columns([
  columnHelper.accessor("completed", {
    cell: ({ row }) => <TodoCompletionCheckbox todo={row.original} />,
    enableHiding: false,
    header: "Status",
  }),
  columnHelper.accessor("title", {
    cell: ({ row, getValue }) => (
      <div className="flex items-center gap-2">
        <span
          className={row.original.completed ? "text-muted-foreground line-through" : "font-medium"}
        >
          {getValue()}
        </span>
        <Badge variant={row.original.completed ? "secondary" : "outline"}>
          {row.original.completed ? "Done" : "Pending"}
        </Badge>
      </div>
    ),
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => {
          column.toggleSorting(column.getIsSorted() === "asc");
        }}
      >
        Title
        <ArrowUpDown data-icon="inline-end" />
      </Button>
    ),
  }),
  columnHelper.accessor("description", {
    cell: ({ getValue }) => <span className="text-muted-foreground">{getValue() ?? ""}</span>,
    header: "Description",
  }),
  columnHelper.display({
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        <UpdateTodoDialog aria-label="Edit todo" render={editTrigger} todo={row.original}>
          Edit
        </UpdateTodoDialog>
        <DeleteTodoDialog aria-label="Delete todo" render={deleteTrigger} todo={row.original}>
          Delete
        </DeleteTodoDialog>
      </div>
    ),
    enableHiding: false,
    header: () => <div className="text-right">Actions</div>,
    id: "actions",
  }),
]);

export { todoTableColumns };
