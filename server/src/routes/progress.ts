import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from './auth.js';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { studentId, status } = req.query;

    const where: any = {};
    
    if (user.role === 'mentor') {
      const mentor = await prisma.mentor.findUnique({
        where: { userId: user.id },
      });
      
      if (!mentor) {
        return res.status(404).json({ error: '导师信息不存在' });
      }
      
      const students = await prisma.student.findMany({
        where: { mentorId: mentor.id },
        select: { id: true },
      });
      
      where.studentId = { in: students.map(s => s.id) };
    } else if (user.role === 'student') {
      const student = await prisma.student.findUnique({
        where: { userId: user.id },
      });
      
      if (!student) {
        return res.status(404).json({ error: '学生信息不存在' });
      }
      
      where.studentId = student.id;
    }

    if (studentId) {
      where.studentId = studentId as string;
    }

    if (status) {
      where.status = status as string;
    }

    const progressReports = await prisma.progressReport.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            studentNo: true,
            grade: true,
            major: true,
          },
        },
        feedback: true,
        attachments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(progressReports);
  } catch (error) {
    console.error('Get progress reports error:', error);
    res.status(500).json({ error: '获取进度报告失败' });
  }
});

router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const progress = await prisma.progressReport.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            studentNo: true,
            grade: true,
            major: true,
            mentorId: true,
          },
        },
        feedback: true,
        attachments: true,
      },
    });

    if (!progress) {
      return res.status(404).json({ error: '进度报告不存在' });
    }

    if (user.role === 'mentor') {
      const mentor = await prisma.mentor.findUnique({
        where: { userId: user.id },
      });
      
      if (!mentor || progress.student.mentorId !== mentor.id) {
        return res.status(403).json({ error: '无权查看此进度报告' });
      }
    } else if (user.role === 'student') {
      const student = await prisma.student.findUnique({
        where: { userId: user.id },
      });
      
      if (!student || progress.studentId !== student.id) {
        return res.status(403).json({ error: '无权查看此进度报告' });
      }
    }

    res.json(progress);
  } catch (error) {
    console.error('Get progress report error:', error);
    res.status(500).json({ error: '获取进度报告失败' });
  }
});

router.post('/', authenticateToken, requireRole('student'), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { title, content, completion, problems, nextPlan } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: '标题和内容不能为空' });
    }

    const student = await prisma.student.findUnique({
      where: { userId: user.id },
    });

    if (!student) {
      return res.status(404).json({ error: '学生信息不存在' });
    }

    const progress = await prisma.progressReport.create({
      data: {
        studentId: student.id,
        title,
        content,
        completion: completion || 0,
        problems,
        nextPlan,
        status: 'pending',
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            studentNo: true,
          },
        },
      },
    });

    if (student.mentorId) {
      await prisma.notification.create({
        data: {
          userId: student.mentorId,
          title: '新的进度报告',
          content: `${student.name} 提交了新的进度报告：${title}`,
          type: 'progress',
          relatedId: progress.id,
        },
      });
    }

    res.status(201).json(progress);
  } catch (error) {
    console.error('Create progress report error:', error);
    res.status(500).json({ error: '创建进度报告失败' });
  }
});

router.put('/:id', authenticateToken, requireRole('student'), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { title, content, completion, problems, nextPlan } = req.body;

    const existingProgress = await prisma.progressReport.findUnique({
      where: { id },
      include: { student: true },
    });

    if (!existingProgress) {
      return res.status(404).json({ error: '进度报告不存在' });
    }

    const student = await prisma.student.findUnique({
      where: { userId: user.id },
    });

    if (!student || existingProgress.studentId !== student.id) {
      return res.status(403).json({ error: '无权修改此进度报告' });
    }

    if (existingProgress.status === 'reviewed') {
      return res.status(400).json({ error: '已审阅的进度报告不能修改' });
    }

    const progress = await prisma.progressReport.update({
      where: { id },
      data: {
        title: title || existingProgress.title,
        content: content || existingProgress.content,
        completion: completion !== undefined ? completion : existingProgress.completion,
        problems: problems !== undefined ? problems : existingProgress.problems,
        nextPlan: nextPlan !== undefined ? nextPlan : existingProgress.nextPlan,
      },
    });

    res.json(progress);
  } catch (error) {
    console.error('Update progress report error:', error);
    res.status(500).json({ error: '更新进度报告失败' });
  }
});

router.post('/:id/feedback', authenticateToken, requireRole('mentor'), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { content, rating, isApproved } = req.body;

    if (!content) {
      return res.status(400).json({ error: '反馈内容不能为空' });
    }

    const progress = await prisma.progressReport.findUnique({
      where: { id },
      include: { student: true },
    });

    if (!progress) {
      return res.status(404).json({ error: '进度报告不存在' });
    }

    const mentor = await prisma.mentor.findUnique({
      where: { userId: user.id },
    });

    if (!mentor || progress.student.mentorId !== mentor.id) {
      return res.status(403).json({ error: '无权审阅此进度报告' });
    }

    const existingFeedback = await prisma.mentorFeedback.findUnique({
      where: { progressId: id },
    });

    let feedback;

    if (existingFeedback) {
      feedback = await prisma.mentorFeedback.update({
        where: { progressId: id },
        data: {
          content,
          rating: rating || 3,
          isApproved: isApproved !== undefined ? isApproved : true,
        },
      });
    } else {
      feedback = await prisma.mentorFeedback.create({
        data: {
          progressId: id,
          mentorId: mentor.id,
          content,
          rating: rating || 3,
          isApproved: isApproved !== undefined ? isApproved : true,
        },
      });
    }

    await prisma.progressReport.update({
      where: { id },
      data: { status: 'reviewed' },
    });

    await prisma.notification.create({
      data: {
        userId: progress.student.userId,
        title: '进度报告已审阅',
        content: `您的进度报告"${progress.title}"已收到导师反馈`,
        type: 'progress',
        relatedId: progress.id,
      },
    });

    res.json(feedback);
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ error: '提交反馈失败' });
  }
});

router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const progress = await prisma.progressReport.findUnique({
      where: { id },
      include: { student: true },
    });

    if (!progress) {
      return res.status(404).json({ error: '进度报告不存在' });
    }

    if (user.role === 'student') {
      const student = await prisma.student.findUnique({
        where: { userId: user.id },
      });

      if (!student || progress.studentId !== student.id) {
        return res.status(403).json({ error: '无权删除此进度报告' });
      }

      if (progress.status === 'reviewed') {
        return res.status(400).json({ error: '已审阅的进度报告不能删除' });
      }
    } else if (user.role === 'mentor') {
      const mentor = await prisma.mentor.findUnique({
        where: { userId: user.id },
      });

      if (!mentor || progress.student.mentorId !== mentor.id) {
        return res.status(403).json({ error: '无权删除此进度报告' });
      }
    }

    await prisma.progressReport.delete({
      where: { id },
    });

    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('Delete progress report error:', error);
    res.status(500).json({ error: '删除进度报告失败' });
  }
});

export default router;
