import { useEffect, useRef } from 'react'
import { candidatesFor, handledNatively, isTyping } from '../lib/hotkeys'

/**
 * Binds a map of shortcuts to one window-level listener.
 *
 *   useHotkeys({
 *     j: selectNext,
 *     escape: { run: blur, allowInInput: true },
 *   })
 *
 * A binding is a function, or `{ run, allowInInput }` for the few shortcuts
 * that must still fire while the composer has focus.
 *
 * Pass `enabled: false` to stand down entirely — the shortcuts dialog does
 * this so the list behind it does not react to keys aimed at the modal.
 */
export function useHotkeys(bindings, { enabled = true } = {}) {
  // Kept in a ref so the listener is attached once and never re-bound as the
  // handlers change identity between renders. Synced in an effect rather than
  // during render, which React forbids.
  const ref = useRef(bindings)
  const enabledRef = useRef(enabled)
  useEffect(() => {
    ref.current = bindings
    enabledRef.current = enabled
  })

  useEffect(() => {
    function onKeyDown(event) {
      if (!enabledRef.current) return
      // Let a focused control keep its own Enter/Space.
      if (handledNatively(event)) return

      const typing = isTyping(event.target)

      for (const combo of candidatesFor(event)) {
        const binding = ref.current[combo]
        if (!binding) continue

        const run = typeof binding === 'function' ? binding : binding.run
        const allowInInput =
          typeof binding === 'function' ? false : binding.allowInInput

        if (typing && !allowInInput) continue

        event.preventDefault()
        run(event)
        return
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
