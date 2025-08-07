"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useUserProfile } from "@/hooks/use-user-profile";
import { Home } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const hideOnAuth = pathname.startsWith("/auth/");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { profile: userProfile } = useUserProfile(user?.id);
  const profilePic = userProfile?.profile_picture;
  const [homeHovered, setHomeHovered] = useState(false);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  if (hideOnAuth) return null;

  return (
    <header className="w-full bg-transparent border-b border-[var(--border)] p-4 flex justify-between items-center">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 hover:no-underline"
        style={{ textDecoration: "none" }}
      >
        <Image src="/404.png" alt="404Forum Logo" width={40} height={40} /> 404Forum
      </Link>
      <nav className="flex gap-4 items-center">
      <div className="relative">
        <Link
          href="/dashboard"
          className="p-2 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center"
          onMouseEnter={() => setHomeHovered(true)}
          onMouseLeave={() => setHomeHovered(false)}
          aria-label="Go to homepage"
        >
          <Home className="w-6 h-6 text-[var(--foreground)]" />
        </Link>
        {homeHovered && (
          <span
            className="absolute right-0 top-full mt-2 px-3 py-2 text-xs bg-black text-white rounded-lg shadow-lg z-10 border border-gray-200 pointer-events-none min-w-[120px] max-w-[180px] whitespace-nowrap"
          >
            <span className="block w-full text-center">Go to homepage</span>
            <span
              className="absolute right-4 -top-2 w-0 h-0"
              style={{
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderBottom: '8px solid black',
              }}
            />
          </span>
        )}
      </div>
        <div className="relative" ref={dropdownRef}>
          <button
            className="p-2 rounded-full hover:bg-gray-100 cursor-pointer transition-colors relative"
            onClick={() => setDropdownOpen((open) => !open)}
            aria-label="Profile menu"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {profilePic ? (
              <Image
                src={profilePic}
                alt="Profile"
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
            ) : (
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-300 text-gray-700 font-bold text-lg">
                {(userProfile?.first_name?.[0] || userProfile?.email?.[0] || "U").toUpperCase()}
              </span>
            )}
            {hovered && (
              <span
                className="absolute right-0 top-full mt-2 px-3 py-2 text-xs bg-black text-white rounded-lg shadow-lg z-10 border border-gray-200 pointer-events-none min-w-[120px] max-w-[180px] whitespace-nowrap"
              >
                <span className="block w-full text-center">Open profile menu</span>
                <span
                  className="absolute right-4 -top-2 w-0 h-0"
                  style={{
                    borderLeft: '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderBottom: '8px solid black',
                  }}
                />
              </span>
            )}
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              {user && (
                <Link
                  href={`/profile?id=${user.id}`}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  style={{ textDecoration: "none" }}
                  onClick={() => setDropdownOpen(false)}
                >
                  Profile
                </Link>
              )}
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  signOut();
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}