import ThemeToggle from '../ui/ThemeToggle'
import ProgressMeter from './ProgressMeter'
import ViewNav from './ViewNav'
import styles from './Sidebar.module.css'

export default function Sidebar({ view, onViewChange, counts, theme }) {
  return (
    <>
      <div className={styles.brand}>
        <span className={styles.mark} aria-hidden="true" />
        <span className={styles.wordmark}>Instrument</span>
        <ThemeToggle {...theme} />
      </div>

      <ViewNav value={view} onChange={onViewChange} counts={counts} />

      <div className={styles.spacer} />

      <ProgressMeter done={counts.done} total={counts.all} />
    </>
  )
}
