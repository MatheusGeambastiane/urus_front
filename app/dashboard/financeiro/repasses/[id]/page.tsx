import { RepasseDetailPage } from "@/src/features/finances/pages/RepasseDetailPage";

export default async function RepasseDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RepasseDetailPage id={id} />;
}
