import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

router.get('/', async (_req, res) => {
  try {
    const news = await prisma.news.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
    res.json(news)
  } catch (error) {
    res.json([])
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const news = await prisma.news.findUnique({
      where: { id },
    })
    if (!news) {
      return res.status(404).json({ error: '新闻不存在' })
    }
    res.json(news)
  } catch (error) {
    res.status(500).json({ error: '获取新闻失败' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { title, content, author, category, imageUrl } = req.body
    const news = await prisma.news.create({
      data: {
        title,
        content,
        author,
        category,
        imageUrl,
      },
    })
    res.status(201).json(news)
  } catch (error) {
    res.status(500).json({ error: '创建新闻失败' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, content, author, category, imageUrl } = req.body
    const news = await prisma.news.update({
      where: { id },
      data: { title, content, author, category, imageUrl },
    })
    res.json(news)
  } catch (error) {
    res.status(500).json({ error: '更新新闻失败' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.news.delete({ where: { id } })
    res.json({ message: '删除成功' })
  } catch (error) {
    res.status(500).json({ error: '删除新闻失败' })
  }
})

export default router
