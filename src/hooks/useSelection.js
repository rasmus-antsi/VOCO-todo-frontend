import { useCallback, useState } from 'react'

const clamp = (n, max) => Math.max(0, Math.min(n, max))

/**
 * The keyboard selection model: one row is "selected" and the arrow keys move
 * it. Deliberately separate from hover — the pointer highlights what it is
 * over without stealing the keyboard's place, the way Superhuman and Linear
 * behave.
 */
export function useSelection(items) {
  const [selectedId, setSelectedId] = useState(null)

  const index = items.findIndex((item) => item.id === selectedId)
  const selected = index === -1 ? null : items[index]

  /** Steps the selection, entering the list from whichever end you came from. */
  const move = useCallback(
    (delta) => {
      if (items.length === 0) return
      const next =
        index === -1
          ? delta > 0
            ? 0
            : items.length - 1
          : clamp(index + delta, items.length - 1)
      setSelectedId(items[next].id)
    },
    [items, index],
  )

  /** After a delete, land on the row that took its place. */
  const selectNeighbourOf = useCallback(
    (id) => {
      const at = items.findIndex((item) => item.id === id)
      if (at === -1) return
      const neighbour = items[at + 1] ?? items[at - 1] ?? null
      setSelectedId(neighbour ? neighbour.id : null)
    },
    [items],
  )

  return {
    selectedId: selected ? selectedId : null,
    selected,
    move,
    select: setSelectedId,
    clear: useCallback(() => setSelectedId(null), []),
    selectNeighbourOf,
  }
}
