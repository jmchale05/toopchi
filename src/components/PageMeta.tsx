import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { applyPageMeta } from "../lib/seo";

export function PageMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    applyPageMeta(pathname);
  }, [pathname]);

  return null;
}
