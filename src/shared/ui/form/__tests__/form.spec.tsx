import { createEvent, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vite-plus/test";
import * as z from "zod";

import { useAppForm } from "../app-form";
import { Form } from "../form";
import { FormSubmissionError } from "../form-submission-error";

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
  it("renders a form and forwards its props and children", () => {
    expect.assertions(3);

    // Act
    render(<TestForm className="p-2" data-testid="form" id="account-form" />);

    const form = screen.getByRole("form", { name: "Account form" });

    // Assert
    expect(form.getAttribute("id")).toBe("account-form");
    expect(form.className).toContain("p-2");
    expect(form.textContent).toContain("Account details");
  });

  it("prevents the native submit and stops the event from bubbling", async () => {
    expect.hasAssertions();

    // Arrange
    const onSave = vi.fn<() => Promise<void>>().mockResolvedValue();
    const parentOnSubmit = vi.fn<() => void>();

    // Act
    render(
      <div onSubmit={parentOnSubmit}>
        <TestForm onSave={onSave} />
      </div>,
    );
    const event = dispatchSubmit(screen.getByRole("form", { name: "Account form" }));

    // Assert
    expect(event.defaultPrevented).toBe(true);
    expect(parentOnSubmit).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledOnce();
    });
  });

  it("submits valid values", async () => {
    expect.hasAssertions();

    // Arrange
    const onSave = vi.fn<() => Promise<void>>().mockResolvedValue();

    // Act
    render(<TestForm onSave={onSave} />);
    fireEvent.submit(screen.getByRole("form", { name: "Account form" }));

    // Assert
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledOnce();
    });
  });

  it("preserves validation feedback and skips saving when submission is invalid", async () => {
    expect.hasAssertions();

    // Arrange
    const onSave = vi.fn<() => Promise<void>>().mockResolvedValue();

    // Act
    render(<TestForm initialName="   " onSave={onSave} />);
    fireEvent.submit(screen.getByRole("form", { name: "Account form" }));

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Account name is required")).toBeDefined();
    });
    expect(screen.getByPlaceholderText<HTMLInputElement>("Account name").value).toBe("   ");
    expect(onSave).not.toHaveBeenCalled();
  });

  it("displays the error message and leaves the draft in place", async () => {
    expect.hasAssertions();

    // Arrange
    const error = new Error("submission failed");
    const onSave = vi.fn<() => Promise<void>>().mockRejectedValue(error);

    // Act
    render(<TestForm initialName="Draft" onSave={onSave} />);
    fireEvent.submit(screen.getByRole("form", { name: "Account form" }));

    // Assert
    await waitFor(() => {
      expect(screen.getByText("submission failed")).toBeDefined();
    });
    expect(screen.getByPlaceholderText<HTMLInputElement>("Account name").value).toBe("Draft");
  });

  it("preserves the draft when a rejection has no Error message", async () => {
    expect.hasAssertions();

    // Arrange
    const onSave = vi.fn<() => Promise<void>>().mockRejectedValue("request unavailable");

    // Act
    render(<TestForm initialName="Draft" onSave={onSave} />);
    fireEvent.submit(screen.getByRole("form", { name: "Account form" }));

    // Assert
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledOnce();
    });
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByPlaceholderText<HTMLInputElement>("Account name").value).toBe("Draft");
  });

  it("displays the message from a submission error", async () => {
    expect.hasAssertions();

    // Arrange
    const onSave = vi
      .fn<() => Promise<void>>()
      .mockRejectedValue(new FormSubmissionError("Unable to save your changes."));

    // Act
    render(<TestForm onSave={onSave} />);
    fireEvent.submit(screen.getByRole("form", { name: "Account form" }));

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Unable to save your changes.")).toBeDefined();
    });
  });
});
