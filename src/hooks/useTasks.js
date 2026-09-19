import { useCallback, useEffect, useState } from 'react'
import * as api from '../api'

/**
 * A task that exists only locally carries a string placeholder id until the
 * insert comes back. The server's path parameter is an i64, so sending a
 * placeholder to PATCH or DELETE is a 400 — callers must check this first.
 */
export const isPending = (task) => typeof task.id !== 'number'

/** The API returns tasks ordered by id; keep local inserts in the same order. */
function byServerOrder(a, b) {
  const aReal = typeof a.id === 'number'
  const bReal = typeof b.id === 'number'
  if (aReal && bReal) return a.id - b.id
  return aReal ? -1 : 1 // rows still being created sit at the end
}

/**
 * Owns all task state and every call to the backend, so components stay
 * presentational.
 *
 * Mutations are optimistic: state changes before the request is sent, and each
 * one carries its own inverse so a failure reverts just that task. `syncing`
 * counts requests in flight, which is what the status bar reads.
 */
export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'failed'
  const [error, setError] = useState(null)
  const [inFlight, setInFlight] = useState(0)
  const [lastDeleted, setLastDeleted] = useState(null)

  // Initial load. setState lives in the promise callbacks rather than the
  // effect body, and `alive` drops the result if we unmount (or StrictMode
  // remounts) before it lands.
  useEffect(() => {
    let alive = true
    api
      .listTasks()
      .then((data) => {
        if (!alive) return
        setTasks(data)
        setStatus('ready')
      })
      .catch((e) => {
        if (!alive) return
        setError(e.message)
        setStatus('failed')
      })
    return () => {
      alive = false
    }
  }, [])

  const reload = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      setTasks(await api.listTasks())
      setStatus('ready')
    } catch (e) {
      setError(e.message)
      setStatus('failed')
    }
  }, [])

  /**
   * Applies an optimistic update and undoes it if the request fails.
   *
   * `revert` undoes this one task rather than restoring a snapshot of the
   * whole list — a snapshot would also throw away any other mutation that
   * landed while this request was in the air. Resolves to whether it stuck.
   */
  const mutate = useCallback(async (apply, revert, send) => {
    setTasks(apply)
    setError(null)
    setInFlight((n) => n + 1)
    try {
      await send()
      return true
    } catch (e) {
      setTasks(revert)
      setError(e.message)
      return false
    } finally {
      setInFlight((n) => n - 1)
    }
  }, [])

  const add = useCallback(
    (rawTitle) => {
      const title = rawTitle.trim()
      if (!title) return Promise.resolve(false)

      const tempId = `pending:${crypto.randomUUID()}`
      return mutate(
        (prev) => [...prev, { id: tempId, title, done: false }],
        (prev) => prev.filter((t) => t.id !== tempId),
        async () => {
          const created = await api.createTask(title)
          setTasks((prev) =>
            prev.map((t) => (t.id === tempId ? created : t)).sort(byServerOrder),
          )
        },
      )
    },
    [mutate],
  )

  const toggle = useCallback(
    (task) => {
      if (isPending(task)) return Promise.resolve(false)
      // Flipping twice is the identity, so the same function applies and undoes.
      const flip = (prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t))
      return mutate(flip, flip, () => api.setTaskDone(task.id, !task.done))
    },
    [mutate],
  )

  const remove = useCallback(
    async (task) => {
      if (isPending(task)) return false

      setLastDeleted(task)
      const ok = await mutate(
        (prev) => prev.filter((t) => t.id !== task.id),
        (prev) => [...prev, task].sort(byServerOrder),
        () => api.deleteTask(task.id),
      )
      // The row is still there after a failed delete, so offering to undo it
      // would create a duplicate.
      if (!ok) setLastDeleted(null)
      return ok
    },
    [mutate],
  )

  /**
   * Re-creates the last deleted task. The row is gone from Postgres, so this
   * genuinely inserts a new one — same title and done state, new id.
   */
  const undoDelete = useCallback(async () => {
    const task = lastDeleted
    if (!task) return
    setLastDeleted(null)

    const tempId = `pending:${crypto.randomUUID()}`
    await mutate(
      (prev) => [...prev, { ...task, id: tempId }],
      (prev) => prev.filter((t) => t.id !== tempId),
      async () => {
        const created = await api.createTask(task.title)
        const restored = task.done
          ? await api.setTaskDone(created.id, true)
          : created
        setTasks((prev) =>
          prev.map((t) => (t.id === tempId ? restored : t)).sort(byServerOrder),
        )
      },
    )
  }, [lastDeleted, mutate])

  const dismissUndo = useCallback(() => setLastDeleted(null), [])
  const dismissError = useCallback(() => setError(null), [])

  return {
    tasks,
    status,
    error,
    syncing: inFlight > 0,
    lastDeleted,
    add,
    toggle,
    remove,
    undoDelete,
    dismissUndo,
    dismissError,
    reload,
  }
}
