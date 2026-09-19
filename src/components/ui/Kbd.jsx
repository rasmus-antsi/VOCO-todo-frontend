import styles from './Kbd.module.css'

/** A keycap. Used anywhere a shortcut is named so hints look uniform. */
export default function Kbd({ children }) {
  return <kbd className={styles.kbd}>{children}</kbd>
}
