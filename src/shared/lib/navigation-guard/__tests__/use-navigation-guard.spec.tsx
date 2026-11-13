/* eslint-disable testing-library/prefer-user-event */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { useNavigationGuard } from "../use-navigation-guard";

const { mockUseBlocker } = vi.hoisted(() => ({
  mockUseBlocker: vi.fn<(options?: unknown) => unknown>(),
}));

vi.mock(
  import("@tanstack/react-router"),
  () =>
    ({
      createSerializationAdapter: vi.fn<() => unknown>(),
      useBlocker: mockUseBlocker,
      useRouter: () => ({ invalidate: vi.fn<() => Promise<void>>() }),
    }) as never,
);

vi.mock(
  import("../navigation-guard-dialog"),
  () =>
    ({
      NavigationGuardDialog: ({
        message,
        onCancel,
        onConfirm,
        onOpenChange,
        open,
        title,
      }: {
        message?: string;
        onCancel?: () => void;
        onConfirm?: () => void;
        onOpenChange?: (open: boolean, details?: { reason: string }) => void;
        open?: boolean;
        title?: string;
      }) => {
        if (open !== true) {
          return null;
        }
        return (
          <dialog
            aria-label={title}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                onCancel?.();
                onOpenChange?.(false, { reason: "escape-key" });
              }
            }}
            open
          >
            <h2>{title}</h2>
            <p>{message}</p>
            <button onClick={onCancel} type="button">
              Stay on page
            </button>
            <button onClick={onConfirm} type="button">
              Discard changes
            </button>
          </dialog>
        );
      },
    }) as never,
);

interface TestComponentProps {
  message?: string | undefined;
  shouldBlock: boolean;
  title?: string | undefined;
}

function TestComponent({ message, shouldBlock, title }: TestComponentProps) {
  const { NavigationGuardDialog } = useNavigationGuard({
    message,
    shouldBlock,
    title,
  });

  return <NavigationGuardDialog />;
}

describe("navigation guard hook", () => {
  const mockReset = vi.fn<() => void>();
  const mockProceed = vi.fn<() => void>();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseBlocker.mockReturnValue({
      proceed: mockProceed,
      reset: mockReset,
      status: "idle",
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("configures useBlocker and handles dialog opening and 'Stay on page' or Escape", async () => {
    expect.hasAssertions();
    const captured: { shouldBlockFn: (() => boolean) | undefined } = { shouldBlockFn: undefined };
    mockUseBlocker.mockImplementation((options: unknown) => {
      const opts = options as { shouldBlockFn?: () => boolean };
      captured.shouldBlockFn = opts.shouldBlockFn;
      return { proceed: mockProceed, reset: mockReset, status: "blocked" };
    });

    const { rerender } = render(<TestComponent message="Discard?" shouldBlock title="Warning" />);
    expect(mockUseBlocker).toHaveBeenCalledWith(
      expect.objectContaining({ disabled: false, withResolver: true }),
    );

    expect(screen.queryByText("Warning")).toBeNull();
    captured.shouldBlockFn?.();

    const dialog = await screen.findByText("Warning");
    expect(dialog).toBeDefined();

    fireEvent.click(await screen.findByText("Stay on page"));
    expect(mockReset).toHaveBeenCalledOnce();
    await waitFor(() => {
      expect(screen.queryByText("Warning")).toBeNull();
    });

    rerender(<TestComponent shouldBlock={false} />);
  });

  it("handles 'Discard changes' and undefined blocker methods", async () => {
    expect.hasAssertions();
    const captured: { shouldBlockFn: (() => boolean) | undefined } = { shouldBlockFn: undefined };
    mockUseBlocker.mockImplementation((options: unknown) => {
      const opts = options as { shouldBlockFn?: () => boolean };
      captured.shouldBlockFn = opts.shouldBlockFn;
      return { proceed: undefined, reset: undefined, status: "blocked" };
    });

    render(<TestComponent shouldBlock />);
    captured.shouldBlockFn?.();

    fireEvent.click(await screen.findByText("Discard changes"));
    await waitFor(() => {
      expect(screen.queryByText("Stay on page")).toBeNull();
    });
  });

  it("manages beforeunload listener and event prevention", () => {
    expect.assertions(3);
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");

    const { rerender, unmount } = render(<TestComponent shouldBlock={false} />);
    expect(addEventListenerSpy).not.toHaveBeenCalledWith("beforeunload", expect.any(Function));

    rerender(<TestComponent shouldBlock />);
    expect(addEventListenerSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function));

    const event = new Event("beforeunload", { cancelable: true });
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");
    window.dispatchEvent(event);
    expect(preventDefaultSpy).toHaveBeenCalledOnce();

    unmount();
  });
});
