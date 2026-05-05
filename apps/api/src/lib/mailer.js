import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  }
})

// ── Base layout wrapper ─────────────────────────────────────
const BASE_URL = process.env.CLIENT_URL || 'https://teamcentre.up.railway.app'
const LOGO_URL = `${BASE_URL}/logo-dark.svg`
const ACCENT   = '#7C6EF0'

const layout = (content) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px 16px;background:#0E0D1A;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:480px;margin:0 auto;">

    <!-- Logo -->
    <div style="text-align:center;margin-bottom:20px;">
      <img src="${LOGO_URL}" alt="TeamCentre" height="40" style="max-width:180px;height:40px;object-fit:contain;" />
    </div>

    <!-- Card -->
    <div style="background:#12111D;border-radius:16px;overflow:hidden;border:1px solid #252338;box-shadow:0 32px 64px rgba(0,0,0,0.4);">
      <!-- Accent top line -->
      <div style="height:3px;background:linear-gradient(90deg,transparent,${ACCENT},transparent);"></div>

      <!-- Content -->
      <div style="padding:32px;">
        ${content}
      </div>

      <!-- Footer -->
      <div style="padding:16px 32px;border-top:1px solid #1C1B30;text-align:center;">
        <p style="margin:0;font-size:11px;color:#5C5975;">
          TeamCentre · You're receiving this because you have an account.
        </p>
      </div>
    </div>

    <!-- Bottom spacer -->
    <p style="text-align:center;font-size:11px;color:#3A3756;margin-top:16px;">
      © ${new Date().getFullYear()} TeamCentre. All rights reserved.
    </p>
  </div>
</body>
</html>
`

// ── Icon badge ──────────────────────────────────────────────
const iconBadge = (emoji) => `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
    <tr>
      <td align="center">
        <div style="width:48px;height:48px;border-radius:12px;background:${ACCENT}20;
          border:1px solid ${ACCENT}15;font-size:24px;line-height:48px;
          text-align:center;margin:0 auto;">
          ${emoji}
        </div>
      </td>
    </tr>
  </table>
`

// ── Heading + subtext ───────────────────────────────────────
const heading = (title, sub) => `
  <h2 style="margin:0 0 6px;font-size:18px;font-weight:700;color:#E8E6F0;text-align:center;">${title}</h2>
  <p style="margin:0 0 24px;font-size:13px;color:#9B98B0;text-align:center;line-height:1.6;">${sub}</p>
`

// ── Info row ────────────────────────────────────────────────
const infoRow = (label, value) => `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
    <tr>
      <td style="background:#1C1B30;border-radius:8px;padding:10px 14px;">
        <span style="font-size:12px;color:#9B98B0;display:block;margin-bottom:2px;">${label}</span>
        <span style="font-size:12px;font-weight:600;color:#E8E6F0;">${value}</span>
      </td>
    </tr>
  </table>
`

// ── CTA button ──────────────────────────────────────────────
const button = (text, href) => `
  <div style="text-align:center;margin-top:24px;">
    <a href="${href}" style="display:inline-block;padding:12px 28px;background:${ACCENT};
      color:white;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">
      ${text}
    </a>
  </div>
`

// ── Divider ─────────────────────────────────────────────────
const divider = () => `<div style="height:1px;background:#1C1B30;margin:20px 0;"></div>`


// ── sendMail ────────────────────────────────────────────────
export const sendMail = async ({ to, subject, html }) => {
  if (!process.env.MAIL_USER) {
    console.log('MAIL_USER not set, skipping email')
    return
  }
  console.log(`Sending email to ${to}: ${subject}`)
  await transporter.sendMail({
    from: `"TeamCentre" <${process.env.MAIL_USER}>`,
    to, subject, html
  })
}


// ── OTP email ───────────────────────────────────────────────
export const sendOtpEmail = async (email, otp, name, mode = 'verify') => {
  const isReset = mode === 'reset'
  const content = `
    ${iconBadge(isReset ? '🔐' : '✉️')}
    ${heading(
      isReset ? 'Reset your password' : 'Verify your email',
      isReset
        ? `Hi ${name}, use the code below to reset your TeamCentre password.`
        : `Hi ${name}, use the code below to verify your TeamCentre email address.`
    )}
    <div style="background:#1C1B30;border:1px solid #252338;border-radius:12px;
      padding:24px;text-align:center;margin-bottom:20px;">
      <span style="font-size:38px;font-weight:800;letter-spacing:14px;color:${ACCENT};
        font-variant-numeric:tabular-nums;">${otp}</span>
    </div>
    <p style="margin:0;font-size:12px;color:#5C5975;text-align:center;">
      Expires in <strong style="color:#9B98B0;">10 minutes</strong> · 
      If you didn't request this, ignore this email.
    </p>
  `
  await sendMail({
    to: email,
    subject: `${otp} — TeamCentre ${isReset ? 'password reset' : 'verification'} code`,
    html: layout(content),
  })
}


// ── All other templates ─────────────────────────────────────
export const templates = {

  mention: (mentionedBy, context) => ({
    subject: `${mentionedBy} mentioned you on TeamCentre`,
    html: layout(`
      ${iconBadge('💬')}
      ${heading('You were mentioned', `<strong style="color:#E8E6F0;">${mentionedBy}</strong> mentioned you in a comment.`)}
      <div style="background:#1C1B30;border-left:3px solid ${ACCENT};border-radius:0 8px 8px 0;padding:14px 16px;">
        <p style="margin:0;font-size:13px;color:#9B98B0;line-height:1.6;">${context}</p>
      </div>
      ${button('View comment', BASE_URL)}
    `),
  }),

  goalAssigned: (goalTitle) => ({
    subject: `New goal assigned: ${goalTitle}`,
    html: layout(`
      ${iconBadge('🎯')}
      ${heading('Goal assigned to you', 'You have been assigned as the owner of a new goal.')}
      ${infoRow('Goal', goalTitle)}
      ${button('View goal', `${BASE_URL}/goals`)}
    `),
  }),

  goalStatusChanged: (goalTitle, status) => {
    const statusColors = {
      ON_TRACK: '#4ade80',
      AT_RISK: '#fbbf24',
      COMPLETED: '#60a5fa',
      CANCELLED: '#9B98B0',
    }
    const color = statusColors[status] || '#9B98B0'
    const label = status.replace('_', ' ')
    return {
      subject: `Goal status updated: ${goalTitle}`,
      html: layout(`
        ${iconBadge('📊')}
        ${heading('Goal status changed', `The status of a goal you're tracking has been updated.`)}
        ${infoRow('Goal', goalTitle)}
        ${infoRow('New status', `<span style="color:${color};font-weight:700;">${label}</span>`)}
        ${button('View goal', `${BASE_URL}/goals`)}
      `),
    }
  },

  newAnnouncement: (title, workspaceName) => ({
    subject: `New announcement in ${workspaceName}`,
    html: layout(`
      ${iconBadge('📢')}
      ${heading('New announcement', `A new announcement was posted in <strong style="color:#E8E6F0;">${workspaceName}</strong>.`)}
      ${infoRow('Announcement', title)}
      ${button('Read announcement', `${BASE_URL}/announcements`)}
    `),
  }),

  actionItemAssigned: (itemTitle) => ({
    subject: `Action item assigned to you: ${itemTitle}`,
    html: layout(`
      ${iconBadge('✅')}
      ${heading('Action item assigned', 'You have been assigned a new action item.')}
      ${infoRow('Item', itemTitle)}
      ${button('View action items', `${BASE_URL}/action-items`)}
    `),
  }),

  workspaceInvite: (inviterName, workspaceName) => ({
    subject: `You've been invited to ${workspaceName}`,
    html: layout(`
      ${iconBadge('🤝')}
      ${heading(
        `You're invited to join ${workspaceName}`,
        `<strong style="color:#E8E6F0;">${inviterName}</strong> has invited you to collaborate on TeamCentre.`
      )}
      ${infoRow('Workspace', workspaceName)}
      ${infoRow('Invited by', inviterName)}
      ${divider()}
      ${button('Accept invitation', `${BASE_URL}/login`)}
      <p style="text-align:center;margin-top:16px;font-size:11px;color:#5C5975;">
        Log in to your TeamCentre account to access the workspace.
      </p>
    `),
  }),

}