import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";

export const metadata: Metadata = {
  title: "Markets",
  description: "Discover and trade tokenized assets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0a0f] text-zinc-100 antialiased">
        <Sidebar />
        <main className="ml-16 min-h-screen">{children}</main>
      </body>
    </html>
  );
}
