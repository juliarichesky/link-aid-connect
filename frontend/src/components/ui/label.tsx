import * as React from "react";

import { cn } from "@/lib/classnames";

const labelClassName = "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70";

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => <label ref={ref} className={cn(labelClassName, className)} {...props} />,
);
Label.displayName = "Label";

export { Label };
