'use client';

import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            +
          </div>
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent">
            Kids Math Game
          </Link>
        </div>
        <nav className="flex items-center gap-4">
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
