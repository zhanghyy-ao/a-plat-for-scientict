import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

router.get('/', async (_req, res) => {
  try {
    const achievements = await prisma.achievement.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
    res.json(achievements)
  } catch (error) {
    res.json([])
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const achievement = await prisma.achievement.findUnique({
      where: { id },
    })
    if (!achievement) {
      return res.status(404).json({ error: '成果不存在' })
    }
    res.json(achievement)
  } catch (error) {
    res.status(500).json({ error: '获取成果失败' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { title, description, author, type, imageUrl, link } = req.body
    const achievement = await prisma.achievement.create({
      data: {
        title,
        description,
        author,
        type,
        imageUrl,
        link,
      },
    })
    res.status(201).json(achievement)
  } catch (error) {
    res.status(500).json({ error: '创建成果失败' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, author, type, imageUrl, link } = req.body
    const achievement = await prisma.achievement.update({
      where: { id },
      data: { title, description, author, type, imageUrl, link },
    })
    res.json(achievement)
  } catch (error) {
    res.status(500).json({ error: '更新成果失败' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.achievement.delete({ where: { id } })
    res.json({ message: '删除成功' })
  } catch (error) {
    res.status(500).json({ error: '删除成果失败' })
  }
})

export default router
