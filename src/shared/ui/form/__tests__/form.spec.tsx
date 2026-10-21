import { createFormHookContexts } from "@tanstack/react-form";
import { cleanup, createEvent, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { Form } from "../form";
import { FormSubmissionError } from "../form-submission-error";

vi.mock(import("@tanstack/react-form"));

const { useFormContext } = createFormHookContexts();

describe("form component", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders a form and forwards its props and children", () => {
    expect.assertions(3);

    // Act
    render(
      <Form aria-label="Account form" className="p-2" data-testid="form" id="account-form">
        Account details
      </Form>,
    );

    const form = screen.getByRole("form", { name: "Account form" });

    // Assert
    expect(form.getAttribute("id")).toBe("account-form");
    expect(form.className).toContain("p-2");
    expect(form.textContent).toContain("Account details");
  });

  it("prevents the native submit and stops the event from bubbling", () => {
    expect.assertions(3);

    // Arrange
    const form = useFormContext();
    const parentOnSubmit = vi.fn<() => void>();

    // Act
    render(
      <div onSubmit={parentOnSubmit}>
        <Form aria-label="Account form">Account details</Form>
      </div>,
    );

    const element = screen.getByRole("form", { name: "Account form" });
    const event = createEvent.submit(element);
    fireEvent(element, event);

    // Assert
    expect(event.defaultPrevented).toBe(true);
    expect(parentOnSubmit).not.toHaveBeenCalled();
    // oxlint-disable-next-line typescript/unbound-method
    expect(form.handleSubmit).toHaveBeenCalledOnce();
  });

  it("passes submission errors to the onError callback", async () => {
    expect.hasAssertions();

    // Arrange
    const form = useFormContext();
    const error = new Error("submission failed");
    const onError = vi.fn<(err: unknown) => void>();
    // oxlint-disable-next-line typescript/unbound-method
    vi.mocked(form.handleSubmit).mockRejectedValueOnce(error);

    // Act
    render(
      <Form aria-label="Account form" onError={onError}>
        Account details
      </Form>,
    );

    fireEvent.submit(screen.getByRole("form", { name: "Account form" }));

    // Assert
    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(error);
    });
    // oxlint-disable-next-line typescript/unbound-method
    expect(form.handleSubmit).toHaveBeenCalledOnce();
  });

  it("handles rejected submissions without an error callback", async () => {
    expect.hasAssertions();

    // Arrange
    const form = useFormContext();
    // oxlint-disable-next-line typescript/unbound-method
    vi.mocked(form.handleSubmit).mockRejectedValueOnce(new Error("Internal details"));

    // Act
    render(<Form aria-label="Account form" />);
    fireEvent.submit(screen.getByRole("form", { name: "Account form" }));

    // Assert
    await waitFor(() => {
      expect(form.setErrorMap).toHaveBeenCalledWith({
        onSubmit: {
          fields: {},
          form: "Something went wrong. Please try again.",
        },
      });
    });
  });

  it("displays the safe message from a submission error", async () => {
    expect.hasAssertions();

    // Arrange
    const form = useFormContext();
    // oxlint-disable-next-line typescript/unbound-method
    vi.mocked(form.handleSubmit).mockRejectedValueOnce(
      new FormSubmissionError("Unable to save your changes."),
    );

    // Act
    render(<Form aria-label="Account form" />);
    fireEvent.submit(screen.getByRole("form", { name: "Account form" }));

    // Assert
    await waitFor(() => {
      expect(form.setErrorMap).toHaveBeenCalledWith({
        onSubmit: { fields: {}, form: "Unable to save your changes." },
      });
    });
  });
});
