import { Edit2, Trash2, FolderPlus, Inbox } from 'lucide-react'
import type { ProjectResource } from '#/api/generated/models'
import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'

interface ProjectTableProps {
  projects: ProjectResource[]
  isLoading: boolean
  onEdit: (project: ProjectResource) => void
  onDelete: (project: ProjectResource) => void
  onCreateClick: () => void
  isFiltered?: boolean
}

export function ProjectTable({
  projects,
  isLoading,
  onEdit,
  onDelete,
  onCreateClick,
  isFiltered = false,
}: ProjectTableProps) {
  const formatDate = (dateString?: string | null) => {
    if (!dateString)
      return <span className="text-[var(--sea-ink-soft)]/50 italic">None</span>
    try {
      // Avoid time-zone shifting by splitting YYYY-MM-DD
      const [year, month, day] = dateString.split('-')
      if (!year || !month || !day) return dateString
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-6 shadow-sm">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="animate-pulse flex items-center justify-between py-3 border-b border-[var(--line)]/40 last:border-0"
            >
              <div className="space-y-2">
                <div className="h-4 bg-[var(--line)] rounded-md w-48" />
                <div className="h-3 bg-[var(--line)]/60 rounded-md w-32" />
              </div>
              <div className="h-6 bg-[var(--line)]/60 rounded-full w-24" />
              <div className="h-6 bg-[var(--line)]/60 rounded-full w-20" />
              <div className="h-4 bg-[var(--line)]/60 rounded-md w-28" />
              <div className="h-8 bg-[var(--line)]/60 rounded-xl w-16" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-[var(--line)] bg-[var(--surface-strong)] p-12 text-center shadow-sm">
        <div className="inline-flex p-4 rounded-3xl bg-[var(--foam)] text-[var(--sea-ink-soft)] mb-4 border border-[var(--line)]">
          <Inbox className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-[var(--sea-ink)] mb-1">
          {isFiltered ? 'No matching projects found' : 'No projects yet'}
        </h3>
        <p className="text-sm text-[var(--sea-ink-soft)] max-w-md mx-auto mb-6">
          {isFiltered
            ? 'Try adjusting your search terms, status filters, or sorting options.'
            : 'Get started by creating your first client project to track progress, timelines, and priorities.'}
        </p>
        {!isFiltered && (
          <button
            onClick={onCreateClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--lagoon-deep)] text-white text-sm font-semibold hover:opacity-95 shadow-sm transition"
          >
            <FolderPlus className="w-4 h-4" />
            Add First Project
          </button>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Desktop Table View */}
      <div className="hidden md:block rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--line)] bg-[var(--foam)]/50 text-xs font-semibold text-[var(--sea-ink-soft)] uppercase tracking-wider">
                <th className="py-3.5 px-5">Project & Client</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Priority</th>
                <th className="py-3.5 px-5">Timeline</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]/60 text-sm">
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="hover:bg-[var(--foam)]/60 transition group"
                >
                  {/* Project & Client */}
                  <td className="py-4 px-5">
                    <div className="font-semibold text-[var(--sea-ink)] group-hover:text-[var(--lagoon-deep)] transition">
                      {project.projectName}
                    </div>
                    <div className="text-xs text-[var(--sea-ink-soft)] font-medium mt-0.5">
                      {project.clientName}
                    </div>
                    {project.description && (
                      <p className="text-xs text-[var(--sea-ink-soft)]/80 mt-1 line-clamp-1 max-w-sm">
                        {project.description}
                      </p>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    <StatusBadge status={project.status} />
                  </td>

                  {/* Priority */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    <PriorityBadge priority={project.priority} />
                  </td>

                  {/* Dates */}
                  <td className="py-4 px-5 whitespace-nowrap text-xs text-[var(--sea-ink-soft)]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-[var(--sea-ink)]">
                        Start:
                      </span>
                      {formatDate(project.startDate)}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-medium text-[var(--sea-ink)]">
                        Due:
                      </span>
                      {formatDate(project.dueDate)}
                    </div>
                  </td>

                  {/* Action buttons */}
                  <td className="py-4 px-5 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEdit(project)}
                        title="Edit Project"
                        className="p-2 rounded-xl border border-[var(--line)] bg-[var(--foam)] text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] hover:border-[var(--lagoon)] transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(project)}
                        title="Delete Project"
                        className="p-2 rounded-xl border border-rose-200/50 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 hover:text-rose-700 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards View */}
      <div className="md:hidden space-y-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-semibold text-base text-[var(--sea-ink)]">
                  {project.projectName}
                </h4>
                <p className="text-xs text-[var(--sea-ink-soft)] font-medium">
                  {project.clientName}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onEdit(project)}
                  className="p-1.5 rounded-lg border border-[var(--line)] text-[var(--sea-ink-soft)]"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(project)}
                  className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {project.description && (
              <p className="text-xs text-[var(--sea-ink-soft)] line-clamp-2">
                {project.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[var(--line)]/40">
              <StatusBadge status={project.status} />
              <PriorityBadge priority={project.priority} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-[var(--sea-ink-soft)] pt-1 bg-[var(--foam)]/60 p-2.5 rounded-xl">
              <div>
                <span className="block font-medium text-[var(--sea-ink)]">
                  Start Date
                </span>
                {formatDate(project.startDate)}
              </div>
              <div>
                <span className="block font-medium text-[var(--sea-ink)]">
                  Due Date
                </span>
                {formatDate(project.dueDate)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProjectTable
