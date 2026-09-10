import type { ProjectStatus } from '#/api/generated/models'

interface StatusBadgeProps {
  status: ProjectStatus | string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getBadgeStyle = () => {
    switch (status) {
      case 'In Progress':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
      case 'Planning':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30'
      case 'On Hold':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30'
      case 'Completed':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
      default:
        return 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30'
    }
  }

  const getDotStyle = () => {
    switch (status) {
      case 'In Progress':
        return 'bg-amber-500'
      case 'Planning':
        return 'bg-blue-500'
      case 'On Hold':
        return 'bg-purple-500'
      case 'Completed':
        return 'bg-emerald-500'
      default:
        return 'bg-slate-400'
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getBadgeStyle()}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${getDotStyle()}`} />
      {status}
    </span>
  )
}

export default StatusBadge
