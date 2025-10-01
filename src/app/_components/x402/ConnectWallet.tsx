"use client";

import { ConnectKitButton } from "connectkit";

export const ConnectWallet = () => {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, truncatedAddress, ensName }) => {
        return (
          <button
            onClick={show}
            className="border-2 border-foreground bg-background hover:bg-foreground hover:text-background px-4 py-2 font-mono text-xs tracking-wide transition-all"
          >
            {isConnected ? `[${ensName ?? truncatedAddress}]` : "[CONNECT_WALLET]"}
          </button>
        );
      }}
    </ConnectKitButton.Custom>
  );
};
