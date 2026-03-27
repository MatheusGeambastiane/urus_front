"use client";

import { ChevronRight, UserRound } from "lucide-react";
import type { UserItem } from "@/src/features/users/types";

type UserCardProps = {
  user: UserItem;
  roleLabel: string;
  onClick: (id: number) => void;
};

export function UserCard({ user, roleLabel, onClick }: UserCardProps) {
  const fullName = `${user.first_name} ${user.last_name}`.trim() || user.email;
  const professionalType =
    user.role === "professional" ? user.professional_profile?.professional_type : null;

  return (
    <button
      type="button"
      onClick={() => onClick(user.id)}
      className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-left transition hover:border-white/30"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5">
          {user.profile_pic ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.profile_pic} alt={fullName} className="h-full w-full object-cover" />
          ) : (
            <UserRound className="h-6 w-6 text-white/70" />
          )}
        </div>
        <div>
          <p className="text-base font-semibold">{fullName}</p>
          <p className="text-sm text-white/60">
            {roleLabel}
            {professionalType ? ` • ${professionalType}` : null}
          </p>
          <p className="text-xs text-white/40">{user.email}</p>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-white/30" />
    </button>
  );
}
