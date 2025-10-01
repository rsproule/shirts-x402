import type { Metadata } from "next";

const frame = {
  version: "1",
  imageUrl: "https://shirt.sh/shirt.png",
  button: {
    title: "Create Custom Shirt",
    action: {
      type: "launch_frame",
      name: "ShirtSlop",
      url: "https://shirt.sh/miniapp",
      splashImageUrl: "https://shirt.sh/shirt.png",
      splashBackgroundColor: "#f7f7f7",
    },
  },
};

export const metadata: Metadata = {
  title: "ShirtSlop - Farcaster Mini App",
  description: "Create custom AI-generated shirts",
  openGraph: {
    title: "ShirtSlop",
    description: "Create custom AI-generated shirts with x402 payments",
    images: [
      {
        url: "https://shirt.sh/shirt.png",
        width: 1200,
        height: 800,
        alt: "ShirtSlop",
      },
    ],
  },
  other: {
    "fc:miniapp": JSON.stringify(frame),
  },
};

export default function MiniAppLayout({ children }: { children: React.ReactNode }) {
  return children;
}
