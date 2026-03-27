"use client";

type FeedbackBannerProps = {
  message: string;
  type: "success" | "error";
  actionLabel?: string;
  onAction?: () => void;
};

export function FeedbackBanner({ message, type, actionLabel, onAction }: FeedbackBannerProps) {
  const styles =
    type === "success"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
      : "border-red-500/30 bg-red-500/10 text-red-100";

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${styles}`}>
      <div className="flex items-center justify-between gap-3">
        <span>{message}</span>
        {actionLabel && onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="rounded-xl border border-current/40 px-3 py-1 text-xs font-semibold"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
