import { useEffect } from "react";

/** Keep the game shell locked while the keyboard is open on mobile. */
export function useMobileGameViewport() {
  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    if (!media.matches) return;

    const root = document.documentElement;

    function lockWindowScroll() {
      if (window.scrollY !== 0) {
        window.scrollTo(0, 0);
      }
    }

    root.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    lockWindowScroll();

    window.addEventListener("scroll", lockWindowScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", lockWindowScroll);
      root.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);
}
