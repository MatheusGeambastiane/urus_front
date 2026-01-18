import { Suspense } from "react";
import { ResetPasswordForm } from "./reset-password-form";
import { ResetPasswordLoading } from "./reset-password-loading";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
