async function request(url, options) {
  const res = await fetch(url, options)
  if (!res.ok) throw new Error(await res.text())
  if (res.status === 204) return undefined
  return res.json()
}

const json = { 'Content-Type': 'application/json' }

export const listTasks = () => request('/api/tasks')

export const createTask = (title) =>
  request('/api/tasks', {
    method: 'POST',
    headers: json,
    body: JSON.stringify({ title }),
  })

export const setDone = (id, done) =>
  request(`/api/tasks/${id}`, {
    method: 'PATCH',
    headers: json,
    body: JSON.stringify({ done }),
  })

export const deleteTask = (id) =>
  request(`/api/tasks/${id}`, { method: 'DELETE' })
