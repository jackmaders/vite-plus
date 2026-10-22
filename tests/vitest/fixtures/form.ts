import { vi } from "vite-plus/test";

import type { useFieldContext } from "@/shared/ui/form/form-context";

type Field = ReturnType<typeof useFieldContext<string>>;

interface CreateFormFieldFixtureProps {
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

function createFormFieldFixture({
  state: { meta = {}, ...state } = {},
  ...overrides
}: CreateFormFieldFixtureProps = {}) {
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

export { createFormFieldFixture, createFormFieldFixture as createTextFieldFixture };
export type { CreateFormFieldFixtureProps };
