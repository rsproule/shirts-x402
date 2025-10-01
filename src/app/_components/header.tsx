"use client";

import { ConnectWallet } from "@/app/_components/x402/ConnectWallet";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import type { FC } from "react";

interface HeaderProps {
  title?: string;
  className?: string;
}

const Header: FC<HeaderProps> = ({ title = "My App", className = "" }) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <header className={`border-b-2 border-foreground bg-background ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center">
            <h1 className="font-mono font-bold text-foreground text-sm tracking-wider">$ {title}</h1>
          </div>

          <nav className="flex items-center space-x-3">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="border-2 border-foreground bg-background hover:bg-foreground hover:text-background px-3 py-2 font-mono text-xs tracking-wide transition-all"
            >
              [{theme === "dark" ? "LIGHT" : "DARK"}]
            </button>
            <ConnectWallet />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
