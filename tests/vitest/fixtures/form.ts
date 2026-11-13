import { vi } from "vite-plus/test";

import type { useFieldContext } from "@/shared/ui/form/form-context";

type Field<FieldValue = string> = ReturnType<typeof useFieldContext<FieldValue>>;

interface CreateFormFieldFixtureProps<FieldValue = string> {
  form?: unknown;
  handleBlur?: Field<FieldValue>["handleBlur"];
  handleChange?: Field<FieldValue>["handleChange"];
  name?: string | undefined;
  state?:
    | {
        meta?:
          | {
              errors?: { message?: string }[] | undefined;
              isBlurred?: boolean | undefined;
              isTouched?: boolean | undefined;
              isValid?: boolean | undefined;
            }
          | undefined;
        value?: FieldValue | undefined;
      }
    | undefined;
}

function createFormFieldFixture<FieldValue = string>({
  form = { state: { submissionAttempts: 0 } },
  state: { meta = {}, ...state } = {},
  ...overrides
}: CreateFormFieldFixtureProps<FieldValue> = {}) {
  return {
    form,
    handleBlur: vi.fn<Field<FieldValue>["handleBlur"]>(),
    handleChange: vi.fn<Field<FieldValue>["handleChange"]>(),
    name: "email",
    state: {
      meta: { errors: [], isBlurred: false, isTouched: false, isValid: true, ...meta },
      value: "" as FieldValue,
      ...state,
    },
    ...overrides,
  } as unknown as Field<FieldValue>;
}

export {
  createFormFieldFixture,
  createFormFieldFixture as createTextFieldFixture,
  createFormFieldFixture as createToggleGroupFieldFixture,
};
