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


// OTP email template
const otpHtml = (otp, heading, subtext) => `
  <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;background:#12111D;color:#E8E6F0;border-radius:16px;overflow:hidden;border:1px solid #252338;">
    <div style="height:3px;background:linear-gradient(90deg,transparent,#7C6EF0,transparent);"></div>
    <div style="padding:40px 32px;">
      <h2 style="margin:0 0 8px;font-size:20px;">${heading}</h2>
      <p style="margin:0 0 24px;font-size:14px;color:#9B98B0;">${subtext} Expires in <strong style="color:#E8E6F0;">10 minutes</strong>.</p>
      <div style="background:#1C1B30;border:1px solid #252338;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
        <span style="font-size:36px;font-weight:800;letter-spacing:12px;color:#7C6EF0;">${otp}</span>
      </div>
      <p style="margin:0;font-size:12px;color:#5C5975;">If you didn't request this, ignore this email.</p>
    </div>
  </div>
`

export const sendOtpEmail = async (email, otp, name, mode = 'verify') => {
  const isReset = mode === 'reset'
  await sendMail({
    to: email,
    subject: `${otp} — TeamCentre ${isReset ? 'password reset' : 'verification'} code`,
    html: otpHtml(
      otp,
      isReset ? 'Reset your password' : 'Verify your email',
      isReset
        ? `Hi ${name}, use this code to reset your password.`
        : `Hi ${name}, use this code to verify your email.`
    ),
  })
}