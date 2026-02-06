"use client";

import { useEffect, useRef } from "react";

const HEARTBEAT_INTERVAL = 30_000; // 30 seconds
const HEARTBEAT_URL = "/api/users/heartbeat";

function sendOfflineBeacon() {
  const blob = new Blob(
    [JSON.stringify({ offline: true })],
    { type: "application/json" }
  );
  navigator.sendBeacon(HEARTBEAT_URL, blob);
}

function sendOnline() {
  fetch(HEARTBEAT_URL, { method: "POST" }).catch(() => {});
}

export function usePresence(enabled = true) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Mark online immediately
    sendOnline();

    // Heartbeat every 30s
    intervalRef.current = setInterval(sendOnline, HEARTBEAT_INTERVAL);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        sendOfflineBeacon();
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        sendOnline();
        intervalRef.current = setInterval(sendOnline, HEARTBEAT_INTERVAL);
      }
    };

    const handleBeforeUnload = () => {
      sendOfflineBeacon();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      // Cleanup: mark offline when unmounting (navigating away from messages)
      sendOfflineBeacon();
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [enabled]);
}
