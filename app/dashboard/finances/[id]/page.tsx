import { FinanceDetailPage } from "@/src/features/finances/pages/FinanceDetailPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FinanceDetailPage id={id} />;
}
