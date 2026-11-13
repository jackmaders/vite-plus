import { createEvent, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vite-plus/test";
import * as z from "zod";

import { useAppForm } from "../app-form";
import { Form } from "../form";
import { useFieldContext } from "../form-context";

vi.mock(
  import("../text-field"),
  () =>
    ({
      TextField: ({
        label,
        placeholder,
        ...props
      }: {
        label?: string;
        placeholder?: string;
        [key: string]: unknown;
      }) => {
        const field = useFieldContext<string>();
        const isInvalid = !field.state.meta.isValid && field.state.meta.isTouched;
        return (
          <div>
            <label>{label}</label>
            <input
              placeholder={placeholder}
              value={field.state.value}
              onChange={(event) => {
                field.handleChange(event.target.value);
              }}
              onBlur={field.handleBlur}
              {...props}
            />
            {isInvalid &&
              field.state.meta.errors.map((err) => (
                <span key={String(err)}>
                  {typeof err === "string"
                    ? err
                    : ((err as Record<string, unknown>)["message"] as string)}
                </span>
              ))}
          </div>
        );
      },
    }) as never,
);

vi.mock(
  import("../submit-button"),
  () =>
    ({
      SubmitButton: ({
        children,
        ...props
      }: {
        children?: React.ReactNode;
        [key: string]: unknown;
      }) => (
        <button type="submit" {...props}>
          {children ?? "Save"}
        </button>
      ),
    }) as never,
);

const defaultSave = vi.fn<() => Promise<void>>().mockResolvedValue();
const accountSchema = z.object({
  accountName: z.string().trim().min(1, "Account name is required"),
});

interface TestFormProps extends ComponentProps<typeof Form> {
  initialName?: string;
  onSave?: () => Promise<void>;
}

function TestForm({
  children = "Account details",
  initialName = "Account",
  onSave = defaultSave,
  ...props
}: TestFormProps) {
  const form = useAppForm({
    defaultValues: { accountName: initialName },
    onSubmit: async () => {
      await onSave();
    },
    validators: { onSubmit: accountSchema },
  });

  return (
    <form.AppForm>
      <Form aria-label="Account form" {...props}>
        {children}
        <form.AppField name="accountName">
          {(field) => <field.TextField label="Account name" placeholder="Account name" />}
        </form.AppField>
        <form.FormError />
        <button type="submit">Save</button>
      </Form>
    </form.AppForm>
  );
}

function dispatchSubmit(element: HTMLElement) {
  const event = createEvent.submit(element);
  fireEvent(element, event);
  return event;
}

describe("form component", () => {
  it("renders form, forwards props and children, and submits valid values", async () => {
    expect.hasAssertions();

    const onSave = vi.fn<() => Promise<void>>().mockResolvedValue();
    const parentOnSubmit = vi.fn<() => void>();

    render(
      <div onSubmit={parentOnSubmit}>
        <TestForm className="p-2" data-testid="form" id="account-form" onSave={onSave} />
      </div>,
    );

    const form = screen.getByLabelText("Account form");

    expect(form.getAttribute("id")).toBe("account-form");
    expect(form.className).toContain("p-2");

    const event = dispatchSubmit(form);

    expect(event.defaultPrevented).toBe(true);
    expect(parentOnSubmit).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledOnce();
    });
  });

  it("handles validation errors and save rejections with Error instance", async () => {
    expect.hasAssertions();

    const onSave = vi.fn<() => Promise<void>>().mockRejectedValue(new Error("request unavailable"));

    render(<TestForm initialName="Valid Account" onSave={onSave} />);
    fireEvent.submit(screen.getByLabelText("Account form"));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledOnce();
    });
  });

  it("handles non-Error save rejections gracefully", async () => {
    expect.hasAssertions();

    const onSave = vi.fn<() => Promise<void>>().mockRejectedValue("string rejection");

    render(<TestForm initialName="Valid Account" onSave={onSave} />);
    fireEvent.submit(screen.getByLabelText("Account form"));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledOnce();
    });
  });
});
