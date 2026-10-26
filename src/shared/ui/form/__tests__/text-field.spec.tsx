import { createFormHookContexts } from "@tanstack/react-form";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vite-plus/test";

import { createTextFieldFixture } from "@test/vitest/fixtures/form";

import { TextField } from "../text-field";

vi.mock(import("@tanstack/react-form"));

const { useFieldContext, useFormContext } = createFormHookContexts();

async function fillAndBlur(user: ReturnType<typeof userEvent.setup>, input: HTMLElement) {
  await user.click(input);
  await user.paste("grace@example.com");
  await user.tab();
}

describe("text field component", () => {
  it("renders a controlled text field with its label and forwarded props", () => {
    expect.assertions(5);

    // Arrange
    const field = createTextFieldFixture({ state: { value: "ada@example.com" } });
    vi.mocked(useFieldContext<string>).mockReturnValueOnce(field as never);

    // Act
    render(<TextField className="p-2" label="Email address" placeholder="you@example.com" />);

    const input = screen.getByRole("textbox", { name: "Email address" });

    // Assert
    expect(input.getAttribute("value")).toBe("ada@example.com");
    expect(input.getAttribute("name")).toBe("email");
    expect(input.getAttribute("placeholder")).toBe("you@example.com");
    expect(input.className).toContain("p-2");
    expect(input.getAttribute("aria-invalid")).toBe("false");
  });

  it("forwards input changes and blur to the field handlers", async () => {
    expect.assertions(2);

    // Arrange
    const user = userEvent.setup();
    const field = createTextFieldFixture();
    const { handleBlur, handleChange } = field;
    vi.mocked(useFieldContext<string>).mockReturnValueOnce(field as never);

    // Act
    render(<TextField label="Email address" />);
    const input = screen.getByRole("textbox", { name: "Email address" });
    await fillAndBlur(user, input);

    // Assert
    expect(handleChange).toHaveBeenCalledExactlyOnceWith("grace@example.com");
    expect(handleBlur).toHaveBeenCalledOnce();
  });

  it("shows validation errors accessibly after an invalid field is touched", () => {
    expect.assertions(4);

    // Arrange
    const field = createTextFieldFixture({
      state: {
        meta: {
          errors: [{ message: "Enter a valid email address" }],
          isTouched: true,
          isValid: false,
        },
      },
    });
    vi.mocked(useFieldContext<string>).mockReturnValueOnce(field as never);

    // Act
    render(<TextField label="Email address" />);

    const input = screen.getByRole("textbox", { name: "Email address" });
    const error = screen.getByRole("alert");

    // Assert
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe(error.getAttribute("id"));
    expect(error.textContent).toContain("Enter a valid email address");
    expect(error.hasAttribute("hidden")).toBe(false);
  });

  it("keeps validation errors hidden until the field is touched", () => {
    expect.assertions(4);

    // Arrange
    const field = createTextFieldFixture({
      state: {
        meta: {
          errors: [{ message: "Enter a valid email address" }],
          isTouched: false,
          isValid: false,
        },
      },
    });
    vi.mocked(useFieldContext<string>).mockReturnValueOnce(field as never);

    // Act
    render(<TextField label="Email address" />);

    const input = screen.getByRole("textbox", { name: "Email address" });

    // Assert
    expect(input.getAttribute("aria-invalid")).toBe("false");
    expect(input.hasAttribute("aria-describedby")).toBe(false);
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByText("Enter a valid email address").hasAttribute("hidden")).toBe(true);
  });

  it("disables the input while the form is submitting", () => {
    expect.assertions(1);

    // Arrange
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
    vi.mocked(useFieldContext<string>).mockReturnValueOnce(field as never);

    // Act
    render(<TextField label="Email address" />);
    const input = screen.getByRole("textbox", { name: "Email address" });

    // Assert
    expect(input.hasAttribute("disabled")).toBe(true);
  });

  it("keeps an explicitly disabled input disabled when the form is not submitting", () => {
    expect.assertions(1);

    // Arrange
    const field = createTextFieldFixture();
    vi.mocked(useFieldContext<string>).mockReturnValueOnce(field as never);

    // Act
    render(<TextField disabled label="Email address" />);
    const input = screen.getByRole("textbox", { name: "Email address" });

    // Assert
    expect(input.hasAttribute("disabled")).toBe(true);
  });
});
