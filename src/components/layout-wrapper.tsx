"use client";
import { usePathname } from "next/navigation";
import { useCategories } from "@/hooks/use-categories";
import ForumSidebar from "@/components/sidebar";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const { categories } = useCategories();
  
  const showSidebar =
  pathname.startsWith("/dashboard") ||
  pathname.startsWith("/category") ||
  pathname.startsWith("/topic");
  const hideOnAuth = pathname.startsWith("/auth/");

  if (hideOnAuth) {
    return <main className="flex-1">{children}</main>;
  }

  if (showSidebar) {
    return (
      <main className="flex flex-1">
        <ForumSidebar categories={categories} />
        <div className="flex-1">{children}</div>
      </main>
    );
  }

  return <main className="flex-1">{children}</main>;
}