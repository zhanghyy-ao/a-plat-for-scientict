import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

router.get('/records', async (req, res) => {
  try {
    const {
      page = '1',
      pageSize = '20',
      userId,
      userRole,
      featureType,
      agentType,
      dateFrom,
      dateTo,
      keyword,
      status,
    } = req.query

    const skip = (parseInt(page as string) - 1) * parseInt(pageSize as string)
    const take = parseInt(pageSize as string)

    const where: any = {}

    if (userId) where.userId = userId as string
    if (userRole) where.userRole = userRole as string
    if (featureType) where.featureType = featureType as string
    if (agentType) where.agentType = agentType as string
    if (status !== undefined) where.isSuccess = status === 'success'

    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = new Date(dateFrom as string)
      if (dateTo) where.createdAt.lte = new Date(dateTo as string)
    }

    if (keyword) {
      where.OR = [
        { userQuery: { contains: keyword as string } },
        { aiResponse: { contains: keyword as string } },
      ]
    }

    const [records, total] = await Promise.all([
      prisma.aiUsageResult.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          userId: true,
          userRole: true,
          featureType: true,
          agentType: true,
          userQuery: true,
          totalTokens: true,
          responseTimeMs: true,
          modelName: true,
          isSuccess: true,
          createdAt: true,
        },
      }),
      prisma.aiUsageResult.count({ where }),
    ])

    res.json({
      ok: true,
      records,
      pagination: {
        page: parseInt(page as string),
        pageSize: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    })
  } catch (error) {
    console.error('Get AI usage records error:', error)
    res.status(500).json({ ok: false, error: String(error) })
  }
})

router.get('/records/:id', async (req, res) => {
  try {
    const { id } = req.params

    const record = await prisma.aiUsageResult.findUnique({
      where: { id },
    })

    if (!record) {
      res.status(404).json({ ok: false, error: 'Record not found' })
      return
    }

    res.json({ ok: true, record })
  } catch (error) {
    console.error('Get AI usage record detail error:', error)
    res.status(500).json({ ok: false, error: String(error) })
  }
})

router.delete('/records/:id', async (req, res) => {
  try {
    const { id } = req.params

    await prisma.aiUsageResult.delete({
      where: { id },
    })

    res.json({ ok: true, message: 'Record deleted successfully' })
  } catch (error) {
    console.error('Delete AI usage record error:', error)
    res.status(500).json({ ok: false, error: String(error) })
  }
})

router.get('/statistics', async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query

    const where: any = {}
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = new Date(dateFrom as string)
      if (dateTo) where.createdAt.lte = new Date(dateTo as string)
    }

    const [
      totalRequests,
      totalTokens,
      activeUsers,
      avgResponseTime,
      successCount,
    ] = await Promise.all([
      prisma.aiUsageResult.count({ where }),
      prisma.aiUsageResult.aggregate({
        where,
        _sum: { totalTokens: true },
      }),
      prisma.aiUsageResult.groupBy({
        where,
        by: ['userId'],
        _count: true,
      }).then((users) => users.length),
      prisma.aiUsageResult.aggregate({
        where,
        _avg: { responseTimeMs: true },
      }),
      prisma.aiUsageResult.count({
        where: { ...where, isSuccess: true },
      }),
    ])

    const featureStats = await prisma.aiUsageResult.groupBy({
      where,
      by: ['featureType'],
      _count: { id: true },
      _sum: { totalTokens: true },
    })

    const roleStats = await prisma.aiUsageResult.groupBy({
      where,
      by: ['userRole'],
      _count: { id: true },
      _sum: { totalTokens: true },
    })

    const dateStats = await prisma.aiUsageResult.groupBy({
      where,
      by: ['createdAt'],
      _count: { id: true },
      _sum: { totalTokens: true },
    })

    res.json({
      ok: true,
      overview: {
        totalRequests,
        totalTokens: totalTokens._sum.totalTokens || 0,
        activeUsers,
        avgResponseTime: Math.round(avgResponseTime._avg.responseTimeMs || 0),
        successRate:
          totalRequests > 0
            ? Math.round((successCount / totalRequests) * 100 * 100) / 100
            : 100,
      },
      byFeature: featureStats,
      byRole: roleStats,
      byDate: dateStats.slice(-30),
    })
  } catch (error) {
    console.error('Get AI usage statistics error:', error)
    res.status(500).json({ ok: false, error: String(error) })
  }
})

router.get('/user-stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { dateFrom, dateTo } = req.query

    const where: any = { userId }
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = new Date(dateFrom as string)
      if (dateTo) where.createdAt.lte = new Date(dateTo as string)
    }

    const [
      totalRequests,
      totalTokens,
      avgResponseTime,
      featureBreakdown,
      recentRecords,
    ] = await Promise.all([
      prisma.aiUsageResult.count({ where }),
      prisma.aiUsageResult.aggregate({
        where,
        _sum: { totalTokens: true },
      }),
      prisma.aiUsageResult.aggregate({
        where,
        _avg: { responseTimeMs: true },
      }),
      prisma.aiUsageResult.groupBy({
        where,
        by: ['featureType'],
        _count: { id: true },
        _sum: { totalTokens: true },
      }),
      prisma.aiUsageResult.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          featureType: true,
          userQuery: true,
          totalTokens: true,
          createdAt: true,
        },
      }),
    ])

    res.json({
      ok: true,
      userId,
      stats: {
        totalRequests,
        totalTokens: totalTokens._sum.totalTokens || 0,
        avgResponseTime: Math.round(avgResponseTime._avg.responseTimeMs || 0),
        featureBreakdown,
        recentRecords,
      },
    })
  } catch (error) {
    console.error('Get user AI usage stats error:', error)
    res.status(500).json({ ok: false, error: String(error) })
  }
})

router.get('/dashboard', async (_req, res) => {
  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const last7Days = new Date(today)
    last7Days.setDate(last7Days.getDate() - 7)
    const last30Days = new Date(today)
    last30Days.setDate(last30Days.getDate() - 30)

    const todayStats = await prisma.aiUsageResult.aggregate({
      where: { createdAt: { gte: today } },
      _count: { id: true },
      _sum: { totalTokens: true },
    })

    const yesterdayStats = await prisma.aiUsageResult.aggregate({
      where: {
        createdAt: { gte: yesterday, lt: today },
      },
      _count: { id: true },
      _sum: { totalTokens: true },
    })

    const todayActiveUsers = await prisma.aiUsageResult.groupBy({
      where: { createdAt: { gte: today } },
      by: ['userId'],
    })
    const yesterdayActiveUsers = await prisma.aiUsageResult.groupBy({
      where: {
        createdAt: { gte: yesterday, lt: today },
      },
      by: ['userId'],
    })

    const last7DaysStats = await prisma.aiUsageResult.groupBy({
      where: { createdAt: { gte: last7Days } },
      by: ['createdAt'],
      _count: { id: true },
      _sum: { totalTokens: true },
    })

    const featureDistribution = await prisma.aiUsageResult.groupBy({
      where: { createdAt: { gte: last7Days } },
      by: ['featureType'],
      _count: { id: true },
    })

    const roleDistribution = await prisma.aiUsageResult.groupBy({
      where: { createdAt: { gte: last7Days } },
      by: ['userRole'],
      _count: { id: true },
    })

    const topUsers = await prisma.aiUsageResult.groupBy({
      where: { createdAt: { gte: last30Days } },
      by: ['userId', 'userRole'],
      _count: { id: true },
      _sum: { totalTokens: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    })

    const requestGrowth =
      yesterdayStats._count.id > 0
        ? Math.round(
            ((todayStats._count.id - yesterdayStats._count.id) /
              yesterdayStats._count.id) *
              100
          )
        : 0
    const tokenGrowth =
      (yesterdayStats._sum.totalTokens || 0) > 0
        ? Math.round(
            (((todayStats._sum.totalTokens || 0) -
              (yesterdayStats._sum.totalTokens || 0)) /
              (yesterdayStats._sum.totalTokens || 1)) *
              100
          )
        : 0
    const userGrowth =
      yesterdayActiveUsers.length > 0
        ? Math.round(
            ((todayActiveUsers.length - yesterdayActiveUsers.length) /
              yesterdayActiveUsers.length) *
              100
          )
        : 0

    res.json({
      ok: true,
      dashboard: {
        today: {
          requests: todayStats._count.id,
          tokens: todayStats._sum.totalTokens || 0,
          activeUsers: todayActiveUsers.length,
          requestGrowth,
          tokenGrowth,
          userGrowth,
        },
        trends: last7DaysStats,
        featureDistribution,
        roleDistribution,
        topUsers,
      },
    })
  } catch (error) {
    console.error('Get AI usage dashboard error:', error)
    res.status(500).json({ ok: false, error: String(error) })
  }
})

router.post('/export', async (req, res) => {
  try {
    const { filters = {}, format = 'csv' } = req.body

    const where: any = {}
    if (filters.userId) where.userId = filters.userId
    if (filters.userRole) where.userRole = filters.userRole
    if (filters.featureType) where.featureType = filters.featureType
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {}
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom)
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo)
    }

    const records = await prisma.aiUsageResult.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    if (format === 'json') {
      res.json({ ok: true, data: records })
      return
    }

    const headers = [
      'ID',
      'User ID',
      'User Role',
      'Feature Type',
      'Agent Type',
      'User Query',
      'AI Response',
      'Total Tokens',
      'Response Time (ms)',
      'Model Name',
      'Success',
      'Created At',
    ]

    const rows = records.map((r) => [
      r.id,
      r.userId,
      r.userRole,
      r.featureType,
      r.agentType || '',
      `"${(r.userQuery || '').replace(/"/g, '""')}"`,
      `"${(r.aiResponse || '').replace(/"/g, '""').substring(0, 500)}"`,
      r.totalTokens,
      r.responseTimeMs || '',
      r.modelName || '',
      r.isSuccess ? 'Yes' : 'No',
      r.createdAt.toISOString(),
    ])

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=ai_usage_export.csv')
    res.send(csv)
  } catch (error) {
    console.error('Export AI usage records error:', error)
    res.status(500).json({ ok: false, error: String(error) })
  }
})

export default router
