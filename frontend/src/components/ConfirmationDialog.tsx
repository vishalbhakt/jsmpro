"use client"

import Modal from "@/components/Modal"
import { ReactNode } from "react"

interface ConfirmationDialogProps {
  /** Whether the dialog is visible */
  isOpen: boolean
  /** Title of the dialog */
  title: string
  /** Optional description or message */
  description?: string
  /** Label for the confirm button */
  confirmLabel?: string
  /** Label for the cancel button */
  cancelLabel?: string
  /** Callback when user confirms */
  onConfirm: () => void
  /** Callback when user cancels or closes */
  onCancel: () => void
  /** Optional icon to show */
  icon?: ReactNode
}

export default function ConfirmationDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  icon,
}: ConfirmationDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      {icon && <div className="mb-4 text-4xl text-[#d4af37] flex justify-center">{icon}</div>}
      {description && <p className="mb-6 text-base text-slate-600 dark:text-slate-400">{description}</p>}
      <div className="flex justify-end space-x-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-xl bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 rounded-xl bg-[#d4af37] text-[#001f3f] hover:bg-[#b8961e] transition-colors"
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
