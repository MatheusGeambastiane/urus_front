import { EditAppointmentPage } from "@/src/features/appointments/pages/EditAppointmentPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditAppointmentPage id={id} />;
}
