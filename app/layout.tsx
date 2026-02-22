import type { Metadata } from "next";
import "./globals.css";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { PwaRegister } from "@/components/providers/pwa-register";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "Urus - Backoffice",
  description: "Sistema de gerenciamento da barbearia Urus",
  manifest: "/manifest.webmanifest",
  themeColor: "#050505",
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
