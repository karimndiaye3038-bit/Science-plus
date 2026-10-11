import { useCallback, useEffect, useState } from 'react'
import { api } from '../services/api'

// useFetch('/courses', 'courses', []) -> { data, loading, error, reload, setData }
export function useFetch(path, key, initial = null) {
  const [data, setData] = useState(initial)
  const [loading, setLoading] = useState(Boolean(path))
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!path) return
    setLoading(true)
    try {
      const res = await api(path)
      setData(key ? res[key] ?? initial : res)
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, key])

  useEffect(() => {
    load()
  }, [load])

  return { data, loading, error, reload: load, setData }
}
