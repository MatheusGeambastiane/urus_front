"use client";

import { useEffect, useId, type ReactNode } from "react";
import { X } from "lucide-react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg";
};

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export function Modal({ open, onClose, title, subtitle, children, maxWidth = "md" }: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 p-2 pt-4 sm:items-center sm:p-4">
      <div
        className={`flex max-h-[calc(100dvh-1rem)] w-full ${maxWidthClasses[maxWidth]} min-h-0 flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#050505] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-white shadow-card sm:max-h-[calc(100dvh-2rem)] sm:rounded-3xl sm:pb-5`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="mb-4 flex shrink-0 items-center justify-between">
          <div>
            {subtitle ? <p className="text-sm text-white/60">{subtitle}</p> : null}
            <h2 id={titleId} className="text-xl font-semibold">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 p-2 text-white/70 hover:text-white"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="no-scrollbar min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain pr-1 [-webkit-overflow-scrolling:touch]">
          {children}
        </div>
      </div>
    </div>
  );
}
