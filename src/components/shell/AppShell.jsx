import styles from './AppShell.module.css'

/**
 * The frame: a fixed rail, a main pane that owns the only scroll region, and
 * a status bar pinned to the bottom. Nothing here scrolls the page.
 */
export default function AppShell({ rail, children, status }) {
  return (
    <div className={styles.shell}>
      <aside className={styles.rail}>{rail}</aside>
      <main className={styles.main}>{children}</main>
      <div className={styles.status}>{status}</div>
    </div>
  )
}
