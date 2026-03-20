import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { PrismaClient } from '@prisma/client'
import aiRoutes from './routes/ai.js'
import adminAiUsageRoutes from './routes/adminAiUsage.js'
import aiStreamRoutes from './routes/aiStream.js'
import authRoutes from './routes/auth.js'
import myRoutes from './routes/my.js'
import progressRoutes from './routes/progress.js'
import tasksRoutes from './routes/tasks.js'
import appointmentsRoutes from './routes/appointments.js'
import notificationsRoutes from './routes/notifications.js'
import newsRoutes from './routes/news.js'
import achievementsRoutes from './routes/achievements.js'
import messagesRoutes from './routes/messages.js'
import mentorsRoutes from './routes/mentors.js'
import usersRoutes from './routes/users.js'

const app = express()
app.use(cors())
app.use(express.json())

const httpServer = createServer(app)
const io = new Server(httpServer, { cors: { origin: '*' } })
const prisma = new PrismaClient()

// Health
app.get('/api/health', (_, res) => res.json({ ok: true }))

// Users
app.get('/api/users', async (_, res) => {
  const users = await prisma.user.findMany({ take: 200, orderBy: { createdAt: 'desc' } })
  res.json(users)
})

// Conversations
app.get('/api/conversations', async (_req, res) => {
  const convs = await prisma.conversation.findMany({ take: 50, orderBy: { createdAt: 'desc' } })
  res.json(convs)
})

// Pin/Unpin
app.post('/api/conversations/:id/pin', async (req, res) => {
  const { id } = req.params
  const { userId, pin } = req.body as { userId: string; pin: boolean }
  try {
    if (pin) {
      await prisma.conversation.update({ where: { id }, data: { pinnedBy: { connect: { id: userId } } } })
    } else {
      await prisma.conversation.update({ where: { id }, data: { pinnedBy: { disconnect: { id: userId } } } })
    }
    res.json({ ok: true })
  } catch (e) {
    res.status(400).json({ ok: false, error: String(e) })
  }
})

// Mute/Unmute
app.post('/api/conversations/:id/mute', async (req, res) => {
  const { id } = req.params
  const { userId, mute } = req.body as { userId: string; mute: boolean }
  try {
    if (mute) {
      await prisma.conversation.update({ where: { id }, data: { mutedBy: { connect: { id: userId } } } })
    } else {
      await prisma.conversation.update({ where: { id }, data: { mutedBy: { disconnect: { id: userId } } } })
    }
    res.json({ ok: true })
  } catch (e) {
    res.status(400).json({ ok: false, error: String(e) })
  }
})

// Messages
app.get('/api/conversations/:id/messages', async (req, res) => {
  const { id } = req.params
  const msgs = await prisma.message.findMany({ where: { conversationId: id }, orderBy: { createdAt: 'asc' } })
  res.json(msgs)
})

app.post('/api/conversations/:id/messages', async (req, res) => {
  const { id } = req.params
  const { senderId, content, messageType, replyToId } = req.body
  const msg = await prisma.message.create({
    data: {
      conversationId: id,
      senderId,
      content,
      messageType: messageType ?? 'text',
      replyToId: replyToId ?? null
    }
  })
  io.to(`conv:${id}`).emit('new_message', msg)
  res.json(msg)
})

// Recall
app.post('/api/messages/:id/recall', async (req, res) => {
  const { id } = req.params
  try {
    const msg = await prisma.message.update({ where: { id }, data: { isRecalled: true, content: '' } })
    io.to(`conv:${msg.conversationId}`).emit('message_recalled', { id: msg.id })
    res.json({ ok: true })
  } catch (e) {
    res.status(400).json({ ok: false, error: String(e) })
  }
})

// Reads
app.post('/api/messages/:id/read', async (req, res) => {
  const { id } = req.params
  const { userId } = req.body
  const read = await prisma.messageRead.create({ data: { messageId: id, userId } })
  io.to(`conv:${(await prisma.message.findUnique({ where: { id } }))?.conversationId}`).emit('message_read', { messageId: id, userId })
  res.json(read)
})

// AI Routes
app.use('/api/ai', aiRoutes)
app.use('/api/admin/ai-usage', adminAiUsageRoutes)
app.use('/api/ai', aiStreamRoutes)

// Auth Routes
app.use('/api/auth', authRoutes)

// My Routes (current user related)
app.use('/api/my', myRoutes)

// Progress Routes
app.use('/api/progress', progressRoutes)

// Tasks Routes
app.use('/api/tasks', tasksRoutes)

// Appointments Routes
app.use('/api/appointments', appointmentsRoutes)

// Notifications Routes
app.use('/api/notifications', notificationsRoutes)

// News Routes
app.use('/api/news', newsRoutes)

// Achievements Routes
app.use('/api/achievements', achievementsRoutes)

// Messages Routes
app.use('/api/messages', messagesRoutes)

// Mentors Routes
app.use('/api/mentors', mentorsRoutes)

// Users Routes
app.use('/api/users', usersRoutes)

// WS
io.on('connection', (socket) => {
  socket.on('join_conversation', ({ conversationId }) => {
    socket.join(`conv:${conversationId}`)
  })
  socket.on('leave_conversation', ({ conversationId }) => {
    socket.leave(`conv:${conversationId}`)
  })
  socket.on('typing', ({ conversationId, userId }) => {
    socket.to(`conv:${conversationId}`).emit('user_typing', { userId })
  })
  
  // AI相关WebSocket事件
  socket.on('join_ai_session', ({ sessionId }) => {
    socket.join(`ai:${sessionId}`)
  })
  socket.on('leave_ai_session', ({ sessionId }) => {
    socket.leave(`ai:${sessionId}`)
  })
  socket.on('ai_typing', ({ sessionId, agentType }) => {
    socket.to(`ai:${sessionId}`).emit('ai_typing', { agentType })
  })
})

const PORT = Number(process.env.PORT || 4000)
httpServer.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`)
})
