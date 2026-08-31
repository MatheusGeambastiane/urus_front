"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createPortal } from "react-dom";
import { BarChart3, FileText, LogOut, UserRound, UserCircle2 } from "lucide-react";

type ProfileMenuProps = {
  profilePicUrl: string | null;
  onLogout: () => void;
  myProfileHref?: string;
  analyticsHref?: string;
  documentsHref?: string;
};

export function ProfileMenu({ profilePicUrl, onLogout, myProfileHref, analyticsHref, documentsHref }: ProfileMenuProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const updateMenuPosition = () => {
      const trigger = menuRef.current?.getBoundingClientRect();
      if (!trigger) return;

      setMenuPosition({
        top: trigger.bottom + 12,
        right: Math.max(16, window.innerWidth - trigger.right),
      });
    };
    const scrollListenerOptions: AddEventListenerOptions = { capture: true, passive: true };

    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, scrollListenerOptions);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, scrollListenerOptions);
    };
  }, [menuOpen]);

  const toggleMenu = () => {
    if (menuOpen) {
      setMenuOpen(false);
      return;
    }

    const trigger = menuRef.current?.getBoundingClientRect();
    if (!trigger) return;

    setMenuPosition({
      top: trigger.bottom + 12,
      right: Math.max(16, window.innerWidth - trigger.right),
    });
    setMenuOpen(true);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedOutsideTrigger = !menuRef.current?.contains(target);
      const clickedOutsidePanel = !menuPanelRef.current?.contains(target);

      if (clickedOutsideTrigger && clickedOutsidePanel) {
        setMenuOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  return (
    <>
      <div className="relative z-[70]" ref={menuRef}>
        <button
          type="button"
          className="h-12 w-12 overflow-hidden rounded-full border border-white/20"
          onClick={toggleMenu}
          aria-label="Abrir menu do usuário"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
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
      </div>
      {menuOpen && menuPosition
        ? createPortal(
          <div
            ref={menuPanelRef}
            role="menu"
            className="fixed z-[9999] w-48 rounded-2xl border border-white/10 bg-[#111] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.65)]"
            style={menuPosition}
          >
          {myProfileHref ? (
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                router.push(myProfileHref);
              }}
              role="menuitem"
              className="mb-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10"
            >
              <UserCircle2 className="h-4 w-4" />
              Meu perfil
            </button>
          ) : null}
          {analyticsHref ? (
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                router.push(analyticsHref);
              }}
              role="menuitem"
              className="mb-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10"
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </button>
          ) : null}
          {documentsHref ? (
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                router.push(documentsHref);
              }}
              role="menuitem"
              className="mb-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10"
            >
              <FileText className="h-4 w-4" />
              Documentos
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              onLogout();
            }}
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
          </div>,
          document.body,
        )
        : null}
    </>
  );
}
