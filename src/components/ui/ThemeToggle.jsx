import styles from './ThemeToggle.module.css'

const ICONS = {
  system: 'M4 4h8v5H4zM6 11h4M5.5 12.5h5',
  light: 'M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14M3.8 3.8l1 1M11.2 11.2l1 1M12.2 3.8l-1 1M4.8 11.2l-1 1',
  dark: 'M13 9.5A5.5 5.5 0 0 1 6.5 3a5.5 5.5 0 1 0 6.5 6.5',
}

const NEXT = { system: 'light', light: 'dark', dark: 'system' }

/** Cycles system → light → dark. Apps have theme control; pages rarely do. */
export default function ThemeToggle({ theme, cycle }) {
  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={cycle}
      title={`Theme: ${theme}. Switch to ${NEXT[theme]}.`}
      aria-label={`Theme: ${theme}. Switch to ${NEXT[theme]}.`}
    >
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d={ICONS[theme]} />
      </svg>
    </button>
  )
}
