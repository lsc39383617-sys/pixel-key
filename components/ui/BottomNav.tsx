"use client";

import type { ReactNode } from "react";

type NavItem = "home" | "explore" | "friends" | "profile";

type BottomNavProps = {
  active?: NavItem;
};

const navItems: Array<{ id: NavItem; label: string; icon: ReactNode }> = [
  {
    id: "home",
    label: "Home",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-[22px] w-[22px]" aria-hidden>
        <path
          d="M3 10.5L12 3l9 7.5V20a1.5 1.5 0 01-1.5 1.5H15v-6h-6v6H4.5A1.5 1.5 0 013 20v-9.5z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "explore",
    label: "Explore",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-[22px] w-[22px]" aria-hidden>
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.75" />
        <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "friends",
    label: "Friends",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-[22px] w-[22px]" aria-hidden>
        <circle cx="9" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.75" />
        <path
          d="M3 19c0-3 2.5-5 6-5s6 2 6 5M16 8.5a2.5 2.5 0 010 5M19 19c0-2-1.5-3.5-3.5-3.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "profile",
    label: "Profile",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-[22px] w-[22px]" aria-hidden>
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.75" />
        <path
          d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export function BottomNav({ active = "home" }: BottomNavProps) {
  return (
    <nav
      className="safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-stone-200/50 bg-white/75 backdrop-blur-2xl backdrop-saturate-150"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-md items-center justify-around px-3 pt-1.5">
        {navItems.map((item) => {
          const isActive = item.id === active;

          return (
            <button
              key={item.id}
              type="button"
              {...(isActive ? { "aria-current": "page" as const } : {})}
              className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-2 py-2 transition-colors ${
                isActive ? "text-stone-900" : "text-stone-400"
              }`}
            >
              {isActive ? (
                <span
                  className="absolute inset-x-2 inset-y-0 rounded-2xl bg-stone-100/80"
                  aria-hidden
                />
              ) : null}
              <span className={`relative ${isActive ? "scale-105" : ""}`}>
                {item.icon}
              </span>
              <span className="relative text-[10px] font-semibold tracking-wide">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
