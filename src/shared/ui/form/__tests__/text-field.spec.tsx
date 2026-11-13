/* eslint-disable testing-library/prefer-user-event */
import { createFormHookContexts } from "@tanstack/react-form";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vite-plus/test";

import { createTextFieldFixture } from "@test/vitest/fixtures/form";

import { TextField } from "../text-field";

vi.mock(import("@tanstack/react-form") as never);

const { useFieldContext, useFormContext } = createFormHookContexts();

describe("text field component", () => {
  it("renders controlled text field, forwards props, changes, and blur", () => {
    expect.assertions(5);

    const field = createTextFieldFixture({ state: { value: "ada@example.com" } });
    const { handleBlur, handleChange } = field;
    vi.mocked(useFieldContext<string>).mockReturnValue(field as never);

    const { rerender } = render(
      <TextField className="p-2" label="Email address" placeholder="you@example.com" />,
    );

    const input = screen.getByLabelText(/^Email address/u);

    expect(input.getAttribute("value")).toBe("ada@example.com");
    expect(input.getAttribute("placeholder")).toBe("you@example.com");
    expect(input.className).toContain("p-2");

    rerender(<TextField label="Email address" />);
    fireEvent.change(input, { target: { value: "grace@example.com" } });
    fireEvent.blur(input);

    expect(handleChange).toHaveBeenCalledExactlyOnceWith("grace@example.com");
    expect(handleBlur).toHaveBeenCalledOnce();
  });

  it("handles validation errors when blurred, on submission attempt, or untouched", () => {
    expect.assertions(5);

    const blurredInvalidField = createTextFieldFixture({
      state: {
        meta: {
          errors: [{ message: "Enter a valid email address" }],
          isBlurred: true,
          isValid: false,
        },
      },
    });
    vi.mocked(useFieldContext<string>).mockReturnValue(blurredInvalidField as never);

    const { rerender } = render(<TextField label="Email address" />);
    const input = screen.getByLabelText(/^Email address/u);
    const error = screen.getByText("Enter a valid email address");

    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe(error.getAttribute("id"));

    const submittedInvalidField = createTextFieldFixture({
      form: { state: { submissionAttempts: 1 } },
      state: {
        meta: {
          errors: [{ message: "Enter a valid email address" }],
          isBlurred: false,
          isValid: false,
        },
      },
    });
    vi.mocked(useFieldContext<string>).mockReturnValue(submittedInvalidField as never);
    rerender(<TextField label="Email address" />);
    expect(input.getAttribute("aria-invalid")).toBe("true");

    const untouchedField = createTextFieldFixture({
      form: { state: { submissionAttempts: 0 } },
      state: {
        meta: {
          errors: [{ message: "Enter a valid email address" }],
          isBlurred: false,
          isValid: false,
        },
      },
    });
    vi.mocked(useFieldContext<string>).mockReturnValue(untouchedField as never);
    rerender(<TextField label="Email address" />);
    expect(input.getAttribute("aria-invalid")).toBe("false");
    expect(screen.queryByText("Enter a valid email address")?.hasAttribute("hidden")).toBe(true);
  });

  it("handles disabled states during submission or when explicitly disabled", () => {
    expect.assertions(2);

    const form = useFormContext();
    const mockFormSubmitting = vi.fn<
      ({
        children,
        selector,
      }: {
        children: (selected: unknown) => ReactElement;
        selector: (state: unknown) => unknown;
      }) => ReactElement | null
    >(({ children, selector }) => children(selector({ isSubmitting: true })));
    vi.mocked(form.Subscribe).mockImplementationOnce(mockFormSubmitting as never);
    const field = createTextFieldFixture();
    vi.mocked(useFieldContext<string>).mockReturnValue(field as never);

    const { rerender } = render(<TextField label="Email address" />);
    const input = screen.getByLabelText(/^Email address/u);
    expect(input.hasAttribute("disabled")).toBe(true);

    rerender(<TextField disabled label="Email address" />);
    expect(input.hasAttribute("disabled")).toBe(true);
  });

  it("sets aria-describedby for description with valid and invalid fields", () => {
    expect.assertions(4);

    const invalidField = createTextFieldFixture({
      state: {
        meta: {
          errors: [{ message: "Required" }],
          isBlurred: true,
          isValid: false,
        },
      },
    });
    vi.mocked(useFieldContext<string>).mockReturnValue(invalidField as never);

    const { rerender } = render(<TextField description="Help text" label="Email address" />);
    const input = screen.getByLabelText(/^Email address/u);
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toContain("-error");
    expect(describedBy).toContain("-description");

    const validField = createTextFieldFixture();
    vi.mocked(useFieldContext<string>).mockReturnValue(validField as never);
    rerender(<TextField description="Help text" label="Email address" />);
    const description = screen.getByText("Help text");
    expect(input.getAttribute("aria-describedby")).toBe(description.getAttribute("id"));
    expect(input.getAttribute("aria-invalid")).toBe("false");
  });

  it("renders an inline optional indicator when not required and omits it when required", () => {
    expect.assertions(2);

    // Arrange
    const optionalField = createTextFieldFixture();
    const requiredField = createTextFieldFixture();
    vi.mocked(useFieldContext<string>).mockReturnValueOnce(optionalField as never);
    vi.mocked(useFieldContext<string>).mockReturnValueOnce(requiredField as never);

    // Act
    const { rerender } = render(<TextField label="Source" />);
    const optionalText = screen.queryByText("(optional)");
    rerender(<TextField label="Title" required />);
    const requiredText = screen.queryByText("(optional)");

    // Assert
    expect(optionalText).not.toBeNull();
    expect(requiredText).toBeNull();
  });
});
