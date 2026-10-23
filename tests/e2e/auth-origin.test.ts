import { expect, test } from "@playwright/test";

const UNAUTHORIZED_STATUS = 401;

test("accepts auth requests from the server origin", async ({ request, baseURL }) => {
  // Arrange
  const origin = String(baseURL);

  // Act
  const response = await request.post("/api/auth/sign-in/email", {
    data: { email: "missing-user@example.com", password: "invalid-test-password" },
    headers: { Origin: origin },
  });
  const body: unknown = await response.json();

  // Assert
  expect(response.status()).toBe(UNAUTHORIZED_STATUS);
  expect(body).toMatchObject({ code: "INVALID_EMAIL_OR_PASSWORD" });
});
