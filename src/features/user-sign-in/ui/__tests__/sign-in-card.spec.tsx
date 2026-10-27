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
  it("submits credentials", async () => {
    expect.assertions(1);

    // Arrange
    vi.mocked(signIn.email).mockResolvedValue({ data: {}, error: null });
    const user = await fillForm();

    // Act
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    // Assert
    expect(signIn.email).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
  });
});
