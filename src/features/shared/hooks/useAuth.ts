"use client";

import { useMemo, useState } from "react";
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
  const refreshToken = session?.refreshToken ?? null;
  const [refreshedCredentials, setRefreshedCredentials] = useState<{
    refreshToken: string;
    accessToken: string;
  } | null>(null);
  const accessToken =
    refreshedCredentials?.refreshToken === refreshToken
      ? refreshedCredentials.accessToken
      : (session?.accessToken ?? null);

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
        apiBaseUrl: env.apiBaseUrl,
        refreshToken,
        accessToken: session?.accessToken ?? null,
        onAccessToken: (newAccessToken) => {
          if (refreshToken) {
            setRefreshedCredentials({
              refreshToken,
              accessToken: newAccessToken,
            });
          }
        },
      }),
    [refreshToken, session?.accessToken],
  );

  return { accessToken, fetchWithAuth, userRole, profilePic };
}
