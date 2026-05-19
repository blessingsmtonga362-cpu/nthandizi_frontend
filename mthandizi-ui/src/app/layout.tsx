// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css"; // <--- THIS LINE IS CRITICAL
import { ErrorHandler } from "@/components/error-handler";

export const metadata: Metadata = {
  title: "UNIMA Student Support System",
  description: "Official Student Support Profiling System for the University of Malawi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <ErrorHandler />
        {children}
      </body>
    </html>
  );
}