"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut, UserRound, UserCircle2 } from "lucide-react";

type ProfileMenuProps = {
  profilePicUrl: string | null;
  onLogout: () => void;
  myProfileHref?: string;
};

export function ProfileMenu({ profilePicUrl, onLogout, myProfileHref }: ProfileMenuProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <div className="relative z-[70]" ref={menuRef}>
      <button
        type="button"
        className="h-12 w-12 overflow-hidden rounded-full border border-white/20"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="Abrir menu do usuário"
      >
        {profilePicUrl ? (
          <Image
            src={profilePicUrl}
            alt="Foto do usuário"
            width={48}
            height={48}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-white/5">
            <UserRound className="h-5 w-5 text-white/80" />
          </div>
        )}
      </button>
      {menuOpen ? (
        <div className="absolute right-0 z-[80] mt-3 w-48 rounded-2xl border border-white/10 bg-[#111] p-2 shadow-xl">
          {myProfileHref ? (
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                router.push(myProfileHref);
              }}
              className="mb-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10"
            >
              <UserCircle2 className="h-4 w-4" />
              Meu perfil
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              onLogout();
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      ) : null}
    </div>
  );
}
