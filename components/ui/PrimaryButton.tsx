import type { ButtonHTMLAttributes, ReactNode } from "react";

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function PrimaryButton({
  children,
  className = "",
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      type="button"
      className={`relative w-full overflow-hidden rounded-[1.25rem] bg-stone-900 px-6 py-[1.125rem] text-[17px] font-semibold tracking-tight text-white shadow-[0_8px_32px_-8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-200 hover:bg-stone-800 hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.15)] active:scale-[0.98] active:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.3)] ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
