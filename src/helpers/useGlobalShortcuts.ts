// hooks/useGlobalShortcuts.ts
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function useGlobalShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        navigate("/retaill_billing"); // Updated to retail billing route
      }
      // Add more shortcuts here if needed
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);
}
