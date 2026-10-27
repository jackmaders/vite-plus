import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { signUp } from "@/shared/auth";

import { SignUpCard } from "../sign-up-card";

vi.mock(import("@/shared/auth"));

afterEach(() => {
  vi.restoreAllMocks();
});

async function fillForm() {
  const user = userEvent.setup();
  render(<SignUpCard />);
  await user.type(screen.getByLabelText("Name"), "Test User");
  await user.type(screen.getByLabelText("Email"), "test@example.com");
  await user.type(screen.getByLabelText("Password"), "password123");
  return user;
}

describe("sign up card", () => {
  it("submits credentials and navigates to todos", async () => {
    expect.assertions(2);

    // Arrange
    vi.mocked(signUp.email).mockResolvedValue({ data: {}, error: null });
    const navigate = vi
      .spyOn(window.location, "href", "set")
      .mockImplementation(vi.fn<(url: string) => void>());
    const user = await fillForm();

    // Act
    await user.click(screen.getByRole("button", { name: "Create account" }));

    // Assert
    expect(signUp.email).toHaveBeenCalledWith({
      email: "test@example.com",
      name: "Test User",
      password: "password123",
    });
    expect(navigate).toHaveBeenCalledWith("/todos");
  });

  it.each([
    ["server message", { error: { message: "Please try again" } }, "Please try again"],
    ["fallback message", { error: {} }, "Registration failed"],
  ])("shows the %s and preserves the draft", async (_scenario, response, message) => {
    expect.assertions(2);

    // Arrange
    vi.mocked(signUp.email).mockResolvedValue(response);
    const user = await fillForm();

    // Act
    await user.click(screen.getByRole("button", { name: "Create account" }));
    const feedback = await screen.findByText(message);

    // Assert
    expect(feedback).toBeDefined();
    expect(screen.getByLabelText<HTMLInputElement>("Email").value).toBe("test@example.com");
  });

  it("shows a generic message when the request rejects", async () => {
    expect.assertions(1);

    // Arrange
    vi.mocked(signUp.email).mockRejectedValue(new Error("Network failed"));
    const user = await fillForm();

    // Act
    await user.click(screen.getByRole("button", { name: "Create account" }));
    const feedback = await screen.findByText("An unexpected error occurred");

    // Assert
    expect(feedback).toBeDefined();
  });

  it("clears submission feedback when editing and allows retry", async () => {
    expect.assertions(3);

    // Arrange
    vi.mocked(signUp.email).mockResolvedValue({ error: { message: "Please try again" } });
    const user = await fillForm();
    await user.click(screen.getByRole("button", { name: "Create account" }));
    const feedback = await screen.findByText("Please try again");

    // Act
    await user.type(screen.getByLabelText("Password"), "4");

    // Assert
    expect(feedback.isConnected).toBe(false);
    expect(screen.queryByText("Please try again")).toBeNull();
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "Create account" }).disabled).toBe(
      false,
    );
  });
});
