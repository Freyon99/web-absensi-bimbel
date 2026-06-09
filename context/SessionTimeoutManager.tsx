"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  clearSession,
  getRemainingSessionTime,
  getSessionToken,
  LAST_ACTIVITY_KEY,
  SESSION_UPDATED_EVENT,
  touchSession,
} from "@/lib/session";

const ACTIVITY_THROTTLE_MS = 30 * 1000;
const ACTIVITY_EVENTS = [
  "click",
  "keydown",
  "mousemove",
  "scroll",
  "touchstart",
] as const;

export function SessionTimeoutManager() {
  const router = useRouter();

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let lastRecordedActivity = 0;

    const logoutBecauseIdle = () => {
      clearSession();
      router.replace("/");
      router.refresh();
    };

    const scheduleLogout = () => {
      if (timeoutId) clearTimeout(timeoutId);

      if (!getSessionToken()) return;

      if (!localStorage.getItem(LAST_ACTIVITY_KEY)) {
        touchSession();
      }

      const remainingTime = getRemainingSessionTime();
      if (remainingTime <= 0) {
        logoutBecauseIdle();
        return;
      }

      timeoutId = setTimeout(logoutBecauseIdle, remainingTime);
    };

    const handleActivity = () => {
      if (!getSessionToken()) return;
      if (getRemainingSessionTime() <= 0) {
        logoutBecauseIdle();
        return;
      }

      const now = Date.now();
      if (now - lastRecordedActivity < ACTIVITY_THROTTLE_MS) return;

      lastRecordedActivity = now;
      touchSession();
      scheduleLogout();
    };

    scheduleLogout();

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true });
    });

    window.addEventListener("storage", scheduleLogout);
    window.addEventListener("focus", scheduleLogout);
    window.addEventListener(SESSION_UPDATED_EVENT, scheduleLogout);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);

      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });

      window.removeEventListener("storage", scheduleLogout);
      window.removeEventListener("focus", scheduleLogout);
      window.removeEventListener(SESSION_UPDATED_EVENT, scheduleLogout);
    };
  }, [router]);

  return null;
}
