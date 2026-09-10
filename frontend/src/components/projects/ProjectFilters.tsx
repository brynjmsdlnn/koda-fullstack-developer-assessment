import { Search, X, ArrowDownUp, RotateCcw } from 'lucide-react'
import type {
  ProjectsIndexSortBy,
  ProjectsIndexSortOrder,
} from '#/api/generated/models'

export interface FilterState {
  search: string
  status: string
  priority: string
  sortBy: NonNullable<ProjectsIndexSortBy>
  sortOrder: NonNullable<ProjectsIndexSortOrder>
}

interface ProjectFiltersProps {
  filters: FilterState
  onFilterChange: (filters: Partial<FilterState>) => void
  onReset: () => void
}

export function ProjectFilters({
  filters,
  onFilterChange,
  onReset,
}: ProjectFiltersProps) {
  const isFiltered =
    Boolean(filters.search) ||
    Boolean(filters.status) ||
    Boolean(filters.priority) ||
    filters.sortBy !== 'created_at' ||
    filters.sortOrder !== 'desc'

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 mb-6 shadow-sm">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--sea-ink-soft)] pointer-events-none" />
          <input
            type="text"
            placeholder="Search projects, clients, descriptions..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="w-full pl-10 pr-9 py-2 rounded-xl border border-[var(--line)] bg-[var(--foam)] text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)] transition"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
          {/* Status filter */}
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
            className="px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--foam)] text-sm text-[var(--sea-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)] transition cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="Planning">Planning</option>
            <option value="In Progress">In Progress</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Priority filter */}
          <select
            value={filters.priority}
            onChange={(e) => onFilterChange({ priority: e.target.value })}
            className="px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--foam)] text-sm text-[var(--sea-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)] transition cursor-pointer"
          >
            <option value="">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          {/* Sort By filter */}
          <select
            value={filters.sortBy}
            onChange={(e) =>
              onFilterChange({
                sortBy: e.target.value as NonNullable<ProjectsIndexSortBy>,
              })
            }
            className="px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--foam)] text-sm text-[var(--sea-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)] transition cursor-pointer"
          >
            <option value="created_at">Sort: Created</option>
            <option value="due_date">Sort: Due Date</option>
            <option value="start_date">Sort: Start Date</option>
            <option value="project_name">Sort: Project Name</option>
            <option value="client_name">Sort: Client Name</option>
          </select>

          {/* Sort direction toggle */}
          <button
            type="button"
            onClick={() =>
              onFilterChange({
                sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
              })
            }
            title={`Sort order: ${filters.sortOrder.toUpperCase()}`}
            className="p-2.5 rounded-xl border border-[var(--line)] bg-[var(--foam)] text-[var(--sea-ink)] hover:border-[var(--lagoon)] hover:text-[var(--lagoon-deep)] transition"
          >
            <ArrowDownUp className="w-4 h-4" />
          </button>

          {/* Reset button */}
          {isFiltered && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-300/40 bg-rose-500/10 text-rose-700 dark:text-rose-300 text-xs font-semibold hover:bg-rose-500/20 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProjectFilters
