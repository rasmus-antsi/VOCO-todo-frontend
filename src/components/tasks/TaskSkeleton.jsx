import styles from './TaskSkeleton.module.css'

/** Placeholder rows for the first fetch. Widths vary so it reads as text. */
const WIDTHS = ['72%', '54%', '81%', '46%', '63%']

export default function TaskSkeleton() {
  return (
    <ul className={styles.skeleton} aria-hidden="true">
      {WIDTHS.map((width, i) => (
        <li key={width} className={styles.row} style={{ '--i': i }}>
          <span className={styles.box} />
          <span className={styles.line} style={{ width }} />
        </li>
      ))}
    </ul>
  )
}
