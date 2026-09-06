import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "R.ON DRAMA STUDIO — AI Series Production Workstation",
  description: "AI Pre-Production + Screenwriting + Directing + Visual Continuity Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className="bg-studio-950 text-zinc-100 antialiased h-full flex flex-col overflow-hidden">
        <div className="flex h-full w-full overflow-hidden">
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto bg-studio-950 p-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
