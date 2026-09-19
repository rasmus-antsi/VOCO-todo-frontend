import { useCallback, useRef, useState } from 'react'
import AppShell from './components/shell/AppShell'
import Sidebar from './components/shell/Sidebar'
import StatusBar from './components/shell/StatusBar'
import Topbar from './components/shell/Topbar'
import Composer from './components/tasks/Composer'
import TaskList from './components/tasks/TaskList'
import ShortcutsDialog from './components/ui/ShortcutsDialog'
import UndoToast from './components/ui/UndoToast'
import { useHotkeys } from './hooks/useHotkeys'
import { useSelection } from './hooks/useSelection'
import { isPending, useTasks } from './hooks/useTasks'
import { useTaskViews } from './hooks/useTaskViews'
import { useTheme } from './hooks/useTheme'
import styles from './App.module.css'

export default function App() {
  const tasks = useTasks()
  const theme = useTheme()

  const [view, setView] = useState('all')
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  const { visible, counts } = useTaskViews(tasks.tasks, view)
  const selection = useSelection(visible)
  const composerRef = useRef(null)

  // Whether the last action came from the keyboard. Checking a task off is a
  // hundred-times-a-day action, so on that path the feedback is instant; the
  // same toggle by mouse keeps its transition.
  const [instant, setInstant] = useState(false)

  const focusComposer = useCallback(() => {
    setInstant(true)
    composerRef.current?.focus()
  }, [])

  const toggleTask = useCallback(
    (task, fromKeyboard) => {
      if (!task || isPending(task)) return
      setInstant(fromKeyboard)
      // Outside the All view, completing a task (or reopening a completed one)
      // drops it out of the list being looked at. Move the selection on before
      // it goes, or the keyboard is left pointing at a row that no longer
      // exists and the next keypress does nothing.
      if (view !== 'all') selection.selectNeighbourOf(task.id)
      tasks.toggle(task)
    },
    [selection, tasks, view],
  )

  const removeTask = useCallback(
    (task, fromKeyboard) => {
      if (!task || isPending(task)) return
      setInstant(fromKeyboard)
      selection.selectNeighbourOf(task.id)
      tasks.remove(task)
    },
    [selection, tasks],
  )

  useHotkeys(
    {
      arrowdown: () => selection.move(1),
      arrowup: () => selection.move(-1),
      j: () => selection.move(1),
      k: () => selection.move(-1),
      enter: () => toggleTask(selection.selected, true),
      backspace: () => removeTask(selection.selected, true),
      delete: () => removeTask(selection.selected, true),
      n: focusComposer,
      '/': focusComposer,
      1: () => setView('all'),
      2: () => setView('active'),
      3: () => setView('done'),
      '?': () => setShortcutsOpen(true),
      'mod+z': { run: tasks.undoDelete, allowInInput: true },
      escape: {
        allowInInput: true,
        run: () => {
          if (document.activeElement === composerRef.current) {
            return composerRef.current.blur()
          }
          selection.clear()
        },
      },
    },
    // The dialog brings its own Escape and focus trap; everything else stands
    // down so the list behind it does not react to keys aimed at the modal.
    { enabled: !shortcutsOpen },
  )

  const connection = tasks.syncing
    ? 'syncing'
    : tasks.status === 'failed' || tasks.error
      ? 'offline'
      : 'live'

  const selectedIndex = selection.selected
    ? visible.findIndex((t) => t.id === selection.selectedId)
    : null

  return (
    <>
      <AppShell
        rail={
          <Sidebar
            view={view}
            onViewChange={setView}
            counts={counts}
            theme={theme}
          />
        }
        status={
          <StatusBar
            connection={connection}
            counts={counts}
            selectedIndex={selectedIndex}
          />
        }
      >
        <Topbar
          view={view}
          count={visible.length}
          onShowShortcuts={() => setShortcutsOpen(true)}
        />

        <Composer
          ref={composerRef}
          onAdd={tasks.add}
          onEscape={() => composerRef.current?.blur()}
        />

        {tasks.status === 'failed' && (
          <div className={styles.failure}>
            <p className={styles.failureText}>{tasks.error}</p>
            <button
              type="button"
              className={styles.retry}
              onClick={tasks.reload}
            >
              Retry
            </button>
          </div>
        )}

        <TaskList
          tasks={visible}
          status={tasks.status}
          view={view}
          selectedId={selection.selectedId}
          instant={instant}
          onToggle={(task) => toggleTask(task, false)}
          onRemove={(task) => removeTask(task, false)}
          onSelect={selection.select}
        />
      </AppShell>

      <UndoToast
        open={Boolean(tasks.lastDeleted)}
        token={tasks.lastDeleted?.id}
        onUndo={tasks.undoDelete}
        onDismiss={tasks.dismissUndo}
      />

      <ShortcutsDialog
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </>
  )
}
