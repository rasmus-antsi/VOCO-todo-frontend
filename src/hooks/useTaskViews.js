import { useMemo } from 'react'

/** The sidebar's views. `key` doubles as the 1/2/3 shortcut. */
export const VIEWS = [
  { id: 'all', label: 'All', key: '1' },
  { id: 'active', label: 'Active', key: '2' },
  { id: 'done', label: 'Done', key: '3' },
]

const predicates = {
  all: () => true,
  active: (t) => !t.done,
  done: (t) => t.done,
}

/** The visible slice plus the counts the rail and status bar report. */
export function useTaskViews(tasks, view) {
  return useMemo(() => {
    const done = tasks.filter((t) => t.done).length
    return {
      visible: tasks.filter(predicates[view] ?? predicates.all),
      counts: { all: tasks.length, active: tasks.length - done, done },
    }
  }, [tasks, view])
}
