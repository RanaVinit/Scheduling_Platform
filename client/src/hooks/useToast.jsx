import { useState, useCallback, useEffect, createContext, useContext } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { cn } from "../utils/helpers";

const ToastContext = createContext(null);

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be within ToastProvider");
    return ctx;
}

function ToastItem({ toast, onRemove }) {
    // Auto-dismiss after 4 seconds
    useEffect(() => {
        const t = setTimeout(onRemove, 4000);
        return () => clearTimeout(t);
    }, [onRemove]);

    return (
        <div className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-slide-in min-w-[300px]",
            toast.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
        )}>
            {toast.type === "success"
                ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                : <XCircle className="w-5 h-5 text-red-500 shrink-0" />
            }
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button onClick={onRemove} className="p-0.5 rounded hover:bg-black/5 cursor-pointer">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = "success") => {
        const id = Math.random().toString(36).slice(2);
        setToasts((prev) => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}
