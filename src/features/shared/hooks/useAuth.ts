"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { env } from "@/lib/env";
import { createTokenRefreshService, type TokenRefreshService } from "@/src/features/shared/utils/auth";

export type AuthContext = {
  accessToken: string | null;
  fetchWithAuth: TokenRefreshService["fetchWithAuth"];
  userRole: string | undefined;
  profilePic: string | null;
};

export function useAuth(): AuthContext {
  const { data: session } = useSession();
  const [accessToken, setAccessToken] = useState<string | null>(
    session?.accessToken ?? null,
  );

  const refreshToken = session?.refreshToken ?? null;

  const userRole = (session?.user as { role?: string } | undefined)?.role;

  const profilePic =
    typeof session?.user === "object"
      ? ((session.user as { profile_pic?: string | null }).profile_pic ??
        (session.user as { image?: string | null }).image ??
        null)
      : null;

  useEffect(() => {
    setAccessToken(session?.accessToken ?? null);
  }, [session?.accessToken]);

  const { fetchWithAuth } = useMemo(
    () =>
      createTokenRefreshService({
        apiBaseUrl: env.apiBaseUrl,
        refreshToken,
        onAccessToken: setAccessToken,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshToken],
  );

  return { accessToken, fetchWithAuth, userRole, profilePic };
}
