import type { Metadata } from "next";
import { Newsreader, Manrope } from "next/font/google";
import "../styles/globals.css";
import Providers from "@/components/Providers";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "JSM Shiksha Academy | Production ERP",
  description: "Enterprise School Management System",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${newsreader.variable} ${manrope.variable} antialiased bg-pearl`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
