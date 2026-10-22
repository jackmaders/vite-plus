import { cleanup, createEvent, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import * as z from "zod";

import { useAppForm } from "../app-form";
import { Form, type FormProps } from "../form";
import { FormSubmissionError } from "../form-submission-error";

const defaultSave = vi.fn<() => Promise<void>>().mockResolvedValue();
const accountSchema = z.object({
  accountName: z.string().trim().min(1, "Account name is required"),
});

interface TestFormProps extends FormProps {
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
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

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

  it("calls onSuccess after a successful submission", async () => {
    expect.hasAssertions();

    // Arrange
    const onSave = vi.fn<() => Promise<void>>().mockResolvedValue();
    const onSuccess = vi.fn<() => void>();

    // Act
    render(<TestForm onSave={onSave} onSuccess={onSuccess} />);
    fireEvent.submit(screen.getByRole("form", { name: "Account form" }));

    // Assert
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledOnce();
      expect(onSuccess).toHaveBeenCalledOnce();
    });
  });

  it("preserves validation feedback and skips onSuccess when submission is invalid", async () => {
    expect.hasAssertions();

    // Arrange
    const onSave = vi.fn<() => Promise<void>>().mockResolvedValue();
    const onSuccess = vi.fn<() => void>();

    // Act
    render(<TestForm initialName="   " onSave={onSave} onSuccess={onSuccess} />);
    fireEvent.submit(screen.getByRole("form", { name: "Account form" }));

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Account name is required")).toBeDefined();
    });
    expect(screen.getByPlaceholderText<HTMLInputElement>("Account name").value).toBe("   ");
    expect(onSave).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("passes rejected saves to onError and leaves the draft in place", async () => {
    expect.hasAssertions();

    // Arrange
    const error = new Error("submission failed");
    const onSave = vi.fn<() => Promise<void>>().mockRejectedValue(error);
    const onError = vi.fn<(err: unknown) => void>();
    const onSuccess = vi.fn<() => void>();

    // Act
    render(
      <TestForm initialName="Draft" onError={onError} onSave={onSave} onSuccess={onSuccess} />,
    );
    fireEvent.submit(screen.getByRole("form", { name: "Account form" }));

    // Assert
    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(error);
      expect(screen.getByText("Something went wrong. Please try again.")).toBeDefined();
    });
    expect(screen.getByPlaceholderText<HTMLInputElement>("Account name").value).toBe("Draft");
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("displays the safe message from a submission error", async () => {
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
