import { cn } from "@/lib/utils";

export function Logo({ className, showText = true, size = 32 }) {
  return (
    <div className={cn("flex items-center gap-2.5 select-none", className)} data-testid="clapclip-logo">
      <div
        className="relative grid place-items-center rounded-xl shrink-0"
        style={{
          width: size, height: size,
          background: "linear-gradient(135deg,#7C3AED 0%,#4F46E5 100%)",
          boxShadow: "0 6px 20px rgba(124,58,237,0.45)",
        }}
      >
        <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24" fill="none">
          <path d="M8 5.5v13l10-6.5-10-6.5z" fill="#fff" />
        </svg>
        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-violet-300" />
      </div>
      {showText && (
        <span className="font-display font-extrabold tracking-tight text-[1.35rem] leading-none text-white">
          Clap<span className="text-violet-400">Clip</span>
        </span>
      )}
    </div>
  );
}
