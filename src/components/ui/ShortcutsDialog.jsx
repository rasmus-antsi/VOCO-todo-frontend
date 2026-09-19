import { useEffect, useRef } from 'react'
import { MOD_KEY } from '../../lib/hotkeys'
import Kbd from './Kbd'
import styles from './ShortcutsDialog.module.css'

const GROUPS = [
  {
    name: 'Navigate',
    items: [
      [['↑', '↓'], 'Move selection'],
      [['J', 'K'], 'Move selection (vim)'],
      [['1', '2', '3'], 'Switch view'],
    ],
  },
  {
    name: 'Act',
    items: [
      [['N'], 'New task'],
      [['↵'], 'Toggle selected task'],
      [['⌫'], 'Delete selected task'],
      [[`${MOD_KEY}Z`], 'Undo delete'],
    ],
  },
  {
    name: 'Everything else',
    items: [
      [['?'], 'This list'],
      [['Esc'], 'Leave the field / clear selection'],
    ],
  },
]

/**
 * Native <dialog>, so Escape, the backdrop and the focus trap come from the
 * platform rather than being reimplemented.
 */
export default function ShortcutsDialog({ open, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) {
      // showModal() runs the dialog focusing steps, which land on the first
      // focusable child — so the dialog would open with a focus ring sitting
      // on its close button. Those steps prefer a descendant carrying
      // `autofocus`, so point them at the heading instead: screen readers
      // announce the title, and Tab still walks to the button from there.
      // Set imperatively because React's `autoFocus` prop would fire on the
      // initial page render, when the dialog is mounted but closed.
      el.querySelector('[data-autofocus]')?.setAttribute('autofocus', '')
      el.showModal()
    }
    if (!open && el.open) el.close()
  }, [open])

  return (
    <dialog ref={ref} className={styles.dialog} onClose={onClose}>
      <div className={styles.head}>
        <h2 className={styles.title} tabIndex={-1} data-autofocus>
          Keyboard
        </h2>
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      </div>

      <div className={styles.body}>
        {GROUPS.map((group) => (
          <section key={group.name} className={styles.group}>
            <h3 className="label">{group.name}</h3>
            <dl className={styles.rows}>
              {group.items.map(([keys, description]) => (
                <div key={description} className={styles.row}>
                  <dt className={styles.keys}>
                    {keys.map((key) => (
                      <Kbd key={key}>{key}</Kbd>
                    ))}
                  </dt>
                  <dd className={styles.desc}>{description}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </dialog>
  )
}
