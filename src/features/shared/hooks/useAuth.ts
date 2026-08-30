"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { createTokenRefreshService, type TokenRefreshService } from "@/src/features/shared/utils/auth";

export type AuthContext = {
  accessToken: string | null;
  fetchWithAuth: TokenRefreshService["fetchWithAuth"];
  userRole: string | undefined;
  profilePic: string | null;
};

export function useAuth(): AuthContext {
  const { data: session, update } = useSession();
  const accessToken = session?.accessToken ?? null;

  const userRole = (session?.user as { role?: string } | undefined)?.role;

  const profilePic =
    typeof session?.user === "object"
      ? ((session.user as { profile_pic?: string | null }).profile_pic ??
        (session.user as { image?: string | null }).image ??
        null)
      : null;

  const { fetchWithAuth } = useMemo(
    () =>
      createTokenRefreshService({
        accessToken: session?.accessToken ?? null,
        refreshAccessToken: async () => {
          const refreshedSession = await update();
          return refreshedSession?.accessToken ?? null;
        },
      }),
    [session?.accessToken, update],
  );

  return { accessToken, fetchWithAuth, userRole, profilePic };
}
