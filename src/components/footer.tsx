"use client";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const hideOnAuth = pathname.startsWith("/auth/");
  if (hideOnAuth) return null;

  return (
    <footer className="w-full bg-gray-100 text-center p-4 text-gray-500 mt-auto">
      &copy; {new Date().getFullYear()} 404Forum. All rights reserved.
    </footer>
  );
}