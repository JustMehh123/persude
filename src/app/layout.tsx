import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "SiteForge — Google-Powered Website Builder & Publisher",
  description: "Connect your Google account, design responsive websites with custom themes, and publish live to the web with PostgreSQL.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#070b14] text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
