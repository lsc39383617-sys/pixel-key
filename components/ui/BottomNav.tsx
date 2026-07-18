"use client";

import { useRouter } from "next/navigation";

export function BottomNav() {
  const router = useRouter();

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const itemClass =
    "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-bold text-stone-400 transition hover:text-stone-900 active:scale-95";

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-white/65 bg-white/82 shadow-[0_-12px_36px_rgba(64,43,40,0.08)] backdrop-blur-2xl" aria-label="하단 메뉴">
      <div className="mx-auto flex max-w-md items-end px-2 pt-1.5">
        <button type="button" onClick={() => scrollTo("top")} className={`${itemClass} text-stone-900`}>
          <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none"><path d="M3 10.5L12 3l9 7.5V20a1.5 1.5 0 01-1.5 1.5H15v-6H9v6H4.5A1.5 1.5 0 013 20v-9.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
          홈
        </button>
        <button type="button" onClick={() => scrollTo("garden")} className={itemClass}>
          <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none"><path d="M12 21V10M12 13c-4.5 0-7-2.5-7-7 4.5 0 7 2.5 7 7zm0-2c4.5 0 7-2.5 7-7-4.5 0-7 2.5-7 7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          정원
        </button>
        <button type="button" onClick={() => router.push("/add")} className="relative -mt-5 flex w-[72px] shrink-0 flex-col items-center gap-1 text-[10px] font-black text-stone-700 active:scale-95">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border-[5px] border-[#fff7f1] bg-[linear-gradient(145deg,#ff718f,#ff9d66)] text-3xl font-light text-white shadow-[0_12px_26px_rgba(237,102,122,0.34)]">+</span>
          기록
        </button>
        <button type="button" onClick={() => scrollTo("memories")} className={itemClass}>
          <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none"><rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.8" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>
          피드
        </button>
        <button type="button" onClick={() => scrollTo("profile")} className={itemClass}>
          <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          프로필
        </button>
      </div>
    </nav>
  );
}
