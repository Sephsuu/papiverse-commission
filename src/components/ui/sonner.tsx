"use client"

import { CircleX } from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export function ToastError({ message }: { message: string }) {
  return(
    <span className="flex justify-between items-center gap-1 text-red-800">
      <CircleX className="w-5 h-5 text-red-800" />
      {String(message)}
    </span>
  );
}

export { Toaster }
