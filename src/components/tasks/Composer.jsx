import { forwardRef, useState } from 'react'
import Kbd from '../ui/Kbd'
import styles from './Composer.module.css'

/**
 * Docked above the list and always ready. `N` or `/` focuses it from anywhere;
 * Escape gives focus back to the list.
 */
const Composer = forwardRef(function Composer({ onAdd, onEscape }, ref) {
  const [title, setTitle] = useState('')
  const ready = title.trim().length > 0

  function submit(event) {
    event.preventDefault()
    if (!ready) return
    onAdd(title)
    setTitle('')
  }

  return (
    <form className={styles.composer} onSubmit={submit}>
      <span className={styles.caret} aria-hidden="true">
        <svg viewBox="0 0 16 16">
          <path d="M8 3v10M3 8h10" />
        </svg>
      </span>

      <input
        ref={ref}
        className={styles.input}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && onEscape()}
        placeholder="Add a task"
        aria-label="New task"
        autoComplete="off"
        spellCheck="false"
        maxLength={200}
      />

      <span className={styles.affordance} data-ready={ready || undefined}>
        <Kbd>↵</Kbd>
      </span>
    </form>
  )
})

export default Composer
