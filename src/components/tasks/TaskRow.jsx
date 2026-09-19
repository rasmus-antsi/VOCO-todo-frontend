import { useEffect, useRef } from 'react'
import { isPending } from '../../hooks/useTasks'
import TaskCheck from './TaskCheck'
import styles from './TaskRow.module.css'

/**
 * One row. Selection (keyboard) and hover (pointer) are separate states:
 * the pointer can wander without moving where the keyboard is.
 */
export default function TaskRow({
  task,
  index,
  selected,
  instant,
  onToggle,
  onRemove,
  onSelect,
}) {
  const ref = useRef(null)
  // Until the insert returns there is no id to send, so the controls are inert.
  const pending = isPending(task)

  // Keep the keyboard's row in view as the selection walks past the fold.
  useEffect(() => {
    if (selected) ref.current?.scrollIntoView({ block: 'nearest' })
  }, [selected])

  return (
    <li
      ref={ref}
      className={styles.row}
      style={{ '--i': index }}
      data-done={task.done || undefined}
      data-selected={selected || undefined}
      data-pending={pending || undefined}
      onMouseDown={() => onSelect(task.id)}
    >
      <span className={styles.marker} aria-hidden="true" />

      <TaskCheck
        checked={task.done}
        instant={instant}
        disabled={pending}
        onToggle={() => onToggle(task)}
        label={`Mark "${task.title}" as ${task.done ? 'not done' : 'done'}`}
      />

      <span className={styles.title}>
        <span className={styles.text}>
          {task.title}
          <span className={styles.strike} aria-hidden="true" />
        </span>
      </span>

      <button
        type="button"
        className={styles.remove}
        disabled={pending}
        onClick={() => onRemove(task)}
        aria-label={`Delete "${task.title}"`}
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
      </button>
    </li>
  )
}
