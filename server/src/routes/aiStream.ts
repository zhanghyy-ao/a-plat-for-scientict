import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// AI对话 - 流式输出
router.post('/chat/stream', async (req, res) => {
  const { message, sessionId, userId, userRole = 'student' } = req.body

  if (!message || !userId) {
    res.status(400).json({ ok: false, error: 'Missing message or userId' })
    return
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  const startTime = Date.now()
  const sid = sessionId || `session_${Date.now()}`

  try {
    // 保存用户消息
    await prisma.aIConversation.create({
      data: {
        userId,
        sessionId: sid,
        messageRole: 'user',
        messageContent: message,
        responseTimeMs: 0,
      },
    })

    // 调用 AI 服务（非流式，因为我们逐字推送）
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:5050'
    const response = await fetch(`${aiServiceUrl}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: message, session_id: sid }),
    })

    const aiResult = await response.json()
    const output = aiResult.output || ''
    const responseTime = Date.now() - startTime

    // 逐字发送
    for (let i = 0; i < output.length; i++) {
      res.write(`data: ${JSON.stringify({ char: output[i], done: false })}\n\n`)
    }

    // 发送完成信号
    res.write(
      `data: ${JSON.stringify({
        done: true,
        intent: aiResult.intent,
        tokens: aiResult.tokens,
        responseTime,
      })}\n\n`
    )

    // 保存 AI 回复
    await prisma.aIConversation.create({
      data: {
        userId,
        sessionId: sid,
        messageRole: 'assistant',
        messageContent: output,
        agentType: aiResult.intent,
        responseTimeMs: responseTime,
      },
    })

    // 记录使用
    await prisma.aIUsageResult.create({
      data: {
        userId,
        userRole,
        sessionId: sid,
        featureType: 'chat',
        agentType: aiResult.intent,
        userQuery: message,
        aiResponse: output,
        promptTokens: aiResult.tokens?.prompt || 0,
        completionTokens: aiResult.tokens?.completion || 0,
        totalTokens: aiResult.tokens?.total || 0,
        responseTimeMs: responseTime,
        modelName: aiResult.model || 'default',
        isSuccess: true,
      },
    })
  } catch (error) {
    res.write(
      `data: ${JSON.stringify({ done: true, error: String(error) })}\n\n`
    )
  } finally {
    res.end()
  }
})

export default router