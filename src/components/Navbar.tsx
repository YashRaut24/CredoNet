"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletConnect } from "./WalletConnect";
import { Award, ShieldCheck, Search } from "lucide-react";
import clsx from "clsx";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Award },
    { name: "Issuer Portal", href: "/issuer", icon: ShieldCheck },
    { name: "Verify", href: "/verify/search", icon: Search },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#212538] bg-[#090a10]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-500 transition-colors">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <span className="font-semibold text-base text-zinc-100 tracking-tight">
              SkillPassport
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "text-zinc-100 bg-[#1a1d2e] border border-[#2b3049]"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-[#141624]"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <WalletConnect />
        </div>
      </div>
    </header>
  );
}
