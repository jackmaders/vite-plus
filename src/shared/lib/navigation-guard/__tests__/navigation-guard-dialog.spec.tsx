import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect, type ComponentProps, type ReactNode } from "react";
import { describe, expect, it, vi } from "vite-plus/test";

import { NavigationGuardDialog } from "../navigation-guard-dialog";

vi.mock(
  import("@/shared/ui/shadcn/dialog"),
  () =>
    ({
      Dialog: ({
        children,
        onOpenChange,
        open,
      }: {
        children?: ReactNode;
        onOpenChange?: (open: boolean, details?: { reason: string }) => void;
        open?: boolean;
      }) => {
        useEffect(() => {
          function handleKeyDown(event: KeyboardEvent) {
            if (open === true && event.key === "Escape") {
              onOpenChange?.(false, { reason: "escape-key" });
            }
          }
          window.addEventListener("keydown", handleKeyDown);
          return () => {
            window.removeEventListener("keydown", handleKeyDown);
          };
        }, [open, onOpenChange]);

        if (open !== true) {
          return null;
        }
        return <dialog open>{children}</dialog>;
      },
      DialogContent: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
      DialogDescription: ({ children }: { children?: ReactNode }) => <p>{children}</p>,
      DialogFooter: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
      DialogHeader: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
      DialogTitle: ({ children }: { children?: ReactNode }) => <h2>{children}</h2>,
    }) as never,
);

describe("navigation guard dialog", () => {
  it("forwards onOpenChange and only calls onCancel when nextOpen is false", async () => {
    expect.assertions(2);
    const user = userEvent.setup();
    const onCancel = vi.fn<() => void>();
    const onConfirm = vi.fn<() => void>();
    const onOpenChange =
      vi.fn<NonNullable<ComponentProps<typeof NavigationGuardDialog>["onOpenChange"]>>();

    render(
      <NavigationGuardDialog
        message="Test message"
        onCancel={onCancel}
        onConfirm={onConfirm}
        onOpenChange={onOpenChange}
        open
        title="Test title"
      />,
    );

    await user.keyboard("{Escape}");

    expect(onCancel).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(
      false,
      expect.objectContaining({ reason: "escape-key" }),
    );
  });
});
