import { render, screen, within, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { signOut } from "@/shared/auth";

import { SignOutDialog } from "../sign-out-dialog";

vi.mock(import("@/shared/auth"));

afterEach(() => {
  vi.restoreAllMocks();
});

async function openDialog() {
  const user = userEvent.setup();
  render(<SignOutDialog />);
  await user.click(screen.getByRole("button", { name: "Sign Out" }));
  const dialog = await screen.findByRole("dialog", { name: "Sign out?" });
  return { dialog, user };
}

describe("sign out confirmation", () => {
  it("does not sign out when confirmation is cancelled", async () => {
    expect.assertions(2);

    // Arrange
    const { dialog, user } = await openDialog();

    // Act
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));

    // Assert
    expect(signOut).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it.each([
    ["server message", { error: { message: "Try again" } }, "Try again"],
    ["fallback message", { error: {} }, "Sign out failed"],
  ])("keeps the dialog open with the %s and allows retry", async (_scenario, response, message) => {
    expect.assertions(3);

    // Arrange
    vi.mocked(signOut).mockResolvedValueOnce(response);
    const navigate = vi
      .spyOn(window.location, "href", "set")
      .mockImplementation(vi.fn<(url: string) => void>());
    const { dialog, user } = await openDialog();

    // Act
    await user.click(within(dialog).getByRole("button", { name: "Sign Out" }));
    const feedback = await screen.findByRole("alert");

    // Assert
    expect(feedback.textContent).toBe(message);
    expect(
      within(dialog).getByRole<HTMLButtonElement>("button", { name: "Sign Out" }).disabled,
    ).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });

  it("shows generic feedback when sign out rejects", async () => {
    expect.assertions(1);

    // Arrange
    vi.mocked(signOut).mockRejectedValueOnce(new Error("Private network detail"));
    const { dialog, user } = await openDialog();

    // Act
    await user.click(within(dialog).getByRole("button", { name: "Sign Out" }));
    const feedback = await screen.findByRole("alert");

    // Assert
    expect(feedback.textContent).toBe("An unexpected error occurred");
  });

  it("disables confirmation until sign out finishes", async () => {
    expect.assertions(2);

    // Arrange
    let resolveSignOut: (response: Awaited<ReturnType<typeof signOut>>) => void =
      vi.fn<(response: Awaited<ReturnType<typeof signOut>>) => void>();
    const pending = new Promise<Awaited<ReturnType<typeof signOut>>>((resolve) => {
      resolveSignOut = resolve;
    });
    vi.mocked(signOut).mockReturnValueOnce(pending);
    const navigate = vi
      .spyOn(window.location, "href", "set")
      .mockImplementation(vi.fn<(url: string) => void>());
    const { dialog, user } = await openDialog();
    const confirm = within(dialog).getByRole<HTMLButtonElement>("button", { name: "Sign Out" });

    // Act
    await user.click(confirm);
    const disabledWhilePending = confirm.disabled;
    await act(async () => {
      resolveSignOut({ data: { success: true }, error: null });
      await pending;
    });

    // Assert
    expect(disabledWhilePending).toBe(true);
    expect(navigate).toHaveBeenCalledWith("/");
  });
});
