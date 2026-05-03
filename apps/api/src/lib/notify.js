import prisma from './prisma.js'

export const notify = async (io, { userIds, message, type = 'INFO', link = null }) => {
  for (const userId of userIds) {
    const notif = await prisma.notification.create({
      data: { userId, message, type, link }
    })
    io?.to(`user:${userId}`).emit('notification:new', notif)
  }
}

export const parseMentions = async (content, workspaceId) => {
  // Get all members of workspace first
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: { user: { select: { id: true, name: true, email: true } } }
  })

  const mentionedUsers = []

  for (const member of members) {
    const { name, email } = member.user
    // Check if @Name or @email appears in content (case-insensitive)
    const nameMentioned = content.toLowerCase().includes(`@${name.toLowerCase()}`)
    const emailMentioned = content.toLowerCase().includes(`@${email.toLowerCase()}`)
    if (nameMentioned || emailMentioned) {
      mentionedUsers.push(member.user)
    }
  }

  return mentionedUsers
}