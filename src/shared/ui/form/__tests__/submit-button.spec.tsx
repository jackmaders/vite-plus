import { createFormHookContexts } from "@tanstack/react-form";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vite-plus/test";

import { SubmitButton } from "../submit-button";

vi.mock(import("@tanstack/react-form"));

const { useFormContext } = createFormHookContexts();

interface SubscribeHandlerProps {
  children: ((state: unknown) => ReactElement) | ReactElement;
  selector?: (state: unknown) => unknown;
}

describe("submit button component", () => {
  it("renders enabled submit button and forwards props even when form cannot submit", () => {
    expect.assertions(4);

    const form = useFormContext();
    const mockFormCannotSubmit = vi.fn<
      ({ children, selector }: SubscribeHandlerProps) => ReactElement | null
    >(({ children, selector }): ReactElement | null => {
      const renderContent = children as (state: unknown) => ReactElement;
      const selectState = selector as (state: unknown) => unknown;
      return renderContent(selectState({ canSubmit: false, errorMap: {}, isSubmitting: false }));
    });
    vi.mocked(form.Subscribe).mockImplementationOnce(mockFormCannotSubmit as never);

    render(
      <SubmitButton aria-label="Save changes" className="p-2">
        Save
      </SubmitButton>,
    );

    const button = screen.getByText("Save");

    expect(button.getAttribute("type")).toBe("submit");
    expect(button.className).toContain("p-2");
    expect(button.hasAttribute("disabled")).toBe(false);
    expect(form.Subscribe).toHaveBeenCalledOnce();
  });

  it("handles explicit type and disabled states", () => {
    expect.assertions(3);

    const { rerender } = render(<SubmitButton disabled>Save</SubmitButton>);
    expect(screen.getByText("Save").hasAttribute("disabled")).toBe(true);

    rerender(
      <SubmitButton type="button" variant="secondary">
        Cancel
      </SubmitButton>,
    );
    const cancelButton = screen.getByText("Cancel");
    expect(cancelButton.getAttribute("type")).toBe("button");
    expect(cancelButton.hasAttribute("disabled")).toBe(false);
  });

  it("disables the button and shows a busy label while submitting", () => {
    expect.assertions(2);

    const form = useFormContext();
    const mockFormSubmitting = vi.fn<
      ({ children, selector }: SubscribeHandlerProps) => ReactElement | null
    >(({ children, selector }): ReactElement | null => {
      const renderContent = children as (state: unknown) => ReactElement;
      const selectState = selector as (state: unknown) => unknown;
      return renderContent(selectState({ canSubmit: true, errorMap: {}, isSubmitting: true }));
    });
    vi.mocked(form.Subscribe).mockImplementationOnce(mockFormSubmitting as never);

    render(<SubmitButton aria-label="Save">Save</SubmitButton>);
    const button = screen.getByLabelText("Save");

    expect(button.hasAttribute("disabled")).toBe(true);
    expect(button.getAttribute("aria-busy")).toBe("true");
  });
});
