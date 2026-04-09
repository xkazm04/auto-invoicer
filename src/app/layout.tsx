import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ClientShell } from "@/components/layout/ClientShell";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const caveat = localFont({
  src: "./fonts/Caveat-Variable.woff2",
  variable: "--font-caveat",
  weight: "400 700",
});

export const metadata: Metadata = {
  title: "InvoiceFlow",
  description: "Invoice management for freelancers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} antialiased`}
      >
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
