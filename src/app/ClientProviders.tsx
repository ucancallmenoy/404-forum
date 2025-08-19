"use client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from "react";
import { AuthProvider } from "@/contexts/auth-context";
import { UserCacheProvider } from '@/contexts/user-cache-context';
import Header from "@/components/header";
import Footer from "@/components/footer";
import LayoutWrapper from "@/components/layout-wrapper";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserCacheProvider>
          <Header />
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
          <Footer />
        </UserCacheProvider>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}