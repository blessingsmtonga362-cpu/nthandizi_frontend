
import { Suspense } from "react";

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading verification...</p>
        </div>
      </div>
    }>

    </Suspense>
  );
}
