import { createFileRoute } from "@tanstack/react-router";

import { TodosPage, todosQueryOptions, todosSearchSchema } from "@/pages/todos";

const Route = createFileRoute("/_authenticated/todos")({
  validateSearch: todosSearchSchema,
  loader: async ({ context: { queryClient } }) => {
    await queryClient.query({ ...todosQueryOptions(), staleTime: "static" });
  },
  component: TodosPage,
});

export { Route };
