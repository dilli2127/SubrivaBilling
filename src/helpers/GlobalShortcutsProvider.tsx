import React from "react";
import { useGlobalShortcuts } from "./useGlobalShortcuts";

const GlobalShortcutsProvider: React.FC = () => {
  useGlobalShortcuts();
  return null;
};

export default GlobalShortcutsProvider; 