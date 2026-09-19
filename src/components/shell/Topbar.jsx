import Kbd from '../ui/Kbd'
import { VIEWS } from '../../hooks/useTaskViews'
import styles from './Topbar.module.css'

export default function Topbar({ view, count, onShowShortcuts }) {
  const label = VIEWS.find((v) => v.id === view)?.label ?? 'All'

  return (
    <header className={styles.bar}>
      <h1 className={styles.title}>{label}</h1>
      <span className={`num ${styles.count}`}>{count}</span>

      <div className={styles.spacer} />

      <button type="button" className={styles.help} onClick={onShowShortcuts}>
        Shortcuts
        <Kbd>?</Kbd>
      </button>
    </header>
  )
}
