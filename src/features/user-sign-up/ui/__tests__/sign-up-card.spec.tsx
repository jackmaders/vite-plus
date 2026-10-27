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
  it("submits credentials", async () => {
    expect.assertions(1);

    // Arrange
    vi.mocked(signUp.email).mockResolvedValue({ data: {}, error: null });
    const user = await fillForm();

    // Act
    await user.click(screen.getByRole("button", { name: "Create account" }));

    // Assert
    expect(signUp.email).toHaveBeenCalledWith({
      email: "test@example.com",
      name: "Test User",
      password: "password123",
    });
  });
});
