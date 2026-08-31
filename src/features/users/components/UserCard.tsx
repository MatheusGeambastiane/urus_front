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
      className="group flex w-full min-w-0 items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5e7eb]/55 hover:border-white/30 lg:min-h-[76px] lg:rounded-[14px] lg:border-white/[0.065] lg:bg-black/20 lg:px-4 lg:hover:border-[#e5e7eb]/25 lg:hover:bg-[#e5e7eb]/[0.035]"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5 lg:h-11 lg:w-11 lg:rounded-[12px] lg:border-[#e5e7eb]/15 lg:bg-[#e5e7eb]/[0.055]">
          {user.profile_pic ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.profile_pic} alt={fullName} className="h-full w-full object-cover" />
          ) : (
            <UserRound className="h-6 w-6 text-white/70 lg:text-[#e5e7eb]/70" />
          )}
        </div>
        <div className="min-w-0 lg:grid lg:flex-1 lg:grid-cols-[minmax(150px,1fr)_minmax(180px,1.2fr)_auto] lg:items-center lg:gap-5">
          <p className="break-words text-base font-semibold leading-snug">{fullName}</p>
          <p className="mt-1 text-sm text-white/60 lg:order-3 lg:mt-0 lg:inline-flex lg:w-fit lg:justify-self-end lg:rounded-full lg:border lg:border-white/[0.07] lg:bg-white/[0.035] lg:px-2.5 lg:py-1 lg:text-xs lg:text-white/55">
            {roleLabel}
            {professionalType ? ` • ${professionalType}` : null}
          </p>
          <p className="mt-1 break-all text-xs text-white/40 lg:order-2 lg:mt-0 lg:text-sm">{user.email}</p>
        </div>
      </div>
      <ChevronRight className="ml-3 h-4 w-4 shrink-0 text-white/30 transition group-hover:translate-x-0.5 group-hover:text-[#e5e7eb]/70" />
    </button>
  );
}
