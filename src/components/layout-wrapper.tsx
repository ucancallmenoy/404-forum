"use client";
import { usePathname } from "next/navigation";
import { useCategories } from "@/hooks/use-categories";
import ForumSidebar from "@/components/sidebar";
import { useEffect } from "react";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const { categories, setCategories, refreshCategories } = useCategories();
  
  // Listen for global category updates
  useEffect(() => {
    const handleCategoriesUpdate = (event: CustomEvent) => {
      setCategories(event.detail);
      // Also refresh to ensure we have the latest data
      refreshCategories();
    };

    window.addEventListener('categories-updated', handleCategoriesUpdate as EventListener);
    
    return () => {
      window.removeEventListener('categories-updated', handleCategoriesUpdate as EventListener);
    };
  }, [setCategories, refreshCategories]);
  
  const showSidebar =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/category") ||
    pathname.startsWith("/topic") ||
    pathname.startsWith("/profile");
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