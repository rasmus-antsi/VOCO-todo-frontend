import { useEffect } from 'react'
import Kbd from './Kbd'
import styles from './UndoToast.module.css'

const DISMISS_AFTER = 7000

/**
 * Stays mounted and slides out of view when closed, so entering and leaving
 * are plain CSS transitions — interruptible, unlike keyframes, which matters
 * when tasks are deleted in quick succession.
 *
 * It deliberately does not name the task: the element has to read correctly
 * mid-exit, once the deleted task is already gone from state.
 */
export default function UndoToast({ open, token, onUndo, onDismiss }) {
  // `token` changes with each delete, so deleting a second task while the
  // first toast is still up restarts the countdown instead of letting the
  // original timer cut the new one short.
  useEffect(() => {
    if (!open) return
    const timer = setTimeout(onDismiss, DISMISS_AFTER)
    return () => clearTimeout(timer)
  }, [open, token, onDismiss])

  return (
    <div
      className={styles.toast}
      data-open={open || undefined}
      role="status"
      aria-live="polite"
    >
      <span className={styles.text}>Task deleted</span>

      <button type="button" className={styles.undo} onClick={onUndo}>
        Undo
        <Kbd>⌘Z</Kbd>
      </button>
    </div>
  )
}
