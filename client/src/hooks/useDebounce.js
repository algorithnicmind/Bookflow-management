'use client'

import { useState, useEffect } from 'react'

/**
 * useDebounce Hook
 * ----------------
 * Delays updating a value until the user stops changing it for a specified duration.
 * Prevents excessive API calls on search inputs (e.g., employee search).
 * 
 * Usage:
 *   const [search, setSearch] = useState('')
 *   const debouncedSearch = useDebounce(search, 300)
 *   useEffect(() => { fetchResults(debouncedSearch) }, [debouncedSearch])
 * 
 * @param {any} value - The value to debounce
 * @param {number} delay - Debounce delay in milliseconds (default 300ms)
 * @returns {any} The debounced value
 */
export default function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
