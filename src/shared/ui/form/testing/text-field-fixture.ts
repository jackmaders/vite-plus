import { vi } from "vite-plus/test";

import type { useFieldContext } from "@/shared/ui/form/form-context";

type Field = ReturnType<typeof useFieldContext<string>>;

interface CreateTextFieldFixtureProps {
  handleBlur?: Field["handleBlur"];
  handleChange?: Field["handleChange"];
  name?: string;
  state?: {
    meta?: {
      errors?: { message?: string }[];
      isTouched?: boolean;
      isValid?: boolean;
    };
    value?: string;
  };
}

function createTextFieldFixture({
  state: { meta = {}, ...state } = {},
  ...overrides
}: CreateTextFieldFixtureProps = {}) {
  return {
    handleBlur: vi.fn<Field["handleBlur"]>(),
    handleChange: vi.fn<Field["handleChange"]>(),
    name: "email",
    state: {
      meta: { errors: [], isTouched: false, isValid: true, ...meta },
      value: "",
      ...state,
    },
    ...overrides,
  } as unknown as Field;
}

export { createTextFieldFixture };
export type { CreateTextFieldFixtureProps };
