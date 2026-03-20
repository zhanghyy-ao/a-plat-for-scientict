import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// AI健康检查
router.get('/health', async (_req, res) => {
  res.json({ ok: true, service: 'ai', timestamp: new Date().toISOString() })
})

// AI对话
router.post('/chat', async (req, res) => {
  const startTime = Date.now()
  try {
    const { message, sessionId, userId, userRole = 'student', context = [] } = req.body
    
    if (!message || !userId) {
      res.status(400).json({ ok: false, error: 'Missing message or userId' })
      return
    }

    // 调用AI服务
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:5050'
    const response = await fetch(`${aiServiceUrl}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: message, session_id: sessionId, context })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('AI service error:', response.status, errorText)
      res.status(500).json({ ok: false, error: 'AI service unavailable' })
      return
    }

    const aiResult = await response.json()
    const responseTime = Date.now() - startTime

    // 检查用户是否存在
    const validUserId = userId === 'current_user' ? null : userId
    let userExists = true
    if (validUserId) {
      const user = await prisma.user.findUnique({ where: { id: validUserId } })
      userExists = !!user
    }

    // 如果用户不存在或ID无效，只返回AI响应，不保存对话记录
    if (!validUserId || !userExists) {
      res.json({
        ok: true,
        intent: aiResult.intent,
        output: aiResult.output,
        responseTime,
      })
      return
    }

    // 保存用户消息
    await prisma.aIConversation.create({
      data: {
        userId: validUserId,
        sessionId: sessionId || `session_${Date.now()}`,
        messageRole: 'user',
        messageContent: message,
        agentType: aiResult.intent,
        responseTimeMs: responseTime,
      }
    })

    // 保存AI回复
    await prisma.aIConversation.create({
      data: {
        userId: validUserId,
        sessionId: sessionId || `session_${Date.now()}`,
        messageRole: 'assistant',
        messageContent: aiResult.output,
        agentType: aiResult.intent,
        responseTimeMs: responseTime,
      }
    })

    // 记录AI使用
    await prisma.aIUsageResult.create({
      data: {
        userId: validUserId,
        userRole,
        sessionId: sessionId || `session_${Date.now()}`,
        featureType: 'chat',
        agentType: aiResult.intent,
        userQuery: message,
        aiResponse: aiResult.output,
        promptTokens: aiResult.tokens?.prompt || 0,
        completionTokens: aiResult.tokens?.completion || 0,
        totalTokens: aiResult.tokens?.total || 0,
        responseTimeMs: responseTime,
        modelName: aiResult.model || 'default',
        isSuccess: true,
      }
    })

    res.json({
      ok: true,
      intent: aiResult.intent,
      output: aiResult.output,
      responseTime,
    })
  } catch (error) {
    console.error('AI chat error:', error)
    res.status(500).json({ ok: false, error: String(error) })
  }
})

// 获取对话历史
router.get('/conversations/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params
    const { userId } = req.query
    
    const messages = await prisma.aIConversation.findMany({
      where: {
        sessionId,
        ...(userId ? { userId: userId as string } : {})
      },
      orderBy: { createdAt: 'asc' },
      take: 100
    })
    
    res.json({ ok: true, messages })
  } catch (error) {
    console.error('Get conversation error:', error)
    res.status(500).json({ ok: false, error: String(error) })
  }
})

// 获取用户的对话列表
router.get('/conversations', async (req, res) => {
  try {
    const { userId } = req.query
    
    if (!userId) {
      res.status(400).json({ ok: false, error: 'Missing userId' })
      return
    }

    // 获取用户的所有sessionId
    const sessions = await prisma.aIConversation.findMany({
      where: { userId: userId as string },
      select: { sessionId: true },
      distinct: ['sessionId'],
      orderBy: { createdAt: 'desc' },
      take: 50
    })
    
    res.json({ ok: true, sessions: sessions.map(s => s.sessionId) })
  } catch (error) {
    console.error('Get conversations error:', error)
    res.status(500).json({ ok: false, error: String(error) })
  }
})

// 写作辅助
router.post('/writing/assist', async (req, res) => {
  const startTime = Date.now()
  try {
    const { content, type = 'polish', requirements = {}, userId, userRole = 'student' } = req.body
    
    if (!content || !userId) {
      res.status(400).json({ ok: false, error: 'Missing content or userId' })
      return
    }

    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:5050'
    const response = await fetch(`${aiServiceUrl}/ai/writing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, type, requirements })
    })

    const aiResult = await response.json()
    const responseTime = Date.now() - startTime

    // 记录AI使用
    await prisma.aIUsageResult.create({
      data: {
        userId,
        userRole,
        sessionId: `writing_${Date.now()}`,
        featureType: 'writing',
        agentType: 'research_assistant',
        userQuery: content,
        aiResponse: aiResult.output,
        responseTimeMs: responseTime,
        modelName: aiResult.model || 'default',
        isSuccess: true,
      }
    })

    res.json({
      ok: true,
      output: aiResult.output,
      responseTime,
    })
  } catch (error) {
    console.error('Writing assist error:', error)
    res.status(500).json({ ok: false, error: String(error) })
  }
})

// 进度分析
router.post('/progress/analyze', async (req, res) => {
  const startTime = Date.now()
  try {
    const { studentId, analysisType = 'overview', userId, userRole = 'student' } = req.body
    
    if (!studentId || !userId) {
      res.status(400).json({ ok: false, error: 'Missing studentId or userId' })
      return
    }

    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:5050'
    const response = await fetch(`${aiServiceUrl}/ai/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId, analysis_type: analysisType })
    })

    const aiResult = await response.json()
    const responseTime = Date.now() - startTime

    // 记录AI使用
    await prisma.aIUsageResult.create({
      data: {
        userId,
        userRole,
        sessionId: `progress_${Date.now()}`,
        featureType: 'analysis',
        agentType: 'progress_analyst',
        userQuery: `Analyze progress for student ${studentId}`,
        aiResponse: JSON.stringify(aiResult),
        responseTimeMs: responseTime,
        modelName: aiResult.model || 'default',
        isSuccess: true,
      }
    })

    res.json({
      ok: true,
      analysis: aiResult,
      responseTime,
    })
  } catch (error) {
    console.error('Progress analysis error:', error)
    res.status(500).json({ ok: false, error: String(error) })
  }
})

// 图像生成
router.post('/image/generate', async (req, res) => {
  const startTime = Date.now()
  try {
    const { prompt, imageType = 'chart', params = {}, userId } = req.body
    
    if (!prompt || !userId) {
      res.status(400).json({ ok: false, error: 'Missing prompt or userId' })
      return
    }

    // 创建生成记录
    const generation = await prisma.aIImageGeneration.create({
      data: {
        userId,
        prompt,
        imageType,
        generationParams: JSON.stringify(params),
        status: 'pending',
      }
    })

    // 调用AI图像生成服务
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:5050'
    const response = await fetch(`${aiServiceUrl}/ai/image/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, image_type: imageType, params })
    })

    const aiResult = await response.json()
    const responseTime = Date.now() - startTime

    // 更新生成记录
    await prisma.aIImageGeneration.update({
      where: { id: generation.id },
      data: {
        status: aiResult.success ? 'completed' : 'failed',
        imageUrl: aiResult.image_url,
        imageUrls: JSON.stringify(aiResult.image_urls || {}),
        modelUsed: aiResult.model,
        tokensUsed: aiResult.tokens,
      }
    })

    res.json({
      ok: true,
      generationId: generation.id,
      imageUrl: aiResult.image_url,
      imageUrls: aiResult.image_urls,
      responseTime,
    })
  } catch (error) {
    console.error('Image generation error:', error)
    res.status(500).json({ ok: false, error: String(error) })
  }
})

// 获取图像模板列表
router.get('/image/templates', async (req, res) => {
  try {
    const { category } = req.query
    
    const templates = await prisma.imageTemplate.findMany({
      where: {
        isActive: true,
        ...(category ? { category: category as string } : {})
      },
      orderBy: { usageCount: 'desc' },
      take: 50
    })
    
    res.json({ ok: true, templates })
  } catch (error) {
    console.error('Get templates error:', error)
    res.status(500).json({ ok: false, error: String(error) })
  }
})

// 保存图像编辑数据
router.post('/image/edit/save', async (req, res) => {
  try {
    const { generationId, editData } = req.body
    
    if (!generationId || !editData) {
      res.status(400).json({ ok: false, error: 'Missing generationId or editData' })
      return
    }

    await prisma.aIImageGeneration.update({
      where: { id: generationId },
      data: {
        editData: JSON.stringify(editData),
      }
    })
    
    res.json({ ok: true })
  } catch (error) {
    console.error('Save edit error:', error)
    res.status(500).json({ ok: false, error: String(error) })
  }
})

// 获取用户的图像生成历史
router.get('/image/history', async (req, res) => {
  try {
    const { userId, page = '1', pageSize = '20' } = req.query
    
    if (!userId) {
      res.status(400).json({ ok: false, error: 'Missing userId' })
      return
    }

    const skip = (parseInt(page as string) - 1) * parseInt(pageSize as string)
    
    const [generations, total] = await Promise.all([
      prisma.aIImageGeneration.findMany({
        where: { userId: userId as string },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(pageSize as string),
      }),
      prisma.aIImageGeneration.count({
        where: { userId: userId as string },
      })
    ])
    
    res.json({
      ok: true,
      generations,
      pagination: {
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string),
        total,
        totalPages: Math.ceil(total / parseInt(pageSize as string)),
      }
    })
  } catch (error) {
    console.error('Get image history error:', error)
    res.status(500).json({ ok: false, error: String(error) })
  }
})

export default router
