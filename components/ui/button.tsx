import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm hover:shadow-md hover:brightness-105 border border-primary/20",
        secondary:
          "border border-border bg-card text-foreground hover:bg-muted/80 hover:text-foreground shadow-2xs",
        outline:
          "border border-primary/30 bg-card text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/50 shadow-2xs",
        ghost:
          "text-foreground hover:bg-primary/10 hover:text-primary",
        destructive:
          "bg-destructive/15 text-destructive hover:bg-destructive hover:text-destructive-foreground border border-destructive/30 shadow-2xs",
        link: "text-primary underline-offset-4 hover:underline p-0 h-auto font-semibold",
      },
      size: {
        default: "h-9 px-4 py-2 text-xs",
        sm: "h-8 rounded-lg px-3 text-[11px]",
        lg: "h-10 rounded-xl px-5 text-sm font-bold",
        icon: "h-9 w-9 rounded-lg p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
