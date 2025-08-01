import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Logo from "./components/Logo";
import UserInfo from "./components/UserInfo";
import Breadcrumb from "./components/Breadcrumb";
import Sidebar from "./components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EasyMath - 数学学习",
  description: "数学教学网站",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white min-h-screen`}>
        {/* 顶部通栏 */}
        <header className="w-full h-16 flex items-center justify-between px-8 border-b bg-white shadow-sm">
          <div className="flex items-center space-x-8 w-1/3">
            <Logo />
          </div>
          <div className="flex-1 flex justify-center">
            <Breadcrumb />
          </div>
          <div className="flex items-center justify-end w-1/3">
            <UserInfo />
          </div>
        </header>
        {/* 主体内容和左侧菜单栏 */}
        <div className="flex flex-row min-h-[calc(100vh-4rem)]">
          <Sidebar />
          <main className="flex-1 p-8">{children}</main>
        </div>
      </body>
    </html>
  );
} 