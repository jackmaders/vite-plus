import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { useMemo, type ComponentProps, type ReactNode } from "react";

import { Label } from "./label";

function FieldSet({ className, ...props }: ComponentProps<"fieldset">) {
  return (
    <fieldset
      className={cn(
        "flex flex-col gap-4 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3",
        className,
      )}
      data-slot="field-set"
      {...props}
    />
  );
}

function FieldLegend({
  className,
  variant = "legend",
  ...props
}: ComponentProps<"legend"> & { variant?: "label" | "legend" }) {
  return (
    <legend
      className={cn(
        "mb-1.5 font-medium data-[variant=label]:text-sm data-[variant=legend]:text-base",
        className,
      )}
      data-slot="field-legend"
      data-variant={variant}
      {...props}
    />
  );
}

function FieldGroup({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "group/field-group @container/field-group flex w-full flex-col gap-5 data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4",
        className,
      )}
      data-slot="field-group"
      {...props}
    />
  );
}

const fieldVariants = cva("group/field flex w-full gap-2 data-[invalid=true]:text-destructive", {
  defaultVariants: {
    orientation: "vertical",
  },
  variants: {
    orientation: {
      horizontal:
        "flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
      responsive:
        "flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
      vertical: "flex-col *:w-full [&>.sr-only]:w-auto",
    },
  },
});

function Field({
  className,
  orientation = "vertical",
  ...props
}: ComponentProps<"fieldset"> & VariantProps<typeof fieldVariants>) {
  return (
    <fieldset
      className={cn(fieldVariants({ orientation }), className)}
      data-orientation={orientation}
      data-slot="field"
      {...props}
    />
  );
}

function FieldContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("group/field-content flex flex-1 flex-col gap-0.5 leading-snug", className)}
      data-slot="field-content"
      {...props}
    />
  );
}

function FieldLabel({ className, ...props }: ComponentProps<typeof Label>) {
  return (
    <Label
      className={cn("flex w-fit gap-2 text-sm leading-snug font-medium", className)}
      data-slot="field-label"
      {...props}
    />
  );
}

function FieldTitle({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex w-fit items-center gap-2 text-sm font-medium group-data-[disabled=true]/field:opacity-50",
        className,
      )}
      data-slot="field-label"
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "text-left text-sm leading-normal font-normal text-muted-foreground group-has-data-horizontal/field:text-balance [[data-variant=legend]+*]:-mt-1.5",
        "last:mt-0 nth-last-2:-mt-1",
        "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className,
      )}
      data-slot="field-description"
      {...props}
    />
  );
}

function FieldSeparator({
  children,
  className,
  ...props
}: ComponentProps<"div"> & {
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2",
        className,
      )}
      data-content={Boolean(children)}
      data-slot="field-separator"
      {...props}
    >
      <div className="absolute inset-0 top-1/2 border-t border-border" />
      {Boolean(children) && (
        <span
          className="relative mx-auto block w-fit bg-background px-2 text-muted-foreground"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  );
}

function extractErrorMessage(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }
  if (typeof error === "object" && error !== null && "message" in error) {
    const errorRecord = error as { message?: unknown };
    return typeof errorRecord.message === "string" ? errorRecord.message : "";
  }
  return "";
}

function renderErrorList(messages: string[]) {
  const uniqueErrors = [...new Set(messages)];
  if (uniqueErrors.length === 1) {
    return uniqueErrors[0];
  }
  return (
    <ul className="ml-4 flex list-disc flex-col gap-1">
      {uniqueErrors.map((message) => (
        <li key={message}>{message}</li>
      ))}
    </ul>
  );
}

function renderErrorContent(
  children: ReactNode | undefined,
  errors: unknown[] | undefined,
): ReactNode {
  const hasChildren = Boolean(children);
  if (hasChildren) {
    return children;
  }
  if (!errors || errors.length === 0) {
    return false;
  }
  const messages = errors
    .map((error) => extractErrorMessage(error))
    .filter((message) => message.length > 0);
  if (messages.length === 0) {
    return false;
  }
  return renderErrorList(messages);
}

function FieldError({
  className,
  children,
  errors,
  ...props
}: ComponentProps<"div"> & {
  errors?: unknown[];
}): ReactNode {
  const content = useMemo(
    (): ReactNode => renderErrorContent(children, errors),
    [children, errors],
  );

  const hasContent = Boolean(content);
  if (!hasContent) {
    return false;
  }

  const isHidden = Boolean(props.hidden);
  return (
    <div
      className={cn("text-sm font-normal text-destructive", className)}
      data-slot="field-error"
      {...(isHidden ? {} : { role: "alert" })}
      {...props}
    >
      {content}
    </div>
  );
}

export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
  fieldVariants,
};
