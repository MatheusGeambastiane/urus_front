"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/src/features/dashboard/components/DashboardShell";
import { useAuth } from "@/src/features/shared/hooks/useAuth";
import { useUsers } from "@/src/features/users/hooks/useUsers";
import { useUserDetail } from "@/src/features/users/hooks/useUserDetail";
import { UserDetailScreen } from "@/src/features/users/components/UserDetailScreen";

type Props = { id: string };

export function UserDetailPage({ id }: Props) {
  const router = useRouter();
  const { accessToken, fetchWithAuth, profilePic, userRole } = useAuth();
  const { roleOptions } = useUsers({ accessToken, fetchWithAuth });
  const detail = useUserDetail({
    userId: Number(id),
    accessToken,
    fetchWithAuth,
  });

  const handleLogout = async () => signOut({ callbackUrl: "/dashboard/login" });

  return (
    <DashboardShell activeTab="users" userRole={userRole}>
      <UserDetailScreen
        detail={detail}
        accessToken={accessToken}
        fetchWithAuth={fetchWithAuth}
        roleOptions={roleOptions}
        userRole={userRole}
        profilePic={profilePic}
        onLogout={handleLogout}
        onBack={() => router.push("/dashboard/usuarios")}
      />
    </DashboardShell>
  );
}
