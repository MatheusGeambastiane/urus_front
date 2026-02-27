import { AppointmentDetailPage } from "@/src/features/appointments/pages/AppointmentDetailPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AppointmentDetailPage id={id} />;
}
