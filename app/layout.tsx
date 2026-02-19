import type { Metadata } from "next";
import "./globals.css";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { PwaRegister } from "@/components/providers/pwa-register";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "Urus - Backoffice",
  description: "Sistema de gerenciamento da barbearia Urus",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <AuthSessionProvider>{children}</AuthSessionProvider>
        <PwaRegister />
        <SpeedInsights />
      </body>
    </html>
  );
}
