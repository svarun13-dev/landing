import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "md";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50",
          variant === "default" && "bg-indigo-600 text-white hover:bg-indigo-500",
          variant === "ghost" && "hover:bg-white/5 text-zinc-400 hover:text-white",
          variant === "outline" && "border border-zinc-700 hover:bg-white/5 text-zinc-300",
          size === "sm" && "h-8 px-3 text-xs",
          size === "md" && "h-9 px-4 text-sm",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
