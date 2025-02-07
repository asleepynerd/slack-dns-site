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
import {
  User,
  Key,
  Settings,
  LogOut,
  Menu,
  X,
  MessageSquare,
} from "lucide-react";

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

            {/* Add Profile Dropdown */}
            {session && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={session.user?.image || ""}
                        alt={session.user?.name || ""}
                      />
                      <AvatarFallback>{session.user?.name?.[0]}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session.user?.name}
                      </p>
                      <p className="text-xs leading-none text-zinc-400">
                        {session.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/feedback" className="cursor-pointer">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span>Feedback</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-500 focus:text-red-500 cursor-pointer"
                    onClick={() => signOut()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
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
