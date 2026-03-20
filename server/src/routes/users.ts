import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticateToken } from './auth.js'

const router = Router()
const prisma = new PrismaClient()

router.get('/', authenticateToken, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        nickname: true,
        avatar: true,
        email: true,
        role: true,
        createdAt: true,
        mentor: true,
        student: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json(users)
  } catch (error) {
    console.error('Get users error:', error)
    res.json([])
  }
})

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nickname: true,
        avatar: true,
        email: true,
        role: true,
        createdAt: true,
        mentor: true,
        student: true,
      },
    })
    if (!user) {
      return res.status(404).json({ error: '用户不存在' })
    }
    res.json(user)
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: '获取用户信息失败' })
  }
})

export default router
