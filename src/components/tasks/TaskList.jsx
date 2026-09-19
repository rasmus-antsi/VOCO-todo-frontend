import { useEffect, useRef } from 'react'
import EmptyState from './EmptyState'
import TaskRow from './TaskRow'
import TaskSkeleton from './TaskSkeleton'
import styles from './TaskList.module.css'

/** Chooses between the loading, empty and populated states. */
export default function TaskList({
  tasks,
  status,
  view,
  selectedId,
  instant,
  onToggle,
  onRemove,
  onSelect,
}) {
  const ref = useRef(null)

  // Rows stagger in on first paint. Once they have all landed, drop the
  // stagger so tasks added later appear immediately instead of queueing
  // behind an index they happen to sit at.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const timer = setTimeout(() => el.style.setProperty('--stagger', '0ms'), 600)
    return () => clearTimeout(timer)
  }, [status])

  if (status === 'loading') return <TaskSkeleton />
  if (tasks.length === 0) return <EmptyState view={view} />

  return (
    <ul ref={ref} className={styles.list}>
      {tasks.map((task, index) => (
        <TaskRow
          key={task.id}
          task={task}
          index={index}
          selected={task.id === selectedId}
          instant={instant}
          onToggle={onToggle}
          onRemove={onRemove}
          onSelect={onSelect}
        />
      ))}
    </ul>
  )
}
