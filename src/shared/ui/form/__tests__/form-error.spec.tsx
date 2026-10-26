import { createFormHookContexts } from "@tanstack/react-form";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vite-plus/test";

import { FormError } from "../form-error";

vi.mock(import("@tanstack/react-form"));

const { useFormContext } = createFormHookContexts();

interface SubscribeHandlerProps {
  children: ((state: unknown) => ReactElement) | ReactElement;
  selector?: (state: unknown) => unknown;
}

describe("form error component", () => {
  it("renders nothing when there is no submission error", () => {
    expect.assertions(1);

    // Act
    render(<FormError />);

    // Assert
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("renders the submission error as an alert and forwards props", () => {
    expect.assertions(3);

    // Arrange
    const form = useFormContext();
    const mockFormError = vi.fn<
      ({ children, selector }: SubscribeHandlerProps) => ReactElement | null
    >(({ children, selector }): ReactElement | null => {
      const renderContent = children as (state: unknown) => ReactElement;
      const selectState = selector as (state: unknown) => unknown;
      return renderContent(selectState({ errorMap: { onSubmit: "Invalid credentials" } }));
    });
    vi.mocked(form.Subscribe).mockImplementationOnce(mockFormError as never);

    // Act
    render(<FormError className="p-2" id="submit-error" />);

    // Assert
    expect(screen.getByRole("alert").textContent).toContain("Invalid credentials");
    expect(screen.getByRole("alert").getAttribute("id")).toBe("submit-error");
    expect(screen.getByRole("alert").className).toContain("p-2");
  });
});
