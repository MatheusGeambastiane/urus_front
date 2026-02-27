import { ServiceDetailPage } from "@/src/features/services/pages/ServiceDetailPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ServiceDetailPage id={id} />;
}
