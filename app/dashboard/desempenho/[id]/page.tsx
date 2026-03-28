import { PerformanceDetailPage } from "@/src/features/finances/pages/PerformanceDetailPage";

export default async function PerformanceDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PerformanceDetailPage id={id} />;
}
