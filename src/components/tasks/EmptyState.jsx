import Kbd from '../ui/Kbd'
import styles from './EmptyState.module.css'

const COPY = {
  all: ['No tasks', 'Everything starts empty.'],
  active: ['Nothing active', 'Every task on the list is finished.'],
  done: ['Nothing finished', 'Completed tasks are filed here.'],
}

export default function EmptyState({ view }) {
  const [title, body] = COPY[view] ?? COPY.all

  return (
    <div className={styles.empty}>
      <div className={styles.frame} aria-hidden="true">
        <span className={styles.ghost} />
        <span className={styles.ghost} />
        <span className={styles.ghost} />
      </div>

      <h2 className={styles.title}>{title}</h2>
      <p className={styles.body}>{body}</p>

      <p className={styles.hint}>
        <Kbd>N</Kbd> to add one
      </p>
    </div>
  )
}
