import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pixel Canvas — Paint on the Blockchain",
  description: "A collaborative on-chain pixel canvas on Stacks. Place pixels, claim your spot, paint history forever.",
  icons: {
    icon: "/og.png",
    apple: "/og.png",
  },
  openGraph: {
    title: "Pixel Canvas — Paint on the Blockchain",
    description: "A collaborative on-chain pixel canvas on Stacks.",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pixel Canvas — Paint on the Blockchain',
    description: 'Place pixels on a shared on-chain canvas on Stacks.',
    images: ['/og.png'],
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
    <html lang="en" dir="ltr">
      <body className="antialiased" style={{ WebkitFontSmoothing: "antialiased" }}>{children}</body>
    </html>
  );
}
