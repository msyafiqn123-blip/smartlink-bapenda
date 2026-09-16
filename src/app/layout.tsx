import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartLink - Bapenda Purwakarta",
  description: "Portal Resmi Subbidang Pendataan Penilaian PBB dan BPHTB Bapenda Purwakarta",
  icons: {
    icon: "/bapenda.png",
    shortcut: "/bapenda.png",
    apple: "/bapenda.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
