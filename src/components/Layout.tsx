import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { START_GAME_PATH } from "../config/features";

const ACCOUNT_LINK = {
  to: "/create-account",
  label: "Create account",
} as const;

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: START_GAME_PATH, label: "Start game" },
  { to: "/how-to-play", label: "How to play" },
] as const;

function navLinkClass(active: boolean) {
  return `block px-4 py-3 font-spartan text-sm tracking-wide transition hover:bg-white/10 ${
    active ? "text-[#f5c542]" : "text-white/85"
  }`;
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-4 w-5" aria-hidden>
      <span
        className={`absolute left-0 h-0.5 w-5 rounded-full bg-white transition-all ${
          open ? "top-[7px] rotate-45" : "top-0"
        }`}
      />
      <span
        className={`absolute left-0 top-[7px] h-0.5 w-5 rounded-full bg-white transition-all ${
          open ? "opacity-0" : "opacity-100"
        }`}
      />
      <span
        className={`absolute left-0 h-0.5 w-5 rounded-full bg-white transition-all ${
          open ? "top-[7px] -rotate-45" : "top-[14px]"
        }`}
      />
    </span>
  );
}

function MobileNavMenu() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <div className="relative shrink-0 md:hidden">
      <button
        type="button"
        className="btn-icon px-3 py-2"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <MenuIcon open={open} />
      </button>

      {open && (
        <nav className="absolute top-[calc(100%+0.5rem)] right-0 z-20 min-w-[11rem] overflow-hidden rounded-2xl border border-white/10 bg-[#0a1628] shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
          <Link
            to={ACCOUNT_LINK.to}
            className={navLinkClass(location.pathname === ACCOUNT_LINK.to)}
          >
            {ACCOUNT_LINK.label}
          </Link>
          <div className="border-b border-white/10" aria-hidden />
          <div className="py-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={navLinkClass(location.pathname === link.to)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}

function AppNavbar({
  showBack,
  backTo = "/",
}: {
  showBack?: boolean;
  backTo?: string;
}) {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-[#0a1628]/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-lg items-center px-4 md:h-20 md:max-w-3xl md:px-10 lg:h-24">
        {showBack ? (
          <>
            <Link
              to={backTo}
              className="btn-link shrink-0 text-sm text-white/70 md:text-lg"
            >
              ← Back
            </Link>
            <Link
              to="/"
              className="flex-1 text-center font-display text-2xl uppercase tracking-wide text-white md:text-4xl lg:text-5xl"
            >
              Toopchi
            </Link>
            <MobileNavMenu />
            <span className="hidden w-20 shrink-0 md:block" aria-hidden />
          </>
        ) : (
          <>
            <Link
              to="/"
              className="font-display text-3xl uppercase tracking-wide text-white md:text-5xl lg:text-6xl"
            >
              Toopchi
            </Link>
            <nav className="ml-auto hidden items-center gap-1 md:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`rounded-xl px-4 py-2 font-spartan text-sm tracking-wide transition hover:bg-white/10 ${
                    location.pathname === link.to ? "text-[#f5c542]" : "text-white/75"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to={ACCOUNT_LINK.to}
                className={`ml-2 rounded-xl border border-white/15 px-4 py-2 font-spartan text-sm tracking-wide transition hover:bg-white/10 ${
                  location.pathname === ACCOUNT_LINK.to
                    ? "border-[#f5c542]/40 text-[#f5c542]"
                    : "text-white/75"
                }`}
              >
                {ACCOUNT_LINK.label}
              </Link>
            </nav>
            <div className="ml-auto md:hidden">
              <MobileNavMenu />
            </div>
          </>
        )}
      </div>
    </header>
  );
}

export function Layout({
  children,
  showBack,
  backTo = "/",
  contentClassName = "",
}: {
  children: ReactNode;
  showBack?: boolean;
  backTo?: string;
  contentClassName?: string;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <AppNavbar showBack={showBack} backTo={backTo} />
      <div
        className={`mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-6 md:max-w-3xl md:px-8 md:py-10 ${contentClassName}`.trim()}
      >
        {children}
      </div>
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  type = "button",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn-primary ${className}`.trim()}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  to,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  to?: string;
  className?: string;
}) {
  const classes = `btn-secondary ${className}`.trim();

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  disabled,
  className = "",
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn-ghost ${className}`.trim()}
    >
      {children}
    </button>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm md:p-7">
      {children}
    </div>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-5 w-5 shrink-0 opacity-70 md:h-6 md:w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function LockedButton({
  children,
  onClick,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`btn-locked ${className}`.trim()}
    >
      <LockIcon />
      {children}
    </button>
  );
}
