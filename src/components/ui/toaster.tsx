// Save this file as: @/components/ui/toaster.tsx

"use client"
import { AlertTriangle, CheckCircle, Info, X, XCircle } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ style, toastOptions, ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()
  
  return (
    <Sonner
      className="toaster group tracking-widest uppercase text-sm !font-bold"
      style={{
        "--normal-bg": "#065f46",
        "--normal-border": "#065f46",
        "--normal-text": "#ffffff",
        "--success-bg": "#065f46",
        "--success-border": "#065f46", 
        "--success-text": "#ffffff",
        "--error-bg": "#991b1b",
        "--error-border": "#991b1b",
        "--error-text": "#ffffff",
        "--warning-bg": "#d97706",
        "--warning-border": "#d97706",
        "--warning-text": "#ffffff",
        "--info-bg": "#0369a1",
        "--info-border": "#0369a1", 
        "--info-text": "#ffffff",
        ...style,
      } as React.CSSProperties}
      toastOptions={{
        classNames: {
          error: '!bg-red-900 !text-white font-bold uppercase tracking-wide',
          success: '!bg-green-900 !text-white font-bold uppercase tracking-wide',
          warning: '!bg-amber-600 !text-white font-bold uppercase tracking-wide',
          info: '!bg-[#bf3612] !text-white !border-blue-700 font-bold uppercase tracking-wide',
          default: 'bg-emerald-800 !text-white !border-0 font-bold uppercase tracking-wide',
        },
        ...toastOptions,
      }}
      {...props}
    />
  )
}

interface ElegantToastProps {
  title: string;
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  onClose: () => void;
}

export function ElegantToast({
  title,
  message,
  type = "info",
  duration = 3000,
  onClose,
}: ElegantToastProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: {
      icon: <CheckCircle className="text-green-600" size={22} />,
      border: "border-green-400/40",
    },
    error: {
      icon: <XCircle className="text-red-600" size={22} />,
      border: "border-red-400/40",
    },
    warning: {
      icon: <AlertTriangle className="text-yellow-600" size={22} />,
      border: "border-yellow-400/40",
    },
    info: {
      icon: <Info className="text-blue-600" size={22} />,
      border: "border-blue-400/40",
    },
  } as const;

  const style = styles[type];

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    (
      <div className="fixed inset-0 z-[9999] pointer-events-none">
        <div
          className={`
            absolute bottom-5 right-5 pointer-events-auto
            flex gap-3 items-start w-[340px]
            shadow-lg rounded-xl border ${style.border}
            bg-white/90 backdrop-blur-lg
            p-4 animate-slide-up
          `}
        >
          {style.icon}

          <div className="flex flex-col">
            <span className="font-semibold text-gray-900 text-sm">
              {title}
            </span>

            <span className="text-gray-600 text-xs leading-relaxed">
              {message}
            </span>
          </div>
        </div>
      </div>
    ),
    document.body
  );
}

export { Toaster }