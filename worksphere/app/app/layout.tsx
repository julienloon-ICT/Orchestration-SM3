// /app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MetadataProvider } from './context/MetadataContext';  // Zorg ervoor dat je de provider correct importeert

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WorkSphere",
  description: "WorkSphere: Your Go-To Hub for Effortless HR Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/favicon.ico"/>
        <link rel="icon" type="image/png" href="/images/favicon.png"/>
      </head>
      <body className={inter.className}>
        <MetadataProvider>  {/* Zorg ervoor dat alles binnen de provider is */}
          {children}
        </MetadataProvider>
      </body>
    </html>
  );
}
