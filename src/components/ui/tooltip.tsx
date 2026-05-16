import * as React from "react";

import { cn } from "@/lib/classnames";

type TooltipContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const TooltipContext = React.createContext<TooltipContextValue | null>(null);

const TooltipProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

const Tooltip = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      <span className="relative inline-flex">{children}</span>
    </TooltipContext.Provider>
  );
};

const TooltipTrigger = ({ asChild, children }: { asChild?: boolean; children: React.ReactNode }) => {
  const context = React.useContext(TooltipContext);
  const triggerProps = {
    onMouseEnter: () => context?.setOpen(true),
    onMouseLeave: () => context?.setOpen(false),
    onFocus: () => context?.setOpen(true),
    onBlur: () => context?.setOpen(false),
  };
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<typeof triggerProps>, triggerProps);
  }
  return <span {...triggerProps}>{children}</span>;
};

const TooltipContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  const context = React.useContext(TooltipContext);
  if (!context?.open) return null;
  return (
    <div
      ref={ref}
      className={cn("absolute z-50 mt-2 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95", className)}
      {...props}
    />
  );
});
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
