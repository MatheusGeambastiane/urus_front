import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import "./globals.css";
import { authOptions } from "@/lib/auth-options";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { PwaRegister } from "@/components/providers/pwa-register";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "Urus - Backoffice",
  description: "Sistema de gerenciamento da barbearia Urus",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Urus - Backoffice",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport = {
  themeColor: "#050505",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <AuthSessionProvider session={session}>{children}</AuthSessionProvider>
        <PwaRegister />
        <SpeedInsights />
      </body>
    </html>
  );
}
