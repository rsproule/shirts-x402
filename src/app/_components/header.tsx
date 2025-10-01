import { ConnectWallet } from "@/app/_components/x402/ConnectWallet";
import type { FC } from "react";

interface HeaderProps {
  title?: string;
  className?: string;
}

const Header: FC<HeaderProps> = async ({ title = "My App", className = "" }) => {
  return (
    <header className={`border-b-2 border-foreground bg-background ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center">
            <h1 className="font-mono font-bold text-foreground text-sm tracking-wider">$ {title}</h1>
          </div>

          <nav className="flex items-center space-x-4">
            <ConnectWallet />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
