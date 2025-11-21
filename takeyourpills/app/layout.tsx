import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MsalProviderWrapper } from "@/components/providers/MsalProvider";
import { SessionProvider } from "@/components/auth/SessionProvider";
import { Header } from "@/components/layout/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TakeYourPills - Medication Tracking",
  description: "Track your medications with ease and never miss a dose",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MsalProviderWrapper>
          <SessionProvider>
            <Header />
            {children}
          </SessionProvider>
        </MsalProviderWrapper>
      </body>
    </html>
  );
}
