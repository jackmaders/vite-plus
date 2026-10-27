import { flexRender, useTable } from "@tanstack/react-table";

import type { Todo } from "@/shared/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/shadcn/table";

import { todoTableColumns, todoTableFeatures } from "./todo-table-columns";

interface TodoListProps {
  todos: Todo[];
}

function TodoList({ todos }: TodoListProps) {
  const table = useTable({
    columns: todoTableColumns,
    data: todos,
    features: todoTableFeatures,
    getRowId: (todo) => todo.id,
  });

  if (todos.length === 0) {
    return <p className="text-sm text-muted-foreground">No todos found</p>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={header.column.columnDef.meta?.headerClassName}
                >
                  {!header.isPlaceholder &&
                    flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getAllCells().map((cell) => (
                <TableCell key={cell.id} className={cell.column.columnDef.meta?.cellClassName}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export { TodoList };
export type { TodoListProps };
