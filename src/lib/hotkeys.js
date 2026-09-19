/**
 * Keyboard helpers. Pure DOM logic, no React — so the matching rules can be
 * reasoned about (and reused) on their own.
 */

/* <input> covers far more than text entry. Treating a focused checkbox as a
   text field would silently disable every shortcut for as long as it held
   focus — which is exactly what happens after you click one. */
const NON_TEXT_INPUTS = new Set([
  'button',
  'checkbox',
  'color',
  'file',
  'image',
  'radio',
  'range',
  'reset',
  'submit',
])

/** True when the event came from somewhere the user is entering text. */
export function isTyping(target) {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  if (target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return true
  if (target.tagName === 'INPUT') return !NON_TEXT_INPUTS.has(target.type)
  return false
}

/**
 * True when the focused element already handles this key itself — Enter on a
 * button, Space on a checkbox. Without this, a global Enter binding would
 * swallow the activation of whatever the user had tabbed to and act on the
 * selected row instead.
 */
const ACTIVATION = new Set([' ', 'enter'])
const NATIVE_CONTROLS = new Set([
  'BUTTON',
  'A',
  'SUMMARY',
  'INPUT',
  'SELECT',
  'TEXTAREA',
])

export function handledNatively(event) {
  if (!ACTIVATION.has(event.key.toLowerCase())) return false
  const target = event.target
  return (
    target instanceof HTMLElement &&
    (NATIVE_CONTROLS.has(target.tagName) || target.isContentEditable)
  )
}

/**
 * Normalises an event into a lookup string: 'mod+z', 'shift+?', 'arrowdown'.
 * 'mod' is Cmd on macOS and Ctrl elsewhere, which is what users expect.
 */
export function comboOf(event) {
  const parts = []
  if (event.metaKey || event.ctrlKey) parts.push('mod')
  if (event.altKey) parts.push('alt')
  if (event.shiftKey) parts.push('shift')
  parts.push(event.key.toLowerCase())
  return parts.join('+')
}

/**
 * The combos to try for one event, most specific first. Shift is dropped on
 * the second pass so a binding for '?' matches without also writing 'shift+?'.
 */
export function candidatesFor(event) {
  const full = comboOf(event)
  const withoutShift = full.replace('shift+', '')
  return full === withoutShift ? [full] : [full, withoutShift]
}

/** Cmd on Apple platforms, Ctrl everywhere else — for rendering hints. */
export const isApple =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

export const MOD_KEY = isApple ? '⌘' : 'Ctrl'
