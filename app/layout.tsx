import type { Metadata } from "next";
import { Spectral } from "next/font/google";
import "./globals.css";
import {ReactNode} from "react";

const spectral = Spectral({
  weight: '400',
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Movie Night",
  description: "For watchlists with friends!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spectral.className}`}>
        {children}
      </body>
    </html>
  );
}
