"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            Support Tickets
          </Link>
          <div className="flex gap-4">
            <Link href="/">
              <Button 
                variant={pathname === "/" ? "default" : "ghost"}
              >
                All Tickets
              </Button>
            </Link>
            <Link href="/tickets/new">
              <Button 
                variant={pathname === "/tickets/new" ? "default" : "ghost"}
              >
                Create Ticket
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}