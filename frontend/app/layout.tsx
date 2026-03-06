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
  other: {
    "talentapp:project_verification": "73941bc34dc1cac0a732b377574c9a4902a328bfda929824073436edee283048a7073b23907affb25b30b421997ea72be1c2cc9de91f00d67d76a836d142a0a8",
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
