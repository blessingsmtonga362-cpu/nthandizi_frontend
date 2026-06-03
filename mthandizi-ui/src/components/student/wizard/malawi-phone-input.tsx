"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MALAWI_PHONE_ERROR, isValidMalawiPhone, toMalawiPhone } from "@/lib/phone";

type MalawiPhoneInputProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  showError?: boolean;
  error?: string;
};

export function MalawiPhoneInput({
  value,
  onChange,
  className,
  showError = false,
  error,
}: MalawiPhoneInputProps) {
  // Always store / display in +265XXXXXXXXX format
  const normalised = toMalawiPhone(value);

  // Show inline error only when the field has content and is invalid
  const validationError =
    showError && value.length > 0 && !isValidMalawiPhone(value)
      ? MALAWI_PHONE_ERROR
      : "";
  const errorMessage = error ?? validationError;
  const hasError = Boolean(errorMessage);

  return (
    <div className="space-y-1">
      <div
        className={cn(
          "flex h-14 w-full items-center border border-slate-200 transition-colors hover:border-brand-blue focus-within:border-brand-blue",
          hasError && "border-red-400 hover:border-red-500 focus-within:border-red-500",
          className,
        )}
        style={{ backgroundColor: "#F7F5F2" }}
      >
        {/* Static +265 prefix */}
        <div className="flex h-full items-center px-4 text-sm font-bold text-slate-700 select-none">
          +265
        </div>
        <div className="h-6 w-px bg-slate-300/70" />
        {/* User types the 9 significant digits (8XXXXXXXX or 9XXXXXXXX) */}
        <Input
          type="tel"
          inputMode="numeric"
          maxLength={9}
          pattern="[89][0-9]{8}"
          className="h-full flex-1 rounded-none border-0 bg-transparent px-4 focus:border-0 focus:ring-0"
          placeholder="991234567"
          value={normalised.startsWith("+265") ? normalised.slice(4) : normalised}
          onChange={(e) => {
            // Strip non-digits, limit to 9 chars, then store as full +265 number
            const raw = e.target.value.replace(/\D/g, "").slice(0, 9);
            onChange(raw.length > 0 ? `+265${raw}` : "");
          }}
          aria-invalid={hasError}
        />
      </div>
      {hasError && (
        <p className="text-xs font-normal text-red-500">{errorMessage}</p>
      )}
    </div>
  );
}
