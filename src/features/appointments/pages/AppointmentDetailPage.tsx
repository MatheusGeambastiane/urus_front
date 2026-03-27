"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/src/features/dashboard/components/DashboardShell";
import { useAuth } from "@/src/features/shared/hooks/useAuth";
import { useAppointmentDetail } from "@/src/features/appointments/hooks/useAppointmentDetail";
import { AppointmentDetailScreen } from "@/src/features/appointments/components/AppointmentDetailScreen";

type Props = { id: string };

export function AppointmentDetailPage({ id }: Props) {
  const router = useRouter();
  const { accessToken, fetchWithAuth, profilePic, userRole } = useAuth();
  const detailState = useAppointmentDetail({
    appointmentId: Number(id),
    accessToken,
    fetchWithAuth,
  });

  const handleLogout = async () => signOut({ callbackUrl: "/dashboard/login" });

  return (
    <DashboardShell activeTab="agenda" userRole={userRole}>
      <AppointmentDetailScreen
        appointmentId={Number(id)}
        detailState={detailState}
        profilePic={profilePic}
        onLogout={handleLogout}
        onBack={() => router.push("/dashboard/agenda")}
        onEdit={() => router.push(`/dashboard/agenda/${id}/editar`)}
      />
    </DashboardShell>
  );
}
