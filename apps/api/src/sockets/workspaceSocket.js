export const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id)

    socket.on('join:workspace', ({ workspaceId, userId }) => {
      socket.join(`workspace:${workspaceId}`)
      socket.data.userId = userId
      socket.data.workspaceId = workspaceId
      io.to(`workspace:${workspaceId}`).emit('member:online', { userId })
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