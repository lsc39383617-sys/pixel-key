import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-[1.25rem] bg-white/75 p-5 shadow-[0_2px_32px_-6px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] ring-1 ring-white/95 backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}
