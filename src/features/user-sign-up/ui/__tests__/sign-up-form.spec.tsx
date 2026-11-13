/* eslint-disable @typescript-eslint/no-explicit-any, testing-library/prefer-user-event, react/jsx-no-useless-fragment, id-length */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { signUp } from "@/shared/auth";

import { SignUpForm } from "../sign-up-form";

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
      const valuesRef = React.useRef({ email: "", name: "", password: "" });
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

describe("sign up form", () => {
  it("renders form fields and labels correctly", () => {
    expect.assertions(3);
    render(<SignUpForm />);
    expect(screen.getByLabelText("Name")).toBeDefined();
    expect(screen.getByLabelText("Email")).toBeDefined();
    expect(screen.getByLabelText("Password")).toBeDefined();
  });

  it("submits registration with valid inputs", async () => {
    expect.assertions(1);

    vi.mocked(signUp.email).mockResolvedValue({ data: {}, error: null });
    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "jane@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByText("Create account"));

    await waitFor(() => {
      expect(signUp.email).toHaveBeenCalledWith({
        email: "jane@example.com",
        name: "Jane Doe",
        password: "password123",
      });
    });
  });

  it("displays form error message when sign up fails", async () => {
    expect.assertions(1);

    vi.mocked(signUp.email).mockResolvedValue({
      data: null,
      error: { message: "Email already in use", status: 400, statusText: "Bad Request" },
    });
    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "jane@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByText("Create account"));

    await expect(screen.findByText("Email already in use")).resolves.toBeDefined();
  });

  it("displays fallback error message when sign up fails without a message", async () => {
    expect.assertions(1);

    vi.mocked(signUp.email).mockResolvedValue({
      data: null,
      error: { status: 500, statusText: "Internal Server Error" },
    });
    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "jane@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByText("Create account"));

    await expect(screen.findByText("Failed to sign up")).resolves.toBeDefined();
  });
});
