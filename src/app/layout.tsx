import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { AuthProvider } from "@/contexts/auth-context";
import LayoutWrapper from "@/components/layout-wrapper";
import { UserCacheProvider } from '@/contexts/user-cache-context';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "404Forum",
  description: "A simple forum built with Next.js and Supabase",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/404.png" type="image/png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)]`}
      >
        <AuthProvider>
          <UserCacheProvider>
          <Header />
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
          <Footer />
          </UserCacheProvider>
        </AuthProvider>
      </body>
    </html>
  );
}