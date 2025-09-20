/**
 * Input Component
 * 
 * Styled input field component with consistent design system integration.
 * 
 * Features:
 * - Responsive text sizing (base on mobile, sm on desktop)
 * - Full accessibility with focus rings and disabled states
 * - File input styling for upload controls
 * - Semantic background and border colors from design tokens
 * - Proper placeholder styling with muted text
 * 
 * Supports all standard HTML input attributes and types.
 * 
 * Usage:
 * <Input type="email" placeholder="Enter email" />
 * <Input type="file" />
 * <Input type="password" disabled />
 */
import * as React from "react";

import { cn } from "@/lib/utils";

// Forward ref input with comprehensive styling
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base layout and sizing
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2",
          // Typography (responsive: base on mobile, sm on desktop)
          "text-base md:text-sm",
          // Focus and interaction states
          "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          // File input specific styling
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          // Placeholder and disabled states
          "placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
