"use client";

import * as React from "react";

import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

function usePopoverContext() {
  const context = React.useContext(PopoverContext);
  if (!context) {
    throw new Error("Popover components must be used within <Popover>");
  }
  return context;
}

function Popover({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </PopoverContext.Provider>
  );
}

type PopoverTriggerProps = React.ComponentPropsWithoutRef<"button"> &
  React.ComponentPropsWithoutRef<typeof Slot> & {
    asChild?: boolean;
  };

const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ className, onClick, children, asChild = false, ...props }, ref) => {
    const { open, setOpen } = usePopoverContext();
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        type={asChild ? undefined : "button"}
        ref={ref}
        className={className}
        onClick={(event) => {
          onClick?.(event);
          setOpen(!open);
        }}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
PopoverTrigger.displayName = "PopoverTrigger";

const PopoverContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    align?: "start" | "end";
  }
>(({ className, children, align = "start", ...props }, ref) => {
  const { open, setOpen } = usePopoverContext();
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div
      ref={(node) => {
        containerRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      }}
      className={cn(
        "absolute z-50 mt-2 w-72 rounded-3xl border bg-popover p-4 text-popover-foreground shadow-md",
        align === "end" ? "right-0" : "left-0",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
PopoverContent.displayName = "PopoverContent";

function PopoverAnchor({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger };
