import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pixel Canvas — Paint on the Blockchain",
  description: "A collaborative on-chain pixel canvas on Stacks. Place pixels, claim your spot, paint history forever.",
  openGraph: {
    title: "Pixel Canvas — Paint on the Blockchain",
    description: "A collaborative on-chain pixel canvas on Stacks.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
