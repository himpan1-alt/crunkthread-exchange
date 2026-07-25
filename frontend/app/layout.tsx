import "./globals.css";
import type { Metadata } from "next";
import { Roboto_Mono } from "next/font/google";

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});



export const metadata: Metadata = {
  title: "Crunk Thread | Exchange Portal",
description: "Official Exchange Portal for Crunk Thread",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
  <body className={`${robotoMono.className} min-h-full flex flex-col`}>{children}</body>
    </html>
  );
}
