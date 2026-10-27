import { createColumnHelper, metaHelper, tableFeatures } from "@tanstack/react-table";

import type { Todo } from "@/shared/db";

import { TodoActionsCell, TodoCompletionCell, TodoTitleCell } from "./todo-table-cells";

interface TodoColumnMeta {
  cellClassName?: string;
  headerClassName?: string;
}

const todoTableFeatures = tableFeatures({
  columnMeta: metaHelper<TodoColumnMeta>(),
});
const columnHelper = createColumnHelper<typeof todoTableFeatures, Todo>();

const todoTableColumns = columnHelper.columns([
  columnHelper.accessor("completed", {
    cell: ({ row }) => <TodoCompletionCell todo={row.original} />,
    header: "Status",
    meta: { headerClassName: "w-12" },
  }),
  columnHelper.accessor("title", {
    cell: ({ row }) => <TodoTitleCell todo={row.original} />,
    header: "Title",
    meta: { cellClassName: "font-medium" },
  }),
  columnHelper.accessor("description", {
    cell: (info) => info.getValue() ?? "",
    header: "Description",
    meta: { cellClassName: "text-muted-foreground" },
  }),
  columnHelper.display({
    cell: ({ row }) => <TodoActionsCell todo={row.original} />,
    header: "Actions",
    id: "actions",
    meta: { cellClassName: "text-right", headerClassName: "w-24 text-right" },
  }),
]);

export { todoTableColumns, todoTableFeatures };
