"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number; // ms
}

interface ToastContextProps {
  showToast: (msg: Omit<ToastMessage, "id">) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

/** Utility to generate short unique IDs */
const genId = () => Math.random().toString(36).substring(2, 9);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((msg: Omit<ToastMessage, "id">) => {
    const id = genId();
    const toast: ToastMessage = { id, ...msg };
    setToasts((prev) => [...prev, toast]);
    const timeout = msg.duration ?? 4000;
    setTimeout(() => removeToast(id), timeout);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed inset-0 flex items-end justify-end p-6 pointer-events-none z-50">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: 20 }}
              transition={{ duration: 0.2 }}
              className="max-w-xs w-full mb-4 pointer-events-auto"
            >
              <div
                className={`rounded-xl shadow-lg p-4 ${
                  toast.type === "success"
                    ? "bg-green-600 text-white"
                    : toast.type === "error"
                    ? "bg-red-600 text-white"
                    : toast.type === "warning"
                    ? "bg-amber-600 text-white"
                    : "bg-slate-800 text-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-lg">{toast.title}</h4>
                  <button
                    onClick={() => removeToast(toast.id)}
                    className="ml-2 text-sm opacity-70 hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
                {toast.description && (
                  <p className="mt-1 text-sm opacity-90">{toast.description}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

/** Hook to trigger toasts anywhere in the app */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx.showToast;
}

/** Simple wrapper component for convenience */
export function Toast({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
