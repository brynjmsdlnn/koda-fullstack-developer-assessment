import { AlertTriangle, X } from 'lucide-react'
import type { ProjectResource } from '#/api/generated/models'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  project: ProjectResource | null
  isLoading?: boolean
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  project,
  isLoading = false,
}: DeleteConfirmModalProps) {
  if (!isOpen || !project) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl border border-[var(--line)] bg-[var(--header-bg)] p-6 shadow-2xl transition-all">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-[var(--sea-ink-soft)] hover:bg-[var(--line)] hover:text-[var(--sea-ink)] transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-4">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600 border border-rose-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--sea-ink)]">
              Delete Project
            </h3>
            <p className="text-xs text-[var(--sea-ink-soft)]">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <p className="text-sm text-[var(--sea-ink-soft)] mb-6">
          Are you sure you want to delete{' '}
          <strong className="text-[var(--sea-ink)]">
            {project.projectName}
          </strong>{' '}
          for client{' '}
          <strong className="text-[var(--sea-ink)]">
            {project.clientName}
          </strong>
          ?
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl border border-[var(--line)] text-sm font-semibold text-[var(--sea-ink)] hover:bg-[var(--line)] transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-5 py-2 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 disabled:opacity-50 transition shadow-sm"
          >
            {isLoading ? 'Deleting...' : 'Delete Project'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmModal
