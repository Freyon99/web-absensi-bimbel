export const SESSION_TIMEOUT_MS = 2 * 60 * 60 * 1000;
export const LAST_ACTIVITY_KEY = "lastActivityAt";
export const SESSION_UPDATED_EVENT = "session-updated";

export function getSessionToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function touchSession() {
  if (typeof window === "undefined") return;

  const token = localStorage.getItem("token");
  if (!token) return;

  localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
  document.cookie = `token=${token}; path=/; max-age=7200; SameSite=Strict;`;
  window.dispatchEvent(new Event(SESSION_UPDATED_EVENT));
}

export function clearSession() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem(LAST_ACTIVITY_KEY);
  document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict;";
  window.dispatchEvent(new Event(SESSION_UPDATED_EVENT));
}

export function getRemainingSessionTime() {
  if (typeof window === "undefined") return 0;

  const token = localStorage.getItem("token");
  if (!token) return 0;

  const lastActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY));
  if (!lastActivity) return SESSION_TIMEOUT_MS;

  return SESSION_TIMEOUT_MS - (Date.now() - lastActivity);
}
