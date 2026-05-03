import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding...')

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

  // ── USERS ──────────────────────────────────────────────────────────────
  const [alpha, bravo, charlie, delta, echo, foxtrot, golf] = await Promise.all([
    prisma.user.create({ data: { name: 'Alpha Khan',        email: 'a@a.com', passwordHash: hash, emailVerified: true } }),
    prisma.user.create({ data: { name: 'Bravo Mia',         email: 'b@b.com', passwordHash: hash, emailVerified: true } }),
    prisma.user.create({ data: { name: 'Chowdhury Delta',   email: 'c@c.com', passwordHash: hash, emailVerified: true } }),
    prisma.user.create({ data: { name: 'Danish Quasar',     email: 'd@d.com', passwordHash: hash, emailVerified: true } }),
    prisma.user.create({ data: { name: 'Echo Rahman',       email: 'e@e.com', passwordHash: hash, emailVerified: true } }),
    prisma.user.create({ data: { name: 'Foxtrot Hossain',   email: 'f@f.com', passwordHash: hash, emailVerified: true } }),
    prisma.user.create({ data: { name: 'Golf Neutron',      email: 'g@g.com', passwordHash: hash, emailVerified: true } }),
  ])

  // ── WORKSPACE 1 — Tech Startup ─────────────────────────────────────────
  const ws1 = await prisma.workspace.create({
    data: {
      name: 'Quantum Launchpad',
      accentColor: '#7C3AED',
      members: {
        create: [
          { userId: alpha.id,   role: 'ADMIN' },
          { userId: bravo.id,   role: 'MEMBER' },
          { userId: charlie.id, role: 'MEMBER' },
          { userId: delta.id,   role: 'MEMBER' },
          { userId: echo.id,    role: 'MEMBER' },
          { userId: foxtrot.id, role: 'MEMBER' },
          { userId: golf.id,    role: 'MEMBER' },
        ]
      }
    }
  })

  // ── WORKSPACE 2 — Design Team ──────────────────────────────────────────
  const ws2 = await prisma.workspace.create({
    data: {
      name: 'Pixel Syndicate',
      accentColor: '#0EA5E9',
      members: {
        create: [
          { userId: bravo.id,   role: 'ADMIN' },
          { userId: alpha.id,   role: 'MEMBER' },
          { userId: charlie.id, role: 'MEMBER' },
          { userId: delta.id,   role: 'MEMBER' },
        ]
      }
    }
  })

  const w = ws1.id
  const w2 = ws2.id

  // ── GOALS — WS1 ────────────────────────────────────────────────────────

  const goal1 = await prisma.goal.create({
    data: {
      title: 'Launch v3.0 of NeuralSync App',
      description: 'Complete the full redesign, squash all critical bugs, and ship to both app stores before Eid ul Adha. No pressure 😅',
      status: 'ON_TRACK',
      progress: 65,
      dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
      workspaceId: w, ownerId: alpha.id,
      milestones: {
        create: [
          { title: 'UI redesign finalized', completed: true },
          { title: 'Backend API v3 complete', completed: true },
          { title: 'Beta test with 100 users', completed: true },
          { title: 'Fix all P0/P1 bugs', completed: false },
          { title: 'App store submission', completed: false },
          { title: 'Marketing blast on launch day', completed: false },
        ]
      }
    }
  })

  const goal2 = await prisma.goal.create({
    data: {
      title: 'Reach 25k MAU by Q3',
      description: 'Growth target. If we don\'t hit this, Chowdhury Delta has to eat biryani with a fork.',
      status: 'AT_RISK',
      progress: 38,
      dueDate: new Date(Date.now() + 52 * 24 * 60 * 60 * 1000),
      workspaceId: w, ownerId: bravo.id,
      milestones: {
        create: [
          { title: 'Launch referral program', completed: true },
          { title: 'TikTok campaign with 3 creators', completed: false },
          { title: 'SEO audit and fix', completed: false },
          { title: 'Hit 15k MAU checkpoint', completed: false },
          { title: 'Paid ads ROI positive', completed: false },
        ]
      }
    }
  })

  const goal3 = await prisma.goal.create({
    data: {
      title: 'Reduce server costs by 30%',
      description: 'Current AWS bill is giving us existential dread. Time to optimize.',
      status: 'COMPLETED',
      progress: 100,
      dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      workspaceId: w, ownerId: charlie.id,
      milestones: {
        create: [
          { title: 'Audit all running services', completed: true },
          { title: 'Migrate to spot instances', completed: true },
          { title: 'Set up auto-scaling', completed: true },
          { title: 'Shut down zombie containers', completed: true },
        ]
      }
    }
  })

  const goal4 = await prisma.goal.create({
    data: {
      title: 'Ship Dark Mode (Finally)',
      description: 'Users have been asking since 2022. It\'s embarrassing at this point.',
      status: 'COMPLETED',
      progress: 100,
      dueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      workspaceId: w, ownerId: delta.id,
      milestones: {
        create: [
          { title: 'Design tokens defined', completed: true },
          { title: 'All components updated', completed: true },
          { title: 'System preference detection', completed: true },
          { title: 'QA on 5 devices', completed: true },
        ]
      }
    }
  })

  const goal5 = await prisma.goal.create({
    data: {
      title: 'Hire 4 Engineers Before Ramadan',
      description: 'Ambitious? Yes. Necessary? Also yes.',
      status: 'AT_RISK',
      progress: 40,
      dueDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
      workspaceId: w, ownerId: echo.id,
      milestones: {
        create: [
          { title: 'Post JDs on LinkedIn and Bdjobs', completed: true },
          { title: 'Screen 50 CVs', completed: true },
          { title: 'First round interviews done', completed: false },
          { title: 'Technical assessments sent', completed: false },
          { title: 'Offers accepted', completed: false },
        ]
      }
    }
  })

  const goal6 = await prisma.goal.create({
    data: {
      title: 'ISO 27001 Security Certification',
      description: 'Enterprise clients are demanding it. Let\'s get it done.',
      status: 'ON_TRACK',
      progress: 55,
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      workspaceId: w, ownerId: foxtrot.id,
      milestones: {
        create: [
          { title: 'Gap analysis complete', completed: true },
          { title: 'Security policy documents', completed: true },
          { title: 'Staff security training', completed: false },
          { title: 'Internal audit', completed: false },
          { title: 'External auditor booked', completed: false },
        ]
      }
    }
  })

  const goal7 = await prisma.goal.create({
    data: {
      title: 'Integrate AI Chatbot (GPT-powered)',
      description: 'Everyone else has one. Time to join the bandwagon — but make it actually useful.',
      status: 'ON_TRACK',
      progress: 30,
      dueDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
      workspaceId: w, ownerId: golf.id,
      milestones: {
        create: [
          { title: 'OpenAI API integration', completed: true },
          { title: 'Training on product docs', completed: false },
          { title: 'Chat UI component', completed: false },
          { title: 'User testing round 1', completed: false },
        ]
      }
    }
  })

  // ── GOALS — WS2 ────────────────────────────────────────────────────────
  const goal8 = await prisma.goal.create({
    data: {
      title: 'Rebrand entire product UI',
      description: 'New logo, new colours, new energy. Out with the old gradient mess.',
      status: 'ON_TRACK',
      progress: 50,
      dueDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
      workspaceId: w2, ownerId: bravo.id,
      milestones: {
        create: [
          { title: 'Logo design finalized', completed: true },
          { title: 'Colour system defined', completed: true },
          { title: 'Component library updated', completed: false },
          { title: 'Landing page redesign', completed: false },
        ]
      }
    }
  })

  // ── GOAL UPDATES ───────────────────────────────────────────────────────
  await prisma.goalUpdate.createMany({
    data: [
      { content: 'Beta feedback is in — 87% satisfaction. Only complaint is the font size on Android. Classic.', goalId: goal1.id, authorId: alpha.id, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { content: 'P0 bug fixed — the one that crashed the app when someone typed their name in Arabic. Embarrassing but fixed.', goalId: goal1.id, authorId: charlie.id, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { content: 'Referral program live since Monday. 340 new signups from it already — not bad!', goalId: goal2.id, authorId: bravo.id, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { content: 'MAU at 9.4k. We need to hit 12k by end of month or this goal is toast. @Alpha Khan can we boost the ads budget?', goalId: goal2.id, authorId: bravo.id, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { content: 'Migrated 12 services to spot instances. Bill dropped from $4,200 to $2,900 in the first week alone 🎉', goalId: goal3.id, authorId: charlie.id, createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
      { content: 'Goal complete! Final savings: 34%. We came in above target. Someone owe me a cup of cha.', goalId: goal3.id, authorId: charlie.id, createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
      { content: 'Dark mode shipped to prod. If you find a single white pixel that shouldn\'t be there, please don\'t tell me tonight.', goalId: goal4.id, authorId: delta.id, createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000) },
      { content: 'Only 6 CVs worth interviewing from 50 screened. The bar must go up.', goalId: goal5.id, authorId: echo.id, createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
      { content: 'Security policy docs submitted to auditor for review. Fingers crossed.', goalId: goal6.id, authorId: foxtrot.id, createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
      { content: 'OpenAI integration working in dev. The bot answered "who are you?" with "I am a large language model" — we need to fix the persona prompt 😂', goalId: goal7.id, authorId: golf.id, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    ]
  })

  // ── ACTION ITEMS — WS1 ─────────────────────────────────────────────────
  await prisma.actionItem.createMany({
    data: [
      { title: 'Fix crash on Arabic name input (iOS)', priority: 'HIGH', status: 'DONE', workspaceId: w, assigneeId: alpha.id, goalId: goal1.id, dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { title: 'Write App Store release notes for v3.0', priority: 'MEDIUM', status: 'IN_PROGRESS', workspaceId: w, assigneeId: bravo.id, goalId: goal1.id, dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
      { title: 'Coordinate with Apple review team for expedited review', priority: 'HIGH', status: 'TODO', workspaceId: w, assigneeId: charlie.id, goalId: goal1.id, dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      { title: 'Set up retargeting ads on Meta', priority: 'HIGH', status: 'IN_PROGRESS', workspaceId: w, assigneeId: bravo.id, goalId: goal2.id, dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
      { title: 'Negotiate TikTok creator deals', priority: 'MEDIUM', status: 'TODO', workspaceId: w, assigneeId: echo.id, goalId: goal2.id },
      { title: 'A/B test 3 headline variants on landing page', priority: 'MEDIUM', status: 'IN_PROGRESS', workspaceId: w, assigneeId: delta.id, goalId: goal2.id },
      { title: 'Shut down unused staging environment', priority: 'LOW', status: 'DONE', workspaceId: w, assigneeId: charlie.id, goalId: goal3.id },
      { title: 'Book external ISO auditor', priority: 'HIGH', status: 'TODO', workspaceId: w, assigneeId: foxtrot.id, goalId: goal6.id, dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) },
      { title: 'Run staff security training session', priority: 'MEDIUM', status: 'TODO', workspaceId: w, assigneeId: foxtrot.id, goalId: goal6.id },
      { title: 'Fix AI bot persona prompt', priority: 'HIGH', status: 'TODO', workspaceId: w, assigneeId: golf.id, goalId: goal7.id, dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
      { title: 'Build chat UI widget', priority: 'MEDIUM', status: 'IN_PROGRESS', workspaceId: w, assigneeId: golf.id, goalId: goal7.id },
      { title: 'Write technical assessment questions for engineers', priority: 'MEDIUM', status: 'TODO', workspaceId: w, assigneeId: echo.id, goalId: goal5.id },
      { title: 'Send offer letters to 2 selected candidates', priority: 'HIGH', status: 'TODO', workspaceId: w, assigneeId: echo.id, goalId: goal5.id, dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000) },
      { title: 'Update internal API docs', priority: 'LOW', status: 'TODO', workspaceId: w, assigneeId: delta.id },
      { title: 'Prepare Q3 OKR presentation', priority: 'MEDIUM', status: 'IN_PROGRESS', workspaceId: w, assigneeId: alpha.id },
      { title: 'Set up Sentry alerts for new error types', priority: 'MEDIUM', status: 'DONE', workspaceId: w, assigneeId: charlie.id },
      { title: 'Migrate image CDN to Cloudflare', priority: 'LOW', status: 'TODO', workspaceId: w, assigneeId: charlie.id },
      { title: 'Review and close stale GitHub issues', priority: 'LOW', status: 'TODO', workspaceId: w, assigneeId: golf.id },
    ]
  })

  // ── ACTION ITEMS — WS2 ─────────────────────────────────────────────────
  await prisma.actionItem.createMany({
    data: [
      { title: 'Export final logo in all required formats', priority: 'HIGH', status: 'DONE', workspaceId: w2, assigneeId: bravo.id, goalId: goal8.id },
      { title: 'Update Figma component library with new tokens', priority: 'HIGH', status: 'IN_PROGRESS', workspaceId: w2, assigneeId: charlie.id, goalId: goal8.id },
      { title: 'Redesign landing page hero section', priority: 'MEDIUM', status: 'TODO', workspaceId: w2, assigneeId: delta.id, goalId: goal8.id },
      { title: 'Create dark mode design variants', priority: 'MEDIUM', status: 'TODO', workspaceId: w2, assigneeId: bravo.id },
    ]
  })

  // ── ANNOUNCEMENTS — WS1 ────────────────────────────────────────────────
  const ann1 = await prisma.announcement.create({
    data: {
      title: '🚀 Welcome to Quantum Launchpad!',
      content: 'Assalamu Alaikum team! This is our new command centre. All goals, tasks, and announcements live here now. Please — and I cannot stress this enough — actually check it. Unlike the previous tool that shall not be named.',
      pinned: true,
      workspaceId: w, authorId: alpha.id,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    }
  })

  const ann2 = await prisma.announcement.create({
    data: {
      title: 'Q3 Goals Locked In — Let\'s Go 🎯',
      content: 'After 3 hours of debate about what "stretch goal" actually means, we have finalized our Q3 targets. Main priorities: NeuralSync v3 launch, 25k MAU, and the AI chatbot. Owners — please review your milestones and flag any concerns before Friday.',
      pinned: true,
      workspaceId: w, authorId: alpha.id,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    }
  })

  const ann3 = await prisma.announcement.create({
    data: {
      title: 'Server Costs Cut by 34% 💰',
      content: 'Chowdhury Delta pulled off something beautiful. AWS bill is down from $4,200 to $2,780/month. That\'s $17k/year back in our pocket. Treat the man to a proper kacchi biriyani.',
      pinned: false,
      workspaceId: w, authorId: charlie.id,
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    }
  })

  const ann4 = await prisma.announcement.create({
    data: {
      title: 'Dark Mode is LIVE 🌙',
      content: 'After 2 years of user requests, 47 GitHub issues, and one very strongly-worded tweet — dark mode is finally here. Danish Quasar delivered. Please test it and if you find a white pixel that shouldn\'t be there, file a bug. Not a meme.',
      pinned: false,
      workspaceId: w, authorId: delta.id,
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    }
  })

  const ann5 = await prisma.announcement.create({
    data: {
      title: 'Hiring Update — We Need Engineers Yesterday',
      content: 'We are actively hiring 4 senior engineers. If you know anyone strong — frontend, backend, or fullstack — please refer them. Echo Rahman is leading the process. Referral bonus is still on the table.',
      pinned: false,
      workspaceId: w, authorId: echo.id,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    }
  })

  const ann6 = await prisma.announcement.create({
    data: {
      title: 'AI Chatbot Demo — Thursday 3PM 🤖',
      content: 'Golf Neutron will be demoing the first version of our AI assistant on Thursday at 3PM. It currently thinks it\'s ChatGPT so we have some work to do, but the core integration is working. Join the call link in Slack.',
      pinned: false,
      workspaceId: w, authorId: golf.id,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    }
  })

  // ── ANNOUNCEMENTS — WS2 ────────────────────────────────────────────────
  const ann7 = await prisma.announcement.create({
    data: {
      title: '🎨 Rebrand Kickoff — Pixel Syndicate Assembles',
      content: 'New workspace, new energy! The rebrand project is officially underway. Bravo Mia is leading. First deliverable: logo options by end of week. No gradients. No drop shadows. We are better than that.',
      pinned: true,
      workspaceId: w2, authorId: bravo.id,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    }
  })

  // ── REACTIONS ──────────────────────────────────────────────────────────
  await prisma.reaction.createMany({
    data: [
      { emoji: '🎉', announcementId: ann1.id, userId: bravo.id },
      { emoji: '🎉', announcementId: ann1.id, userId: charlie.id },
      { emoji: '🎉', announcementId: ann1.id, userId: delta.id },
      { emoji: '👍', announcementId: ann1.id, userId: echo.id },
      { emoji: '👍', announcementId: ann1.id, userId: foxtrot.id },
      { emoji: '❤️', announcementId: ann1.id, userId: golf.id },
      { emoji: '👍', announcementId: ann2.id, userId: bravo.id },
      { emoji: '👍', announcementId: ann2.id, userId: charlie.id },
      { emoji: '🔥', announcementId: ann2.id, userId: delta.id },
      { emoji: '🔥', announcementId: ann3.id, userId: alpha.id },
      { emoji: '🔥', announcementId: ann3.id, userId: echo.id },
      { emoji: '🎉', announcementId: ann3.id, userId: bravo.id },
      { emoji: '👀', announcementId: ann3.id, userId: golf.id },
      { emoji: '🎉', announcementId: ann4.id, userId: alpha.id },
      { emoji: '🎉', announcementId: ann4.id, userId: bravo.id },
      { emoji: '🔥', announcementId: ann4.id, userId: foxtrot.id },
      { emoji: '👍', announcementId: ann5.id, userId: alpha.id },
      { emoji: '👍', announcementId: ann5.id, userId: charlie.id },
      { emoji: '👀', announcementId: ann6.id, userId: alpha.id },
      { emoji: '👀', announcementId: ann6.id, userId: bravo.id },
      { emoji: '👀', announcementId: ann6.id, userId: delta.id },
      { emoji: '🎉', announcementId: ann7.id, userId: alpha.id },
      { emoji: '🔥', announcementId: ann7.id, userId: charlie.id },
    ]
  })

  // ── COMMENTS ───────────────────────────────────────────────────────────
  await prisma.comment.createMany({
    data: [
      { content: 'Finally! Was using sticky notes before this 😭', announcementId: ann1.id, userId: bravo.id },
      { content: 'JazakAllah khair Alpha bhai for setting this up!', announcementId: ann1.id, userId: foxtrot.id },
      { content: 'Inshallah we crush all goals this quarter 💪', announcementId: ann1.id, userId: delta.id },
      { content: 'The "previous tool" deserved what it got honestly', announcementId: ann1.id, userId: golf.id },
      { content: 'Those MAU goals look spicy. We can do it though.', announcementId: ann2.id, userId: echo.id },
      { content: 'Already updated my milestones. Let\'s go!', announcementId: ann2.id, userId: charlie.id },
      { content: 'Chowdhury Delta you absolute wizard 🧙', announcementId: ann3.id, userId: alpha.id },
      { content: 'And here I thought we needed a bigger budget. Nope, just needed Delta 😂', announcementId: ann3.id, userId: golf.id },
      { content: 'I want the kacchi biriyani in writing please', announcementId: ann3.id, userId: charlie.id },
      { content: 'FINALLY. My eyes thank you Danish Quasar 🙏', announcementId: ann4.id, userId: bravo.id },
      { content: 'Tested on 3 phones, looks great. No rogue white pixels found.', announcementId: ann4.id, userId: foxtrot.id },
      { content: 'Someone on Twitter is already posting screenshots. We\'re viral 👀', announcementId: ann4.id, userId: echo.id },
      { content: 'My uni roommate is looking for a backend role, should I refer?', announcementId: ann5.id, userId: delta.id },
      { content: 'Yes please! Send CV to Echo Rahman directly.', announcementId: ann5.id, userId: echo.id },
      { content: 'Can the bot do my standup updates for me? Asking for a friend.', announcementId: ann6.id, userId: bravo.id },
      { content: 'That is literally one of the features planned 😂', announcementId: ann6.id, userId: golf.id },
      { content: 'Will the demo be recorded? I have a clash at 3PM.', announcementId: ann6.id, userId: foxtrot.id },
      { content: 'YES will record and post in Slack after', announcementId: ann6.id, userId: golf.id },
      { content: 'No gradients is a bold choice but I respect it', announcementId: ann7.id, userId: charlie.id },
      { content: 'Bold choice?? It\'s 2025 Chowdhury 😭', announcementId: ann7.id, userId: bravo.id },
    ]
  })

  console.log('✅ Seed complete!')
  console.log('')
  console.log('─────────────────────────────')
  console.log('  Users (password: pass)')
  console.log('─────────────────────────────')
  console.log('  a@a.com — Alpha Khan (ADMIN, Quantum Launchpad)')
  console.log('  b@b.com — Bravo Mia (ADMIN, Pixel Syndicate)')
  console.log('  c@c.com — Chowdhury Delta')
  console.log('  d@d.com — Danish Quasar')
  console.log('  e@e.com — Echo Rahman')
  console.log('  f@f.com — Foxtrot Hossain')
  console.log('  g@g.com — Golf Neutron')
  console.log('─────────────────────────────')
  console.log('  Workspaces:')
  console.log('  • Quantum Launchpad (violet) — 7 members')
  console.log('  • Pixel Syndicate (blue) — 4 members')
  console.log('─────────────────────────────')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())