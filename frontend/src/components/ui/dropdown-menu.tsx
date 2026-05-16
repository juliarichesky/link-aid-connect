import * as React from "react";

import { cn } from "@/lib/classnames";

type DropdownContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const DropdownContext = React.createContext<DropdownContextValue | null>(null);

const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </DropdownContext.Provider>
  );
};

const DropdownMenuTrigger = ({ asChild, children }: { asChild?: boolean; children: React.ReactNode }) => {
  const context = React.useContext(DropdownContext);
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: React.MouseEventHandler }>, {
      onClick: (event: React.MouseEvent) => {
        children.props.onClick?.(event);
        context?.setOpen(!context.open);
      },
    });
  }
  return (
    <button type="button" onClick={() => context?.setOpen(!context.open)}>
      {children}
    </button>
  );
};

const DropdownMenuContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "end" }>(
  ({ className, align = "start", ...props }, ref) => {
    const context = React.useContext(DropdownContext);
    const contentRef = React.useRef<HTMLDivElement | null>(null);
    React.useImperativeHandle(ref, () => contentRef.current as HTMLDivElement);
    React.useEffect(() => {
      const handleClick = (event: MouseEvent) => {
        if (contentRef.current && !contentRef.current.contains(event.target as Node)) context?.setOpen(false);
      };
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, [context]);
    if (!context?.open) return null;
    return (
      <div
        ref={contentRef}
        className={cn(
          "absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
          align === "end" ? "right-0" : "left-0",
          className,
        )}
        {...props}
      />
    );
  },
);
DropdownMenuContent.displayName = "DropdownMenuContent";

const DropdownMenuItem = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { inset?: boolean }>(
  ({ className, inset, onClick, ...props }, ref) => {
    const context = React.useContext(DropdownContext);
    return (
      <button
        ref={ref}
        type="button"
        className={cn("relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground", inset && "pl-8", className)}
        onClick={(event) => {
          onClick?.(event);
          context?.setOpen(false);
        }}
        {...props}
      />
    );
  },
);
DropdownMenuItem.displayName = "DropdownMenuItem";

const DropdownMenuLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }>(
  ({ className, inset, ...props }, ref) => <div ref={ref} className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)} {...props} />,
);
DropdownMenuLabel.displayName = "DropdownMenuLabel";

const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

const DropdownMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("ml-auto text-xs tracking-widest opacity-60", className)} {...props} />
);

const Passthrough = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  Passthrough as DropdownMenuGroup,
  Passthrough as DropdownMenuPortal,
  Passthrough as DropdownMenuSub,
  DropdownMenuContent as DropdownMenuSubContent,
  DropdownMenuItem as DropdownMenuSubTrigger,
  Passthrough as DropdownMenuRadioGroup,
  DropdownMenuItem as DropdownMenuCheckboxItem,
  DropdownMenuItem as DropdownMenuRadioItem,
};
