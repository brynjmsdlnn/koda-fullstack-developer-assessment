import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { X, AlertCircle } from 'lucide-react'
import type {
  ProjectResource,
  ProjectStatus,
  ProjectPriority,
  StoreProjectRequest,
} from '#/api/generated/models'

interface ProjectFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: StoreProjectRequest) => Promise<void>
  project?: ProjectResource | null
  isLoading?: boolean
}

export function ProjectFormModal({
  isOpen,
  onClose,
  onSubmit,
  project,
  isLoading = false,
}: ProjectFormModalProps) {
  const isEditing = Boolean(project)

  const [formData, setFormData] = useState<{
    clientName: string
    projectName: string
    description: string
    status: ProjectStatus
    priority: ProjectPriority
    startDate: string
    dueDate: string
  }>({
    clientName: '',
    projectName: '',
    description: '',
    status: 'Planning' as ProjectStatus,
    priority: 'Medium' as ProjectPriority,
    startDate: '',
    dueDate: '',
  })

  const [clientErrors, setClientErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)

  useEffect(() => {
    if (project) {
      setFormData({
        clientName: project.clientName || '',
        projectName: project.projectName || '',
        description: project.description || '',
        status: project.status as ProjectStatus,
        priority: project.priority as ProjectPriority,
        startDate: project.startDate || '',
        dueDate: project.dueDate || '',
      })
    } else {
      setFormData({
        clientName: '',
        projectName: '',
        description: '',
        status: 'Planning' as ProjectStatus,
        priority: 'Medium' as ProjectPriority,
        startDate: '',
        dueDate: '',
      })
    }
    setClientErrors({})
    setServerError(null)
  }, [project, isOpen])

  if (!isOpen) return null

  const validate = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.clientName.trim()) {
      errors.clientName = 'Client Name is required.'
    }

    if (!formData.projectName.trim()) {
      errors.projectName = 'Project Name is required.'
    }

    if (formData.startDate && formData.dueDate) {
      if (formData.dueDate < formData.startDate) {
        errors.dueDate = 'Due Date cannot be earlier than Start Date.'
      }
    }

    setClientErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setServerError(null)

    if (!validate()) {
      return
    }

    try {
      await onSubmit({
        client_name: formData.clientName.trim(),
        project_name: formData.projectName.trim(),
        description: formData.description.trim() || null,
        status: formData.status,
        priority: formData.priority,
        start_date: formData.startDate || null,
        due_date: formData.dueDate || null,
      })
      onClose()
    } catch (err: any) {
      if (err?.response?.data?.message) {
        setServerError(err.response.data.message)
        if (err.response.data.errors) {
          const apiErrors: Record<string, string> = {}
          for (const [key, msgs] of Object.entries(
            err.response.data.errors as Record<string, string[]>,
          )) {
            // Map snake_case to camelCase
            const mappedKey =
              key === 'client_name'
                ? 'clientName'
                : key === 'project_name'
                  ? 'projectName'
                  : key === 'start_date'
                    ? 'startDate'
                    : key === 'due_date'
                      ? 'dueDate'
                      : key
            apiErrors[mappedKey] = msgs[0]
          }
          setClientErrors((prev) => ({ ...prev, ...apiErrors }))
        }
      } else {
        setServerError(
          'An unexpected error occurred. Please check your connection and try again.',
        )
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-[var(--line)] bg-[var(--header-bg)] p-6 shadow-2xl transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--line)]">
          <div>
            <h2 className="text-xl font-bold text-[var(--sea-ink)]">
              {isEditing ? 'Edit Project' : 'Create New Project'}
            </h2>
            <p className="text-xs text-[var(--sea-ink-soft)] mt-0.5">
              {isEditing
                ? 'Update project details and timeline.'
                : 'Fill in the details to track a new client project.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-[var(--sea-ink-soft)] hover:bg-[var(--line)] hover:text-[var(--sea-ink)] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Server Error Alert */}
        {serverError && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Client Name */}
            <div>
              <label className="block text-xs font-semibold text-[var(--sea-ink)] uppercase tracking-wider mb-1">
                Client Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.clientName}
                onChange={(e) => {
                  setFormData({ ...formData, clientName: e.target.value })
                  if (clientErrors.clientName)
                    setClientErrors({ ...clientErrors, clientName: '' })
                }}
                placeholder="e.g. Acme Corporation"
                className={`w-full px-3.5 py-2 rounded-xl border ${
                  clientErrors.clientName
                    ? 'border-rose-500 focus:ring-rose-500'
                    : 'border-[var(--line)] focus:ring-[var(--lagoon)]'
                } bg-[var(--foam)] text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)] focus:outline-none focus:ring-2`}
              />
              {clientErrors.clientName && (
                <p className="mt-1 text-xs text-rose-600 font-medium">
                  {clientErrors.clientName}
                </p>
              )}
            </div>

            {/* Project Name */}
            <div>
              <label className="block text-xs font-semibold text-[var(--sea-ink)] uppercase tracking-wider mb-1">
                Project Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.projectName}
                onChange={(e) => {
                  setFormData({ ...formData, projectName: e.target.value })
                  if (clientErrors.projectName)
                    setClientErrors({ ...clientErrors, projectName: '' })
                }}
                placeholder="e.g. Website Redesign"
                className={`w-full px-3.5 py-2 rounded-xl border ${
                  clientErrors.projectName
                    ? 'border-rose-500 focus:ring-rose-500'
                    : 'border-[var(--line)] focus:ring-[var(--lagoon)]'
                } bg-[var(--foam)] text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)] focus:outline-none focus:ring-2`}
              />
              {clientErrors.projectName && (
                <p className="mt-1 text-xs text-rose-600 font-medium">
                  {clientErrors.projectName}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[var(--sea-ink)] uppercase tracking-wider mb-1">
              Description{' '}
              <span className="text-xs text-[var(--sea-ink-soft)] lowercase font-normal">
                (optional)
              </span>
            </label>
            <textarea
              rows={2}
              value={formData.description || ''}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Brief summary of project scope, objectives, or milestones..."
              className="w-full px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--foam)] text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)]"
            />
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--sea-ink)] uppercase tracking-wider mb-1">
                Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as ProjectStatus,
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--foam)] text-sm text-[var(--sea-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)] cursor-pointer"
              >
                <option value="Planning">Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--sea-ink)] uppercase tracking-wider mb-1">
                Priority <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as ProjectPriority,
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--foam)] text-sm text-[var(--sea-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)] cursor-pointer"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          {/* Start Date & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--sea-ink)] uppercase tracking-wider mb-1">
                Start Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.startDate || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, startDate: e.target.value })
                    if (clientErrors.dueDate)
                      setClientErrors({ ...clientErrors, dueDate: '' })
                  }}
                  className="w-full px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--foam)] text-sm text-[var(--sea-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--sea-ink)] uppercase tracking-wider mb-1">
                Due Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.dueDate || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, dueDate: e.target.value })
                    if (clientErrors.dueDate)
                      setClientErrors({ ...clientErrors, dueDate: '' })
                  }}
                  className={`w-full px-3.5 py-2 rounded-xl border ${
                    clientErrors.dueDate
                      ? 'border-rose-500 focus:ring-rose-500'
                      : 'border-[var(--line)] focus:ring-[var(--lagoon)]'
                  } bg-[var(--foam)] text-sm text-[var(--sea-ink)] focus:outline-none focus:ring-2`}
                />
              </div>
              {clientErrors.dueDate && (
                <p className="mt-1 text-xs text-rose-600 font-medium">
                  {clientErrors.dueDate}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--line)]">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl border border-[var(--line)] text-sm font-semibold text-[var(--sea-ink)] hover:bg-[var(--line)] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-[var(--lagoon-deep)] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition shadow-sm"
            >
              {isLoading
                ? 'Saving...'
                : isEditing
                  ? 'Update Project'
                  : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProjectFormModal
