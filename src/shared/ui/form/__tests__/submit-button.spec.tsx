import { createFormHookContexts } from "@tanstack/react-form";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { SubmitButton } from "../submit-button";

vi.mock(import("@tanstack/react-form"));

const { useFormContext } = createFormHookContexts();

interface SubscribeHandlerProps {
  children: ((state: unknown) => ReactElement) | ReactElement;
  selector?: (state: unknown) => unknown;
}

describe("submit button component", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders an enabled submit button by default and forwards props", () => {
    expect.assertions(4);

    // Arrange
    const form = useFormContext();

    // Act
    render(
      <SubmitButton aria-label="Save changes" className="p-2">
        Save
      </SubmitButton>,
    );

    const button = screen.getByRole("button", { name: "Save changes" });

    // Assert
    expect(button.getAttribute("type")).toBe("submit");
    expect(button.className).toContain("p-2");
    expect(button.hasAttribute("disabled")).toBe(false);
    expect(form.Subscribe).toHaveBeenCalledOnce();
  });

  it("disables the button when the form cannot submit", () => {
    expect.assertions(1);

    // Arrange
    const form = useFormContext();
    const mockFormCannotSubmit = vi.fn<
      ({ children, selector }: SubscribeHandlerProps) => ReactElement | null
    >(({ children, selector }): ReactElement | null => {
      const renderContent = children as (state: unknown) => ReactElement;
      const selectState = selector as (state: unknown) => unknown;
      return renderContent(selectState({ canSubmit: false, isSubmitting: false }));
    });
    vi.mocked(form.Subscribe).mockImplementationOnce(mockFormCannotSubmit as never);

    // Act
    render(<SubmitButton>Save</SubmitButton>);

    // Assert
    expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(true);
  });

  it("keeps an explicitly disabled button disabled when the form can submit", () => {
    expect.assertions(1);

    // Act
    render(<SubmitButton disabled>Save</SubmitButton>);

    // Assert
    expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(true);
  });

  it("forwards an explicit button type", () => {
    expect.assertions(2);

    // Act
    render(
      <SubmitButton type="button" variant="secondary">
        Cancel
      </SubmitButton>,
    );

    const button = screen.getByRole("button", { name: "Cancel" });

    // Assert
    expect(button.getAttribute("type")).toBe("button");
    expect(button.hasAttribute("disabled")).toBe(false);
  });

  it("disables the button and shows a busy label while submitting", () => {
    expect.assertions(2);

    // Arrange
    const form = useFormContext();
    const mockFormSubmitting = vi.fn<
      ({ children, selector }: SubscribeHandlerProps) => ReactElement | null
    >(({ children, selector }): ReactElement | null => {
      const renderContent = children as (state: unknown) => ReactElement;
      const selectState = selector as (state: unknown) => unknown;
      return renderContent(selectState({ canSubmit: true, isSubmitting: true }));
    });
    vi.mocked(form.Subscribe).mockImplementationOnce(mockFormSubmitting as never);

    // Act
    render(<SubmitButton>Save</SubmitButton>);
    const button = screen.getByRole("button", { name: "Please wait…" });

    // Assert
    expect(button.hasAttribute("disabled")).toBe(true);
    expect(button.getAttribute("aria-busy")).toBe("true");
  });
});
