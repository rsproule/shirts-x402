import Header from "@/app/_components/header";
import { Providers } from "@/providers";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "shirt.sh",
  description: "AI-powered shirt creator with x402 payments",
  openGraph: {
    title: "shirt.sh",
    description: "AI-powered shirt creator with x402 payments",
    // For OG images, use an absolute URL, not a relative path
    images: [
      {
        url: "https://shirt.sh/shirt.png",
        width: 1200,
        height: 630,
        alt: "Shirt.sh preview",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistMono.variable} ${geistSans.variable} flex h-screen flex-col antialiased`}
        style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
      >
        <Providers>
          <Header title="shirt.sh" />
          <div className="min-h-0 flex-1">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
