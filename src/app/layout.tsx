import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from '@/components/ui/Toast';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Atlas City | Metaverse of Technical Influence",
  description: "Explore the spatial social graph of global developers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
