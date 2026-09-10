import {
  FolderKanban,
  Activity,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'
import type { ProjectResource } from '#/api/generated/models'

interface ProjectStatsProps {
  projects: ProjectResource[]
}

export function ProjectStats({ projects }: ProjectStatsProps) {
  const total = projects.length
  const inProgress = projects.filter((p) => p.status === 'In Progress').length
  const highPriority = projects.filter((p) => p.priority === 'High').length
  const completed = projects.filter((p) => p.status === 'Completed').length

  const stats = [
    {
      label: 'Total Projects',
      value: total,
      icon: (
        <FolderKanban className="w-5 h-5 text-teal-600 dark:text-teal-400" />
      ),
      bgColor: 'bg-teal-500/10',
    },
    {
      label: 'In Progress',
      value: inProgress,
      icon: <Activity className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      bgColor: 'bg-amber-500/10',
    },
    {
      label: 'High Priority',
      value: highPriority,
      icon: (
        <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
      ),
      bgColor: 'bg-rose-500/10',
    },
    {
      label: 'Completed',
      value: completed,
      icon: (
        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
      ),
      bgColor: 'bg-emerald-500/10',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 shadow-sm flex items-center gap-4 transition hover:border-[var(--lagoon)]"
        >
          <div className={`p-3 rounded-xl ${stat.bgColor}`}>{stat.icon}</div>
          <div>
            <p className="text-xs font-medium text-[var(--sea-ink-soft)] uppercase tracking-wider">
              {stat.label}
            </p>
            <p className="text-2xl font-bold text-[var(--sea-ink)]">
              {stat.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ProjectStats
