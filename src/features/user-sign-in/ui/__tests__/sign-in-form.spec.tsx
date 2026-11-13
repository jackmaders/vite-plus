/* eslint-disable @typescript-eslint/no-explicit-any, testing-library/prefer-user-event, react/jsx-no-useless-fragment, id-length */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { signIn } from "@/shared/auth";

import { SignInForm } from "../sign-in-form";

vi.mock(
  import("@tanstack/react-router"),
  () =>
    ({
      createSerializationAdapter: vi.fn<() => unknown>(),
      useRouter: () => ({ invalidate: vi.fn<() => Promise<void>>() }),
    }) as never,
);
vi.mock(import("@/shared/auth"));

vi.mock(import("@/shared/ui/form"), (async () => {
  const React = await import("react");
  return {
    useAppForm: (options: unknown) => {
      const valuesRef = React.useRef({ email: "", password: "" });
      const [formError, setFormError] = React.useState<string | null>(null);
      return {
        AppForm: ({ children }: { children: React.ReactNode }) => <>{children}</>,
        Form: ({ children, onSubmit: _onSubmit, ...props }: any) => (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void (async () => {
                setFormError(null);
                try {
                  await (
                    options as { onSubmit?: (val: unknown) => Promise<void> | void }
                  ).onSubmit?.({
                    value: valuesRef.current,
                  });
                } catch (error) {
                  setFormError(error instanceof Error ? error.message : String(error));
                }
              })();
            }}
            {...props}
          >
            {children}
          </form>
        ),
        AppField: ({
          name,
          children,
        }: {
          name: string;
          children: (field: any) => React.ReactNode;
        }): React.ReactNode =>
          children({
            TextField: ({ label, ...fieldProps }: any) => (
              <div>
                <label htmlFor={name}>{label}</label>
                <input
                  id={name}
                  name={name}
                  onChange={(e) => {
                    valuesRef.current[name as keyof typeof valuesRef.current] = e.target.value;
                  }}
                  {...fieldProps}
                />
              </div>
            ),
          }),
        FormError: () => (formError === null ? null : <div role="alert">{formError}</div>),
        SubmitButton: ({ children, ...props }: any) => (
          <button type="submit" {...props}>
            {children}
          </button>
        ),
      };
    },
  };
}) as never);

afterEach(() => {
  vi.restoreAllMocks();
});

describe("sign in form", () => {
  it("renders sign in fields correctly", () => {
    expect.assertions(2);
    render(<SignInForm />);
    expect(screen.getByLabelText("Email")).toBeDefined();
    expect(screen.getByLabelText("Password")).toBeDefined();
  });

  it("submits credentials with valid inputs", async () => {
    expect.assertions(1);

    vi.mocked(signIn.email).mockResolvedValue({ data: {}, error: null });
    render(<SignInForm />);

    const emailInput = screen.getByLabelText("Email");
    fireEvent.change(emailInput, {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByText("Sign in"));

    await waitFor(
      () => {
        expect(signIn.email).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "password123",
        });
      },
      { interval: 5 },
    );
  });

  it("displays form error message when sign in fails", async () => {
    expect.assertions(1);

    vi.mocked(signIn.email).mockResolvedValue({
      data: null,
      error: { message: "Invalid email or password", status: 401, statusText: "Unauthorized" },
    });
    render(<SignInForm />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByText("Sign in"));

    await expect(screen.findByText("Invalid email or password")).resolves.toBeDefined();
  });

  it("displays fallback error message when sign in fails without a message", async () => {
    expect.assertions(1);

    vi.mocked(signIn.email).mockResolvedValue({
      data: null,
      error: { status: 500, statusText: "Internal Server Error" },
    });
    render(<SignInForm />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByText("Sign in"));

    await expect(screen.findByText("Failed to sign in")).resolves.toBeDefined();
  });
});
