import { VIEWS } from '../../hooks/useTaskViews'
import styles from './ViewNav.module.css'

/** The rail's view list. Each row shows its own 1/2/3 shortcut. */
export default function ViewNav({ value, onChange, counts }) {
  return (
    <nav className={styles.nav} aria-label="Views">
      {VIEWS.map(({ id, label, key }) => (
        <button
          key={id}
          type="button"
          className={styles.item}
          data-active={value === id || undefined}
          aria-current={value === id ? 'page' : undefined}
          onClick={() => onChange(id)}
        >
          <span className={styles.bar} aria-hidden="true" />
          <span className={styles.label}>{label}</span>
          <span className={`num ${styles.count}`}>{counts[id]}</span>
          <span className={styles.key} aria-hidden="true">
            {key}
          </span>
        </button>
      ))}
    </nav>
  )
}
