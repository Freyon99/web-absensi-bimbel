export const SESSION_TIMEOUT_MS = 2 * 60 * 60 * 1000;
export const LAST_ACTIVITY_KEY = "lastActivityAt";
export const SESSION_UPDATED_EVENT = "session-updated";

/**
 * Token sesi hanya hidup di cookie HttpOnly yang dipasang server.
 * Kunci "user" di localStorage dipakai hanya sebagai penanda "sedang login"
 * (untuk tampilan & pengalihan halaman), bukan sebagai kredensial.
 */
export function isLoggedIn() {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem("user"));
}

export function touchSession() {
  if (typeof window === "undefined") return;

  localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
  window.dispatchEvent(new Event(SESSION_UPDATED_EVENT));
}

export function clearSession() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem(LAST_ACTIVITY_KEY);
  window.dispatchEvent(new Event(SESSION_UPDATED_EVENT));
}

/** Memanggil endpoint logout server agar cookie HttpOnly ikut dihapus. */
export async function logout() {
  if (typeof window === "undefined") return;

  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    // jaringan gagal: tetap bersihkan sisi klien
  }

  clearSession();
  window.location.reload();
}

export function getRemainingSessionTime() {
  if (typeof window === "undefined") return 0;

  if (!isLoggedIn()) return 0;

  const lastActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY));
  if (!lastActivity) return SESSION_TIMEOUT_MS;

  return SESSION_TIMEOUT_MS - (Date.now() - lastActivity);
}
