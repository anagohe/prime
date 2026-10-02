import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✅ OJO: tu archivo se llama EXACTAMENTE "Nordhead Typeface Regular.otf"
const nordhead = localFont({
  src: "../fonts/Nordhead Typeface Regular.otf",
  variable: "--font-nordhead",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PrimeTeam",
  description: "PrimeTeam Mx",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={nordhead.variable}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}