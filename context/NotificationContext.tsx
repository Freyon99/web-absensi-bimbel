"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface NotificationType {
  show: boolean;
  title: string;
  message: string;
  isSuccess: boolean;
  isConfirmLogout?: boolean;
  onConfirm?: () => void;
}

interface NotificationContextType {
  showNotification: (title: string, message: string, isSuccess?: boolean) => void;
  showConfirmLogout: (title: string, message: string, onConfirm: () => void) => void;
  hideNotification: () => void;
  setIsLoadingGlobal: (loading: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notif, setNotif] = useState<NotificationType>({
    show: false, title: "", message: "", isSuccess: false
  });
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(false);

  const showNotification = (title: string, message: string, isSuccess = true) => {
    setNotif({ show: true, title, message, isSuccess, isConfirmLogout: false });
  };

  const showConfirmLogout = (title: string, message: string, onConfirm: () => void) => {
    setNotif({ show: true, title, message, isSuccess: false, isConfirmLogout: true, onConfirm });
  };

  const hideNotification = () => {
    setNotif((prev) => ({ ...prev, show: false }));
  };

  return (
    <NotificationContext.Provider value={{ showNotification, showConfirmLogout, hideNotification, setIsLoadingGlobal }}>
      {/* Bungkus halaman utama agar otomatis blur kalau lagi loading atau ada popup */}
      <div className={isLoadingGlobal || notif.show ? "blur-sm pointer-events-none transition-all duration-300" : "transition-all duration-300"}>
        {children}
      </div>

      {/* TAMPILAN LOADING MEMUAT SESI GLOBAL */}
      {isLoadingGlobal && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/10 backdrop-blur-sm">
          <div className="rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 flex flex-col items-center gap-4 max-w-xs w-full text-center">
            {/* Spinner Lingkaran Berputar */}
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#0F3D8C]"></div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">Memuat Sesi...</h4>
              <p className="text-xs text-gray-400 mt-0.5">Harap tunggu sebentar</p>
            </div>
          </div>
        </div>
      )}

      {/* TAMPILAN POPUP NOTIFIKASI / LOGOUT GLOBAL */}
      {notif.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl border border-gray-100">
            <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl font-bold ${
              notif.isConfirmLogout ? "bg-red-100 text-red-600" : notif.isSuccess ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
            }`}>
              {notif.isConfirmLogout ? "!" : notif.isSuccess ? "✓" : "!"}
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1">{notif.title}</h3>
            <p className="text-sm text-gray-500 mb-5">{notif.message}</p>

            {notif.isConfirmLogout ? (
              <div className="flex gap-3">
                <button onClick={hideNotification} className="flex-1 rounded-xl bg-gray-100 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition">Batal</button>
                <button onClick={() => { hideNotification(); notif.onConfirm?.(); }} className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition">Ya, Keluar</button>
              </div>
            ) : (
              <button onClick={hideNotification} className={`w-full rounded-xl py-2.5 text-sm font-semibold text-white transition ${notif.isSuccess ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}`}>
                Tutup Jendela
              </button>
            )}
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotification harus dibungkus di dalam NotificationProvider");
  return context;
}
