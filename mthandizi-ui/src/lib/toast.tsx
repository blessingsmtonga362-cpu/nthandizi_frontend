import { toast as sonnerToast } from "sonner";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";


interface ToastConfig {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  duration?: number;
}

// Success toast
export function toastSuccess(config: ToastConfig | string) {
  const { title = "Success", description = "", duration = 3000 } = typeof config === "string" 
    ? { description: config } 
    : config;

  return sonnerToast.custom(
    (id) => (
      <div
        className={cn(
          "flex items-start gap-3 rounded-[0.5rem] border border-emerald-200 bg-emerald-50 px-4 py-3",
          "shadow-md"
        )}
      >
        <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          {title && <p className="text-sm font-medium text-emerald-900 font-display">{title}</p>}
          {description && <p className="text-xs text-emerald-700 mt-1 font-sans">{description}</p>}
        </div>
        <button
          onClick={() => sonnerToast.dismiss(id)}
          className="text-emerald-400 hover:text-emerald-600 flex-shrink-0"
        >
          <X size={16} />
        </button>
      </div>
    ),
    { duration }
  );
}

// Error toast
export function toastError(config: ToastConfig | string) {
  const { title = "Error", description = "", duration = 4000 } = typeof config === "string" 
    ? { description: config } 
    : config;

  return sonnerToast.custom(
    (id) => (
      <div
        className={cn(
          "flex items-start gap-3 rounded-[0.5rem] border border-red-200 bg-red-50 px-4 py-3",
          "shadow-md"
        )}
      >
        <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          {title && <p className="text-sm font-medium text-red-900 font-display">{title}</p>}
          {description && <p className="text-xs text-red-700 mt-1 font-sans">{description}</p>}
        </div>
        <button
          onClick={() => sonnerToast.dismiss(id)}
          className="text-red-400 hover:text-red-600 flex-shrink-0"
        >
          <X size={16} />
        </button>
      </div>
    ),
    { duration }
  );
}

// Info/neutral toast
export function toastInfo(config: ToastConfig | string) {
  const { title = "Info", description = "", duration = 3000 } = typeof config === "string" 
    ? { description: config } 
    : config;

  return sonnerToast.custom(
    (id) => (
      <div
        className={cn(
          "flex items-start gap-3 rounded-[0.5rem] border border-blue-200 bg-blue-50 px-4 py-3",
          "shadow-md"
        )}
      >
        <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          {title && <p className="text-sm font-medium text-blue-900 font-display">{title}</p>}
          {description && <p className="text-xs text-blue-700 mt-1 font-sans">{description}</p>}
        </div>
        <button
          onClick={() => sonnerToast.dismiss(id)}
          className="text-blue-400 hover:text-blue-600 flex-shrink-0"
        >
          <X size={16} />
        </button>
      </div>
    ),
    { duration }
  );
}
