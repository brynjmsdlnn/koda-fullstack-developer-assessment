import { useState, useDeferredValue } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { FolderPlus, RefreshCw } from 'lucide-react'
import {
  useProjectsIndex,
  useProjectsStore,
  useProjectsUpdate,
  useProjectsDestroy,
  getProjectsIndexQueryKey,
} from '#/api/generated/endpoints'
import type {
  ProjectResource,
  StoreProjectRequest,
} from '#/api/generated/models'
import ProjectStats from '#/components/projects/ProjectStats'
import ProjectFilters from '#/components/projects/ProjectFilters'
import type { FilterState } from '#/components/projects/ProjectFilters'
import ProjectTable from '#/components/projects/ProjectTable'
import ProjectFormModal from '#/components/projects/ProjectFormModal'
import DeleteConfirmModal from '#/components/projects/DeleteConfirmModal'

export const Route = createFileRoute('/')({ component: DashboardPage })

function DashboardPage() {
  const queryClient = useQueryClient()

  // Filter & Search State
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    priority: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
  })

  // Defer search to prevent unnecessary spamming while typing
  const deferredSearch = useDeferredValue(filters.search)

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<ProjectResource | null>(
    null,
  )
  const [deletingProject, setDeletingProject] =
    useState<ProjectResource | null>(null)

  // Fetch Projects via Orval-generated hook
  const { data, isLoading, isFetching, refetch } = useProjectsIndex({
    search: deferredSearch || undefined,
    status: filters.status || undefined,
    priority: (filters.priority as any) || undefined,
    sort_by: filters.sortBy,
    sort_order: filters.sortOrder,
    all: true,
  })

  const projects = data?.data || []

  // Mutations
  const createMutation = useProjectsStore()
  const updateMutation = useProjectsUpdate()
  const deleteMutation = useProjectsDestroy()

  // Handlers
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: '',
      priority: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
    })
  }

  const handleFormSubmit = async (formData: StoreProjectRequest) => {
    if (editingProject) {
      await updateMutation.mutateAsync({
        project: editingProject.id,
        data: formData,
      })
    } else {
      await createMutation.mutateAsync({
        data: formData,
      })
    }
    // Invalidate query cache to refresh list
    await queryClient.invalidateQueries({
      queryKey: getProjectsIndexQueryKey(),
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deletingProject) return
    await deleteMutation.mutateAsync({ project: deletingProject.id })
    await queryClient.invalidateQueries({
      queryKey: getProjectsIndexQueryKey(),
    })
    setDeletingProject(null)
  }

  const isFiltered =
    Boolean(filters.search) ||
    Boolean(filters.status) ||
    Boolean(filters.priority) ||
    filters.sortBy !== 'created_at' ||
    filters.sortOrder !== 'desc'

  return (
    <main className="page-wrap px-4 pb-12 pt-8 sm:pt-10">
      {/* Top Header & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--sea-ink)]">
              Client Projects
            </h1>
            {isFetching && !isLoading && (
              <RefreshCw className="w-4 h-4 text-[var(--sea-ink-soft)] animate-spin" />
            )}
          </div>
          <p className="text-sm text-[var(--sea-ink-soft)] mt-1">
            Track client initiatives, manage priorities, and monitor project
            timelines.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh projects"
            className="p-2.5 rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] text-[var(--sea-ink)] hover:border-[var(--lagoon)] transition disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`}
            />
          </button>

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--lagoon-deep)] text-white text-sm font-semibold hover:opacity-90 shadow-sm transition"
          >
            <FolderPlus className="w-4 h-4" />
            New Project
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <ProjectStats projects={projects} />

      {/* Filter and Search Bar */}
      <ProjectFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Main Project Table & Cards */}
      <ProjectTable
        projects={projects}
        isLoading={isLoading}
        onEdit={(p) => setEditingProject(p)}
        onDelete={(p) => setDeletingProject(p)}
        onCreateClick={() => setIsCreateOpen(true)}
        isFiltered={isFiltered}
      />

      {/* Project Form Modal (Create & Edit) */}
      <ProjectFormModal
        isOpen={isCreateOpen || Boolean(editingProject)}
        onClose={() => {
          setIsCreateOpen(false)
          setEditingProject(null)
        }}
        onSubmit={handleFormSubmit}
        project={editingProject}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingProject)}
        onClose={() => setDeletingProject(null)}
        onConfirm={handleDeleteConfirm}
        project={deletingProject}
        isLoading={deleteMutation.isPending}
      />
    </main>
  )
}
