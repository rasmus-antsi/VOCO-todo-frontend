import { useEffect, useState } from 'react'
import { listTasks } from './api'

export default function App() {
  const [tasks, setTasks] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    listTasks()
      .then(setTasks)
      .catch((e) => setError(e.message))
  }, [])

  return (
    <main>
      <h1>Tasks</h1>
      {error && <p>{error}</p>}
      <ul>
        {tasks.map((t) => (
          <li key={t.id}>
            {t.done ? '✓' : '○'} {t.title}
          </li>
        ))}
      </ul>
    </main>
  )
}
