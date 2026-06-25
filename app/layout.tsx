import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/main.scss";
import NotifyContainer from '@/components/NotifyContainer';


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Voice Pay Guard",
  description: "VoiceGuard Pay enables secure multilingual voice payments with real-time AI fraud detection.",
  icons: {
    icon: "/images/logo.svg",
    shortcut: "/images/logo.svg",
    apple: "/images/logo.svg",
  },
  openGraph: {
    title: "Voice Pay Guard",
    description: "VoiceGuard Pay enables secure multilingual voice payments with real-time AI fraud detection.",
    images: ["/images/logo.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Voice Pay Guard",
    description: "VoiceGuard Pay enables secure multilingual voice payments with real-time AI fraud detection.",
    images: ["/images/logo.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children} <NotifyContainer /></body>
    </html>
  );
}
