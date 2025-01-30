"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Menu, X } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-zinc-900/50 border-b border-zinc-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title - always visible */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-white font-bold">
              Subdomains for Hackclubbers
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-zinc-400 hover:text-white"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Desktop navigation - hidden on mobile */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link
              href="/dashboard"
              className="text-zinc-300 hover:text-white px-3 py-2"
            >
              Subdomains
            </Link>
            <Link
              href="/forwarding"
              className="text-zinc-300 hover:text-white px-3 py-2"
            >
              Email Forwarding
            </Link>
            <Link
              href="/inbox"
              className="text-zinc-300 hover:text-white px-3 py-2"
            >
              Inboxes (Beta)
            </Link>
            <Link
              href="/links"
              className="text-zinc-300 hover:text-white px-3 py-2"
            >
              Links (Beta)
            </Link>
            <Link
              href="/cdn"
              className="text-zinc-300 hover:text-white px-3 py-2"
            >
              CDN
            </Link>
          </div>
        </div>

        {/* Mobile menu - shown/hidden based on state */}
        <div
          className={`${
            isOpen ? "block" : "hidden"
          } md:hidden border-t border-zinc-800`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/domains"
              className="block text-zinc-300 hover:text-white px-3 py-2 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Domains
            </Link>
            <Link
              href="/forwarding"
              className="block text-zinc-300 hover:text-white px-3 py-2 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Email Forwarding
            </Link>
            <Link
              href="/inboxes"
              className="block text-zinc-300 hover:text-white px-3 py-2 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Inboxes (Beta)
            </Link>
            <Link
              href="/links"
              className="block text-zinc-300 hover:text-white px-3 py-2 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Links (Beta)
            </Link>
            <Link
              href="/cdn"
              className="block text-zinc-300 hover:text-white px-3 py-2 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              CDN
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
