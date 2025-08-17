// src/components/Heartbeat.tsx
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export const Heartbeat = () => {
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/heartbeat`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch((err) => {
        console.error("Heartbeat error:", err);
      });
    }, 60000); // every 60 seconds

    return () => clearInterval(interval);
  }, [token]);

  return null;
};
