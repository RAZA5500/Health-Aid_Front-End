"use client";

import { createContext, useContext } from "react";

interface MobileNavContextValue {
  openMenu: () => void;
}

export const MobileNavContext = createContext<MobileNavContextValue | null>(null);

export function useMobileNav() {
  return useContext(MobileNavContext);
}
