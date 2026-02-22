import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface BrandIconProps {
  className?: string;
}

export function GmailBrandIcon({ className }: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2.5" fill="#fff" />
      <path d="M4 7.6 12 13l8-5.4V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7.6Z" fill="#EA4335" />
      <path d="M4 7.6V18a2 2 0 0 0 2 2h2.5V10.2L4 7.6Z" fill="#34A853" />
      <path d="M20 7.6V18a2 2 0 0 1-2 2h-2.5V10.2L20 7.6Z" fill="#4285F4" />
      <path d="M4 7.6 12 13l8-5.4V6.5A2.5 2.5 0 0 0 17.5 4h-11A2.5 2.5 0 0 0 4 6.5v1.1Z" fill="#FBBC05" />
    </svg>
  );
}

export function GoogleMeetBrandIcon({ className }: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} aria-hidden="true">
      <rect x="2" y="5" width="13.5" height="14" rx="3" fill="#34A853" />
      <path d="M15.5 9.2 22 6v12l-6.5-3.2Z" fill="#00AC47" />
      <path d="M7.4 9.6h3.3v4.8H7.4Z" fill="#fff" opacity="0.95" />
      <path d="m10.7 10.9 3.3-1.7v5.6l-3.3-1.7Z" fill="#fff" opacity="0.95" />
    </svg>
  );
}

export function StripeBrandIcon({ className }: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} aria-hidden="true">
      <rect x="1.5" y="1.5" width="21" height="21" rx="5.5" fill="#635BFF" />
      <path
        fill="#fff"
        d="M13 9.2c-1.3-.4-2.1-.7-2.1-1 0-.2.3-.3.7-.3 1 0 2 .2 2.9.6l.5-2.1c-.9-.4-1.9-.6-3.3-.6-2.2 0-3.8 1.2-3.8 3.1 0 2.3 2 2.8 3.4 3.2 1.2.3 1.7.6 1.7 1s-.4.6-1 .6c-1.1 0-2.3-.4-3.3-.9l-.5 2.2c1 .5 2.2.8 3.7.8 2.4 0 4-1.2 4-3.2 0-2.4-2-2.9-2.9-3.4Z"
      />
    </svg>
  );
}

export function BrandIconPlate({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}
