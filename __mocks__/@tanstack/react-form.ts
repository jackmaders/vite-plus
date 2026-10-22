import { createContext, type ReactElement } from "react";
import { vi } from "vite-plus/test";

interface MockSubscribeProps<TValue = unknown> {
  children: (selected: TValue) => ReactElement | null;
  selector: (state: unknown) => TValue;
}

const mockForm = {
  Subscribe: vi.fn<({ children, selector }: MockSubscribeProps) => ReactElement | null>(
    ({ children, selector }: MockSubscribeProps) =>
      children(selector({ canSubmit: true, errorMap: {}, isSubmitting: false })),
  ),
  handleSubmit: vi.fn<() => Promise<void>>(async () => {
    await Promise.resolve();
  }),
  reset: vi.fn<() => void>(),
  setErrorMap: vi.fn<(map: unknown) => void>(),
};

const mockField = {};

const contexts = {
  fieldContext: createContext(null),
  formContext: createContext(null),
  useFieldContext: vi.fn<() => typeof mockField>(() => mockField),
  useFormContext: vi.fn<() => typeof mockForm>(() => mockForm),
};

const createFormHookContexts = vi.fn<() => typeof contexts>(() => contexts);

export { createFormHookContexts };
