"use client"

import { RiCheckboxCircleFill, RiErrorWarningFill, RiCloseLine } from "@remixicon/react"

interface AlertProps {
  type: "success" | "error" | "warning" | "info"
  message: string
  onClose?: () => void
}

export function Alert({ type, message, onClose }: AlertProps) {
  const styles = {
    success: "bg-green-50 border-green-500 text-green-800",
    error: "bg-red-50 border-red-500 text-red-800",
    warning: "bg-yellow-50 border-yellow-500 text-yellow-800",
    info: "bg-blue-50 border-blue-500 text-blue-800",
  }

  const icons = {
    success: <RiCheckboxCircleFill className="w-5 h-5 text-green-500" />,
    error: <RiErrorWarningFill className="w-5 h-5 text-red-500" />,
    warning: <RiErrorWarningFill className="w-5 h-5 text-yellow-500" />,
    info: <RiErrorWarningFill className="w-5 h-5 text-blue-500" />,
  }

  return (
      <div
          className={`flex items-center gap-3 p-4 mb-4 border-l-4 rounded ${styles[type]}`}
          role="alert"
      >
        {icons[type]}
        <p className="flex-1 text-sm font-medium">{message}</p>
        {onClose && (
            <button
                onClick={onClose}
                className="hover:opacity-70 transition"
                aria-label="Close"
            >
              <RiCloseLine className="w-5 h-5" />
            </button>
        )}
      </div>
  )
}