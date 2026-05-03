import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  }
})

export const sendMail = async ({ to, subject, html }) => {
  if (!process.env.MAIL_USER) {
    console.log('MAIL_USER not set, skipping email')
    return
  }
  console.log(`Sending email to ${to}: ${subject}`) 
  await transporter.sendMail({
    from: `"Team Hub" <${process.env.MAIL_USER}>`,
    to, subject, html
  })
}

export const templates = {
  mention: (mentionedBy, context) => ({
    subject: `${mentionedBy} mentioned you on Team Hub`,
    html: `<p><strong>${mentionedBy}</strong> mentioned you in a comment.</p><p>${context}</p>`
  }),
  goalAssigned: (goalTitle) => ({
    subject: `New goal assigned: ${goalTitle}`,
    html: `<p>You have been assigned as owner of goal: <strong>${goalTitle}</strong></p>`
  }),
  goalStatusChanged: (goalTitle, status) => ({
    subject: `Goal status updated: ${goalTitle}`,
    html: `<p>The goal <strong>${goalTitle}</strong> status changed to <strong>${status}</strong></p>`
  }),
  newAnnouncement: (title, workspaceName) => ({
    subject: `New announcement in ${workspaceName}`,
    html: `<p>A new announcement was posted: <strong>${title}</strong></p>`
  }),
  actionItemAssigned: (itemTitle) => ({
    subject: `Action item assigned to you: ${itemTitle}`,
    html: `<p>You have been assigned an action item: <strong>${itemTitle}</strong></p>`
  }),
  workspaceInvite: (inviterName, workspaceName) => ({
    subject: `You've been invited to ${workspaceName}`,
    html: `<p><strong>${inviterName}</strong> invited you to join <strong>${workspaceName}</strong> on Team Hub.</p>`
  }),
}