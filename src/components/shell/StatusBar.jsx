import Kbd from '../ui/Kbd'
import styles from './StatusBar.module.css'

/**
 * The bottom readout, borrowed from editors: connection state on the left,
 * counts and a standing shortcut hint on the right. It is the second place
 * the signal colour is allowed — the live dot.
 */
export default function StatusBar({ connection, counts, selectedIndex }) {
  const text = {
    live: 'Connected',
    syncing: 'Syncing',
    offline: 'Disconnected',
  }[connection]

  return (
    <footer className={styles.bar}>
      <span className={styles.state} data-state={connection}>
        <span className={styles.dot} aria-hidden="true" />
        <span className="label">{text}</span>
      </span>

      <span className={styles.divider} aria-hidden="true" />

      <span className={`num ${styles.metric}`}>
        {counts.active} active · {counts.done} done
      </span>

      <span className={styles.spacer} />

      {selectedIndex !== null && (
        <span className={`num ${styles.metric}`}>row {selectedIndex + 1}</span>
      )}

      <span className={styles.hint}>
        <Kbd>N</Kbd> new
        <Kbd>↑↓</Kbd> move
        <Kbd>↵</Kbd> toggle
      </span>
    </footer>
  )
}
