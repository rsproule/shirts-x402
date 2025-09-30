import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { getDefaultConfig } from "connectkit";

export const config = createConfig(
  getDefaultConfig({
    chains: [base],
    transports: {
      [base.id]: http(),
    },
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    appName: "Shirt.sh",
    appDescription: "Shirt.sh Application",
    appUrl: "https://shirt.sh",
  }),
);
