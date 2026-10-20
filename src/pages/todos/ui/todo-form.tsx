import { useForm } from "@tanstack/react-form";
import type { SyntheticEvent } from "react";

import { Button } from "@/shared/ui/shadcn/button";
import { Card } from "@/shared/ui/shadcn/card";
import { Input } from "@/shared/ui/shadcn/input";

interface TodoFormProps {
  isCreating?: boolean;
  onCreate: (input: { description?: string | null; title: string }) => void;
}

interface FormValues {
  description: string;
  title: string;
}

interface SubmitContext {
  formApi: { reset: () => void };
  value: FormValues;
}

interface SubmitButtonProps {
  canSubmit: boolean;
  isCreating: boolean;
}

function SubmitButton({ canSubmit, isCreating }: SubmitButtonProps) {
  return (
    <Button disabled={!canSubmit} type="submit">
      {isCreating ? "Adding..." : "Add Todo"}
    </Button>
  );
}

function createTodoPayload(title: string, description: string) {
  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();
  return trimmedDescription === ""
    ? { title: trimmedTitle }
    : { description: trimmedDescription, title: trimmedTitle };
}

function selectCanSubmit(isCreating: boolean) {
  return (state: { values: FormValues }) => ({
    canSubmit: state.values.title.trim() !== "" && !isCreating,
  });
}

function createSubmitHandler(onCreate: TodoFormProps["onCreate"], isCreating: boolean) {
  return ({ formApi, value }: SubmitContext) => {
    if (value.title.trim() === "" || isCreating) {
      return;
    }
    onCreate(createTodoPayload(value.title, value.description));
    formApi.reset();
  };
}

function TodoForm({ isCreating = false, onCreate }: TodoFormProps) {
  const form = useForm({
    defaultValues: { description: "", title: "" },
    onSubmit: createSubmitHandler(onCreate, isCreating),
  });

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    // eslint-disable-next-line eslint/no-void
    void form.handleSubmit();
  }

  return (
    <Card className="p-4">
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <form.Field name="title">
          {(field) => (
            <Input
              disabled={isCreating}
              name={field.name}
              onChange={(event) => {
                field.handleChange(event.target.value);
              }}
              placeholder="Title"
              value={field.state.value}
            />
          )}
        </form.Field>
        <form.Field name="description">
          {(field) => (
            <Input
              disabled={isCreating}
              name={field.name}
              onChange={(event) => {
                field.handleChange(event.target.value);
              }}
              placeholder="Description"
              value={field.state.value}
            />
          )}
        </form.Field>
        <form.Subscribe selector={selectCanSubmit(isCreating)}>
          {(state) => <SubmitButton canSubmit={state.canSubmit} isCreating={isCreating} />}
        </form.Subscribe>
      </form>
    </Card>
  );
}

export { TodoForm };
export type { TodoFormProps };
