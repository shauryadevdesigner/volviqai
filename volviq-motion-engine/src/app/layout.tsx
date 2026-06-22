import { Metadata, Viewport } from "next";
import { Sora } from "next/font/google";
import "../../styles/global.css";
import { AuthProvider } from "@/components/providers/AuthProvider";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

export const metadata: Metadata = {
  title: "Volviq AI — Motion Graphics Studio",
  description:
    "AI-powered motion graphics for ads, reels, and brand campaigns.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={sora.variable} suppressHydrationWarning>
      <body className="bg-background font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
