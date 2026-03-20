import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from './auth.js';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { type, isRead } = req.query;

    const where: any = {
      userId: user.id,
    };

    if (type) {
      where.type = type as string;
    }

    if (isRead !== undefined) {
      where.isRead = isRead === 'true';
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: '获取通知列表失败' });
  }
});

router.get('/unread-count', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const count = await prisma.notification.count({
      where: {
        userId: user.id,
        isRead: false,
      },
    });

    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: '获取未读数量失败' });
  }
});

router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { isRead } = req.body;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return res.status(404).json({ error: '通知不存在' });
    }

    if (notification.userId !== user.id) {
      return res.status(403).json({ error: '无权修改此通知' });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: {
        isRead: isRead !== undefined ? isRead : notification.isRead,
      },
    });

    res.json(updatedNotification);
  } catch (error) {
    console.error('Update notification error:', error);
    res.status(500).json({ error: '更新通知失败' });
  }
});

router.put('/mark-all-read', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    await prisma.notification.updateMany({
      where: {
        userId: user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    res.json({ message: '全部标记已读成功' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: '标记全部已读失败' });
  }
});

router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return res.status(404).json({ error: '通知不存在' });
    }

    if (notification.userId !== user.id) {
      return res.status(403).json({ error: '无权删除此通知' });
    }

    await prisma.notification.delete({
      where: { id },
    });

    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: '删除通知失败' });
  }
});

export default router;
