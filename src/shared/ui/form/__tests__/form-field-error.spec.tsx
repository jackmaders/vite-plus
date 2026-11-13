import { createFormHookContexts } from "@tanstack/react-form";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vite-plus/test";

import { createFormFieldFixture } from "@test/vitest/fixtures/form";

import { FormFieldError } from "../form-field-error";

vi.mock(import("@tanstack/react-form"));

const { useFieldContext } = createFormHookContexts();

describe("form field error component", () => {
  it("renders nothing when the field has no errors", () => {
    expect.assertions(1);

    // Act
    render(<FormFieldError />);

    // Assert
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("normalizes string errors into field error messages", () => {
    expect.assertions(2);

    // Arrange
    const field = createFormFieldFixture({
      state: {
        meta: {
          errors: ["String error message" as unknown as { message?: string }],
        },
      },
    });
    vi.mocked(useFieldContext<unknown>).mockReturnValueOnce(field as never);

    // Act
    render(<FormFieldError id="field-error" />);

    const alert = screen.getByRole("alert");

    // Assert
    expect(alert.getAttribute("id")).toBe("field-error");
    expect(alert.textContent).toContain("String error message");
  });

  it("normalizes object errors with message properties", () => {
    expect.assertions(1);

    // Arrange
    const field = createFormFieldFixture({
      state: {
        meta: {
          errors: [{ message: "Object error message" }],
        },
      },
    });
    vi.mocked(useFieldContext<unknown>).mockReturnValueOnce(field as never);

    // Act
    render(<FormFieldError />);

    // Assert
    expect(screen.getByRole("alert").textContent).toContain("Object error message");
  });

  it("ignores errors without a string message", () => {
    expect.assertions(1);

    // Arrange
    const field = createFormFieldFixture({
      state: {
        meta: {
          errors: [
            null as unknown as { message?: string },
            { message: 123 as unknown as string },
            {},
          ],
        },
      },
    });
    vi.mocked(useFieldContext<unknown>).mockReturnValueOnce(field as never);

    // Act
    render(<FormFieldError />);

    // Assert
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
