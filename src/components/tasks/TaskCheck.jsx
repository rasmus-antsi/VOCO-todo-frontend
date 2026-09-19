import styles from './TaskCheck.module.css'

/**
 * The checkbox. Completion reads as an inversion — the box fills with ink and
 * the tick is knocked out of it — so the signal colour stays reserved for
 * system state.
 *
 * `instant` is set when the toggle came from the keyboard. Checking a task is
 * a hundred-times-a-day action; animating it there would make the app feel
 * laggy, so the transition is zeroed for that path only.
 */
export default function TaskCheck({ checked, instant, disabled, onToggle, label }) {
  return (
    <span
      className={styles.box}
      data-checked={checked || undefined}
      data-instant={instant || undefined}
    >
      <input
        type="checkbox"
        className={styles.input}
        checked={checked}
        disabled={disabled}
        onChange={onToggle}
        aria-label={label}
      />
      <svg className={styles.tick} viewBox="0 0 16 16" aria-hidden="true">
        <path d="M4 8.5 6.8 11.3 12 5.2" />
      </svg>
    </span>
  )
}
