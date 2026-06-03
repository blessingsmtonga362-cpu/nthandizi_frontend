import * as React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        ref={ref}
        className={cn(
          "w-4 h-4 rounded border-slate-300 text-unima-blue focus:ring-unima-blue",
          className
        )}
        {...props}
      />
      {label && <span className="text-sm text-slate-700">{label}</span>}
    </label>
  )
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
