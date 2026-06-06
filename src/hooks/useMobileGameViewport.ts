import { useEffect } from "react";

/** Keep the game shell within the visible viewport and block page scroll on mobile. */
export function useMobileGameViewport() {
  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    if (!media.matches) return;

    const root = document.documentElement;
    const vv = window.visualViewport;

    function lockWindowScroll() {
      if (window.scrollY !== 0) {
        window.scrollTo(0, 0);
      }
    }

    function applyViewport() {
      if (!vv) return;
      root.style.setProperty("--visual-viewport-height", `${vv.height}px`);
      root.style.setProperty(
        "--visual-viewport-offset-top",
        `${vv.offsetTop}px`,
      );
      lockWindowScroll();
    }

    root.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    applyViewport();

    vv?.addEventListener("resize", applyViewport);
    vv?.addEventListener("scroll", applyViewport);
    window.addEventListener("scroll", lockWindowScroll, { passive: true });

    return () => {
      vv?.removeEventListener("resize", applyViewport);
      vv?.removeEventListener("scroll", applyViewport);
      window.removeEventListener("scroll", lockWindowScroll);
      root.style.removeProperty("--visual-viewport-height");
      root.style.removeProperty("--visual-viewport-offset-top");
      root.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);
}
