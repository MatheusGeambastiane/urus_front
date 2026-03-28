import { FinanceDetailPage } from "@/src/features/finances/pages/FinanceDetailPage";

export default async function BillDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FinanceDetailPage id={id} />;
}
