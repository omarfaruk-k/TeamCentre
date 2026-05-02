import { useState, useEffect } from 'react'
import { getSocket } from '../lib/socket'

export function useOnlineMembers() {
  const [onlineIds, setOnlineIds] = useState(new Set())

  useEffect(() => {
    const socket = getSocket()

    socket.on('member:online', ({ userId }) => {
      setOnlineIds((prev) => new Set([...prev, userId]))
    })

    socket.on('member:offline', ({ userId }) => {
      setOnlineIds((prev) => {
        const next = new Set(prev)
        next.delete(userId)
        return next
      })
    })

    return () => {
      socket.off('member:online')
      socket.off('member:offline')
    }
  }, [])

  return onlineIds
}