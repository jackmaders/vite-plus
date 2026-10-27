import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { signIn } from "@/shared/auth";

import { SignInCard } from "../sign-in-card";

vi.mock(import("@/shared/auth"));

afterEach(() => {
  vi.restoreAllMocks();
});

async function fillForm() {
  const user = userEvent.setup();
  render(<SignInCard />);
  await user.type(screen.getByLabelText("Email"), "test@example.com");
  await user.type(screen.getByLabelText("Password"), "password123");
  return user;
}

describe("sign in card", () => {
  it("submits credentials and navigates to todos", async () => {
    expect.assertions(2);

    // Arrange
    vi.mocked(signIn.email).mockResolvedValue({ data: {}, error: null });
    const navigate = vi
      .spyOn(window.location, "href", "set")
      .mockImplementation(vi.fn<(url: string) => void>());
    const user = await fillForm();

    // Act
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    // Assert
    expect(signIn.email).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
    expect(navigate).toHaveBeenCalledWith("/todos");
  });

  it.each([
    ["server message", { error: { message: "Please try again" } }, "Please try again"],
    ["fallback message", { error: {} }, "Authentication failed"],
  ])("shows the %s and preserves the draft", async (_scenario, response, message) => {
    expect.assertions(2);

    // Arrange
    vi.mocked(signIn.email).mockResolvedValue(response);
    const user = await fillForm();

    // Act
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    const feedback = await screen.findByText(message);

    // Assert
    expect(feedback).toBeDefined();
    expect(screen.getByLabelText<HTMLInputElement>("Email").value).toBe("test@example.com");
  });

  it("shows a generic message when the request rejects", async () => {
    expect.assertions(1);

    // Arrange
    vi.mocked(signIn.email).mockRejectedValue(new Error("Network failed"));
    const user = await fillForm();

    // Act
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    const feedback = await screen.findByText("An unexpected error occurred");

    // Assert
    expect(feedback).toBeDefined();
  });

  it("clears submission feedback when editing and allows retry", async () => {
    expect.assertions(3);

    // Arrange
    vi.mocked(signIn.email).mockResolvedValue({ error: { message: "Please try again" } });
    const user = await fillForm();
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    const feedback = await screen.findByText("Please try again");

    // Act
    await user.type(screen.getByLabelText("Password"), "4");

    // Assert
    expect(feedback.isConnected).toBe(false);
    expect(screen.queryByText("Please try again")).toBeNull();
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "Sign in" }).disabled).toBe(false);
  });
});
