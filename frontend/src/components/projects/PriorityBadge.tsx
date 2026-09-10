import { ArrowUp, ArrowRight, ArrowDown } from 'lucide-react'
import type { ProjectPriority } from '#/api/generated/models'

interface PriorityBadgeProps {
  priority: ProjectPriority | string
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const getStyle = () => {
    switch (priority) {
      case 'High':
        return {
          wrapper:
            'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30',
          icon: (
            <ArrowUp className="w-3 h-3 text-rose-600 dark:text-rose-400" />
          ),
        }
      case 'Medium':
        return {
          wrapper:
            'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
          icon: (
            <ArrowRight className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          ),
        }
      case 'Low':
        return {
          wrapper:
            'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30',
          icon: (
            <ArrowDown className="w-3 h-3 text-slate-500 dark:text-slate-400" />
          ),
        }
      default:
        return {
          wrapper:
            'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30',
          icon: null,
        }
    }
  }

  const { wrapper, icon } = getStyle()

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${wrapper}`}
    >
      {icon}
      {priority}
    </span>
  )
}

export default PriorityBadge
