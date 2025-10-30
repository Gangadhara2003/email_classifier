// app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "./providers"; // <-- Import

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Email Classifier",
  description: "Classify your Gmail inbox",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-200`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
