import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticateToken } from './auth.js'

const router = Router()
const prisma = new PrismaClient()

router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user
    
    const messages = await prisma.message2.findMany({
      where: {
        OR: [
          { senderId: user.id },
          { receiverId: user.id },
        ],
      },
      include: {
        sender: {
          select: { id: true, nickname: true, avatar: true },
        },
        receiver: {
          select: { id: true, nickname: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    
    res.json(messages)
  } catch (error) {
    console.error('Get messages error:', error)
    res.json([])
  }
})

router.get('/conversation/:userId', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user
    const { userId } = req.params
    
    const messages = await prisma.message2.findMany({
      where: {
        OR: [
          { senderId: user.id, receiverId: userId },
          { senderId: userId, receiverId: user.id },
        ],
      },
      include: {
        sender: {
          select: { id: true, nickname: true, avatar: true },
        },
        receiver: {
          select: { id: true, nickname: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    })
    
    res.json(messages)
  } catch (error) {
    console.error('Get conversation error:', error)
    res.json([])
  }
})

router.post('/', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user
    const { receiverId, content, messageType, fileUrl } = req.body
    
    if (!receiverId || !content) {
      return res.status(400).json({ error: '接收者和内容不能为空' })
    }
    
    const message = await prisma.message2.create({
      data: {
        senderId: user.id,
        receiverId,
        content,
        messageType: messageType || 'text',
        fileUrl,
      },
      include: {
        sender: {
          select: { id: true, nickname: true, avatar: true },
        },
        receiver: {
          select: { id: true, nickname: true, avatar: true },
        },
      },
    })
    
    res.status(201).json(message)
  } catch (error) {
    console.error('Send message error:', error)
    res.status(500).json({ error: '发送消息失败' })
  }
})

export default router
