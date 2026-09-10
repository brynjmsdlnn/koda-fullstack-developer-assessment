import { createContext, useCallback, useContext, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'

type ToastVariant = 'success' | 'error'

interface ToastItem {
  id: number
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  notify: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const DISMISS_MS = 4000
const MAX_VISIBLE = 3

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const idRef = useRef(0)

  const notify = useCallback(
    (message: string, variant: ToastVariant = 'success') => {
      idRef.current += 1
      const id = idRef.current
      setToasts((prev) => [...prev, { id, message, variant }].slice(-MAX_VISIBLE))
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, DISMISS_MS)
    },
    [],
  )

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2"
      >
        {toasts.map((toast) => {
          const isSuccess = toast.variant === 'success'
          return (
            <div
              key={toast.id}
              role={isSuccess ? 'status' : 'alert'}
              className="flex items-start gap-2.5 rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 shadow-lg backdrop-blur-lg animate-in slide-in-from-bottom-2 fade-in duration-200"
            >
              {isSuccess ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--palm)]" />
              ) : (
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
              )}
              <p className="flex-1 text-sm font-medium text-[var(--sea-ink)]">
                {toast.message}
              </p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className="rounded-lg p-1 text-[var(--sea-ink-soft)] transition hover:bg-[var(--line)] hover:text-[var(--sea-ink)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
