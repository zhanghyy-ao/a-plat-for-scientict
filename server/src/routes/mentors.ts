import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticateToken } from './auth.js'

const router = Router()
const prisma = new PrismaClient()

router.get('/', async (req, res) => {
  try {
    const mentors = await prisma.user.findMany({
      where: { role: 'mentor' },
      select: {
        id: true,
        nickname: true,
        avatar: true,
        email: true,
        createdAt: true,
        mentor: true,
      },
    })
    res.json(mentors)
  } catch (error) {
    console.error('Get mentors error:', error)
    res.json([])
  }
})

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const mentor = await prisma.user.findFirst({
      where: { id, role: 'mentor' },
      select: {
        id: true,
        nickname: true,
        avatar: true,
        email: true,
        createdAt: true,
        mentor: true,
      },
    })
    if (!mentor) {
      return res.status(404).json({ error: '导师不存在' })
    }
    res.json(mentor)
  } catch (error) {
    console.error('Get mentor error:', error)
    res.status(500).json({ error: '获取导师信息失败' })
  }
})

export default router
