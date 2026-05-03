export const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id)

socket.on('join:workspace', ({ workspaceId, userId }) => {
  socket.join(`workspace:${workspaceId}`)
  socket.data.userId = userId
  socket.data.workspaceId = workspaceId

  // Get all currently online userIds in this workspace
  const room = io.sockets.adapter.rooms.get(`workspace:${workspaceId}`)
  const onlineUserIds = room ? [...room].map((sid) => {
    const s = io.sockets.sockets.get(sid)
    return s?.data?.userId
  }).filter(Boolean) : []

  // Send full online list to the joining socket only
  socket.emit('members:online:init', { userIds: onlineUserIds })

  // Tell everyone else this user joined
  socket.to(`workspace:${workspaceId}`).emit('member:online', { userId })
})

socket.on('join:user', ({ userId }) => {
  socket.join(`user:${userId}`)
})

    socket.on('leave:workspace', ({ workspaceId, userId }) => {
      socket.leave(`workspace:${workspaceId}`)
      io.to(`workspace:${workspaceId}`).emit('member:offline', { userId })
    })

    socket.on('disconnect', () => {
      const { userId, workspaceId } = socket.data
      if (userId && workspaceId) {
        io.to(`workspace:${workspaceId}`).emit('member:offline', { userId })
      }
    })
  })
}