import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding...')

  await prisma.reaction.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.announcement.deleteMany()
  await prisma.actionItem.deleteMany()
  await prisma.milestone.deleteMany()
  await prisma.goalUpdate.deleteMany()
  await prisma.goal.deleteMany()
  await prisma.workspaceMember.deleteMany()
  await prisma.workspace.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.user.deleteMany()

  const hash = await bcrypt.hash('pass', 10)

  // Create 7 users (80% Bangladeshi, 20% foreign)
  const [arif, bristy, tanvir, danish, evan, fahim, george] = await Promise.all([
    prisma.user.create({ data: { name: 'Arif Hossain',     email: 'a@a.com', passwordHash: hash } }), // BD
    prisma.user.create({ data: { name: 'Bristy Rahman',    email: 'b@b.com', passwordHash: hash } }), // BD
    prisma.user.create({ data: { name: 'Chowdhury Tanvir', email: 'c@c.com', passwordHash: hash } }), // BD
    prisma.user.create({ data: { name: 'Danish Uddin',     email: 'd@d.com', passwordHash: hash } }), // BD (male Muslim)
    prisma.user.create({ data: { name: 'Evan Walsh',       email: 'e@e.com', passwordHash: hash } }), // Foreign
    prisma.user.create({ data: { name: 'Fahim Chowdhury',  email: 'f@f.com', passwordHash: hash } }), // BD (male Muslim)
    prisma.user.create({ data: { name: 'George Osei',      email: 'g@g.com', passwordHash: hash } }), // Foreign
  ])

  // Create workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Acme Product Team',
      accentColor: '#7C3AED',
      members: {
        create: [
          { userId: arif.id,   role: 'ADMIN' },
          { userId: bristy.id, role: 'MEMBER' },
          { userId: tanvir.id, role: 'MEMBER' },
          { userId: danish.id, role: 'MEMBER' },
          { userId: evan.id,   role: 'MEMBER' },
          { userId: fahim.id,  role: 'MEMBER' },
          { userId: george.id, role: 'MEMBER' },
        ]
      }
    }
  })

  const w = workspace.id

  // ── GOALS ──────────────────────────────────────────────────────────────
  const goal1 = await prisma.goal.create({
    data: {
      title: 'Launch v2.0 of mobile app',
      description: 'Complete redesign and ship to both app stores by end of Q2.',
      status: 'ON_TRACK',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      workspaceId: w, ownerId: arif.id,
      milestones: {
        create: [
          { title: 'Finalize UI designs', completed: true, progress: 100 },
          { title: 'Complete backend API', completed: true, progress: 100 },
          { title: 'Beta testing with 50 users', completed: true, progress: 100 },
          { title: 'App store submission', completed: false, progress: 40 },
          { title: 'Marketing launch', completed: false, progress: 10 },
        ]
      }
    }
  })

  const goal2 = await prisma.goal.create({
    data: {
      title: 'Grow to 10k monthly active users',
      description: 'Marketing and growth initiatives targeting Q2 milestones.',
      status: 'AT_RISK',
      dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      workspaceId: w, ownerId: bristy.id,
      milestones: {
        create: [
          { title: 'Launch referral program', completed: true, progress: 100 },
          { title: 'Partnership with 5 influencers', completed: false, progress: 60 },
          { title: 'Paid ads campaign live', completed: false, progress: 30 },
          { title: 'Reach 7k MAU checkpoint', completed: false, progress: 0 },
        ]
      }
    }
  })

  const goal3 = await prisma.goal.create({
    data: {
      title: 'Reduce churn rate to under 5%',
      description: 'Improve onboarding flow and customer success touchpoints.',
      status: 'COMPLETED',
      dueDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      workspaceId: w, ownerId: tanvir.id,
      createdAt: new Date(Date.now() - 8 * 7 * 24 * 60 * 60 * 1000),
      milestones: {
        create: [
          { title: 'Audit drop-off points', completed: true, progress: 100 },
          { title: 'Redesign onboarding', completed: true, progress: 100 },
          { title: 'Launch in-app support chat', completed: true, progress: 100 },
        ]
      }
    }
  })

  const goal4 = await prisma.goal.create({
    data: {
      title: 'Ship new analytics dashboard',
      description: 'Internal analytics for the ops team with CSV export.',
      status: 'COMPLETED',
      dueDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      workspaceId: w, ownerId: danish.id,
      createdAt: new Date(Date.now() - 6 * 7 * 24 * 60 * 60 * 1000),
      milestones: {
        create: [
          { title: 'Define KPIs with stakeholders', completed: true, progress: 100 },
          { title: 'Build chart components', completed: true, progress: 100 },
          { title: 'CSV export endpoint', completed: true, progress: 100 },
        ]
      }
    }
  })

  const goal5 = await prisma.goal.create({
    data: {
      title: 'Improve API response time by 40%',
      description: 'Database query optimization and caching layer.',
      status: 'COMPLETED',
      dueDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
      workspaceId: w, ownerId: evan.id,
      createdAt: new Date(Date.now() - 4 * 7 * 24 * 60 * 60 * 1000),
      milestones: {
        create: [
          { title: 'Profile slow queries', completed: true, progress: 100 },
          { title: 'Add Redis caching', completed: true, progress: 100 },
          { title: 'Load test and benchmark', completed: true, progress: 100 },
        ]
      }
    }
  })

  const goal6 = await prisma.goal.create({
    data: {
      title: 'GDPR compliance audit',
      description: 'Ensure all data handling meets GDPR requirements.',
      status: 'COMPLETED',
      dueDate: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000),
      workspaceId: w, ownerId: fahim.id,
      createdAt: new Date(Date.now() - 2 * 7 * 24 * 60 * 60 * 1000),
      milestones: {
        create: [
          { title: 'Data inventory mapping', completed: true, progress: 100 },
          { title: 'Update privacy policy', completed: true, progress: 100 },
          { title: 'User data deletion flow', completed: true, progress: 100 },
        ]
      }
    }
  })

  const goal7 = await prisma.goal.create({
    data: {
      title: 'Hire 3 senior engineers',
      description: 'Expand the engineering team for H2 roadmap.',
      status: 'AT_RISK',
      dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      workspaceId: w, ownerId: george.id,
      milestones: {
        create: [
          { title: 'Post job descriptions', completed: true, progress: 100 },
          { title: 'First round interviews', completed: true, progress: 100 },
          { title: 'Technical assessments', completed: false, progress: 50 },
          { title: 'Offers sent', completed: false, progress: 0 },
        ]
      }
    }
  })

  // ── GOAL UPDATES ───────────────────────────────────────────────────────
  await prisma.goalUpdate.createMany({
    data: [
      { content: 'Beta testing started! 50 users onboarded, feedback is mostly positive.', goalId: goal1.id, authorId: arif.id },
      { content: 'App store submission in progress, expecting approval within 5 days.', goalId: goal1.id, authorId: arif.id },
      { content: 'Referral program live. Seeing 12% week-over-week growth from referrals.', goalId: goal2.id, authorId: bristy.id },
      { content: 'MAU at 6.2k — need to accelerate paid campaigns to hit 10k by deadline.', goalId: goal2.id, authorId: bristy.id },
      { content: 'Onboarding redesign shipped. Early data shows 18% reduction in drop-off.', goalId: goal3.id, authorId: tanvir.id },
      { content: 'Churn now at 4.3% — goal achieved! Monitoring for 2 more weeks.', goalId: goal3.id, authorId: tanvir.id },
      { content: 'Dashboard shipped to production. Ops team very happy with CSV export.', goalId: goal4.id, authorId: danish.id },
      { content: 'API p95 response time down from 420ms to 210ms after Redis caching.', goalId: goal5.id, authorId: evan.id },
      { content: 'GDPR audit complete. Legal team signed off on all changes.', goalId: goal6.id, authorId: fahim.id },
      { content: 'Two strong candidates from technical round. Offers going out this week.', goalId: goal7.id, authorId: george.id },
    ]
  })

  // ── ACTION ITEMS ───────────────────────────────────────────────────────
  await prisma.actionItem.createMany({
    data: [
      { title: 'Fix crash on iOS 17 login screen', priority: 'HIGH', status: 'TODO', workspaceId: w, assigneeId: arif.id, goalId: goal1.id },
      { title: 'Write release notes for v2.0', priority: 'MEDIUM', status: 'IN_PROGRESS', workspaceId: w, assigneeId: arif.id, goalId: goal1.id },
      { title: 'Coordinate with Apple review team', priority: 'HIGH', status: 'TODO', workspaceId: w, assigneeId: bristy.id, goalId: goal1.id },
      { title: 'Set up Google Ads campaign', priority: 'HIGH', status: 'IN_PROGRESS', workspaceId: w, assigneeId: bristy.id, goalId: goal2.id },
      { title: 'Schedule 5 influencer calls', priority: 'MEDIUM', status: 'TODO', workspaceId: w, assigneeId: tanvir.id, goalId: goal2.id },
      { title: 'A/B test landing page headlines', priority: 'MEDIUM', status: 'IN_PROGRESS', workspaceId: w, assigneeId: danish.id, goalId: goal2.id },
      { title: 'Add user data export button to settings', priority: 'HIGH', status: 'DONE', workspaceId: w, assigneeId: evan.id, goalId: goal6.id },
      { title: 'Update cookie consent banner', priority: 'MEDIUM', status: 'DONE', workspaceId: w, assigneeId: fahim.id, goalId: goal6.id },
      { title: 'Send offer letters to candidates', priority: 'HIGH', status: 'TODO', workspaceId: w, assigneeId: george.id, goalId: goal7.id },
      { title: 'Optimize N+1 queries in goals endpoint', priority: 'HIGH', status: 'DONE', workspaceId: w, assigneeId: evan.id, goalId: goal5.id },
      { title: 'Document new analytics API endpoints', priority: 'LOW', status: 'TODO', workspaceId: w, assigneeId: danish.id },
      { title: 'Review Q3 roadmap with stakeholders', priority: 'MEDIUM', status: 'TODO', workspaceId: w, assigneeId: arif.id },
      { title: 'Update onboarding email sequence', priority: 'LOW', status: 'DONE', workspaceId: w, assigneeId: tanvir.id, goalId: goal3.id },
      { title: 'Set up error monitoring alerts', priority: 'MEDIUM', status: 'IN_PROGRESS', workspaceId: w, assigneeId: evan.id },
      { title: 'Prepare Q2 retrospective slides', priority: 'LOW', status: 'TODO', workspaceId: w, assigneeId: fahim.id },
    ]
  })

  // ── ANNOUNCEMENTS ──────────────────────────────────────────────────────
  const ann1 = await prisma.announcement.create({
    data: {
      title: '🎉 Welcome to Acme Product Team Hub!',
      content: 'This is our central place for goals, action items, and team updates. Everyone please review your assigned action items and update statuses weekly. Let\'s build something great together!',
      pinned: true,
      workspaceId: w, authorId: arif.id,
    }
  })

  const ann2 = await prisma.announcement.create({
    data: {
      title: 'Q2 Planning Complete — Goals Assigned',
      content: 'We\'ve finalized our Q2 goals and assigned ownership. Please review your goals, check milestones, and reach out if you have capacity concerns. Our main focus areas are: mobile app launch, user growth, and team expansion.',
      pinned: true,
      workspaceId: w, authorId: arif.id,
    }
  })

  const ann3 = await prisma.announcement.create({
    data: {
      title: 'API Performance Improvements Shipped 🚀',
      content: 'Evan and the backend team have completed the API optimization sprint. Response times are down ~50% on average. This should significantly improve app performance for end users.',
      pinned: false,
      workspaceId: w, authorId: evan.id,
    }
  })

  const ann4 = await prisma.announcement.create({
    data: {
      title: 'GDPR Audit Passed ✅',
      content: 'Great news — our GDPR compliance audit is complete and legal has signed off. All data handling flows are now fully compliant. Big thanks to Fahim for leading this effort.',
      pinned: false,
      workspaceId: w, authorId: fahim.id,
    }
  })

  const ann5 = await prisma.announcement.create({
    data: {
      title: 'New Hiring Update — 2 Offers Sent',
      content: 'We\'ve completed technical interviews and sent offers to 2 senior engineers. Expecting responses by end of week. George will share final updates once accepted.',
      pinned: false,
      workspaceId: w, authorId: george.id,
    }
  })

  // ── REACTIONS ──────────────────────────────────────────────────────────
  await prisma.reaction.createMany({
    data: [
      { emoji: '🎉', announcementId: ann1.id, userId: bristy.id },
      { emoji: '🎉', announcementId: ann1.id, userId: tanvir.id },
      { emoji: '🎉', announcementId: ann1.id, userId: danish.id },
      { emoji: '👍', announcementId: ann1.id, userId: evan.id },
      { emoji: '👍', announcementId: ann1.id, userId: fahim.id },
      { emoji: '❤️', announcementId: ann1.id, userId: george.id },
      { emoji: '👍', announcementId: ann2.id, userId: bristy.id },
      { emoji: '👍', announcementId: ann2.id, userId: tanvir.id },
      { emoji: '🔥', announcementId: ann3.id, userId: arif.id },
      { emoji: '🔥', announcementId: ann3.id, userId: danish.id },
      { emoji: '🎉', announcementId: ann3.id, userId: bristy.id },
      { emoji: '✅', announcementId: ann4.id, userId: arif.id },
      { emoji: '👍', announcementId: ann4.id, userId: tanvir.id },
      { emoji: '🎉', announcementId: ann5.id, userId: bristy.id },
    ]
  })

  // ── COMMENTS ───────────────────────────────────────────────────────────
  await prisma.comment.createMany({
    data: [
      { content: 'So excited to finally have this! 🙌', announcementId: ann1.id, userId: bristy.id },
      { content: 'Looking forward to a great Q2!', announcementId: ann1.id, userId: tanvir.id },
      { content: 'Thanks for setting this up Arif bhai!', announcementId: ann1.id, userId: danish.id },
      { content: 'Goals look great. Let\'s crush it!', announcementId: ann2.id, userId: evan.id },
      { content: 'Happy to help with the growth goal if needed.', announcementId: ann2.id, userId: fahim.id },
      { content: 'Amazing work on the API Evan! Noticed the difference immediately.', announcementId: ann3.id, userId: arif.id },
      { content: 'The app feels so much snappier now 🔥', announcementId: ann3.id, userId: bristy.id },
      { content: 'Huge thanks to Fahim bhai for handling all the legal coordination.', announcementId: ann4.id, userId: arif.id },
      { content: 'Fingers crossed on the offers! 🤞', announcementId: ann5.id, userId: danish.id },
      { content: 'Exciting! Can\'t wait to grow the team.', announcementId: ann5.id, userId: evan.id },
    ]
  })

  console.log('✅ Seed complete!')
  console.log('Users: a@a.com, b@b.com, c@c.com, d@d.com, e@e.com, f@f.com, g@g.com')
  console.log('Password for all: pass')
  console.log('Admin: a@a.com')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())