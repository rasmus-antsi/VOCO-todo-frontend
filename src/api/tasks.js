/**
 * Task endpoints — mirrors the axum router in backend/src/main.rs.
 *
 * A Task is: { id: number, user_id: number, title: string, done: boolean }
 */
import { del, get, patch, post } from './client'

/** GET /api/tasks -> Task[] */
export const listTasks = () => get('/tasks')

/** POST /api/tasks -> Task */
export const createTask = (title) => post('/tasks', { title })

/** PATCH /api/tasks/:id -> Task */
export const setTaskDone = (id, done) => patch(`/tasks/${id}`, { done })

/** DELETE /api/tasks/:id -> Task (the deleted row) */
export const deleteTask = (id) => del(`/tasks/${id}`)
