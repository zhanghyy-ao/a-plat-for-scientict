import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from './auth.js';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { status, priority } = req.query;

    const where: any = {};

    if (user.role === 'mentor') {
      const mentor = await prisma.mentor.findUnique({
        where: { userId: user.id },
      });

      if (!mentor) {
        return res.status(404).json({ error: '导师信息不存在' });
      }

      where.mentorId = mentor.id;
    } else if (user.role === 'student') {
      const student = await prisma.student.findUnique({
        where: { userId: user.id },
      });

      if (!student) {
        return res.status(404).json({ error: '学生信息不存在' });
      }

      where.assignments = {
        some: { studentId: student.id },
      };
    }

    if (status) {
      where.status = status as string;
    }

    if (priority) {
      where.priority = priority as string;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            title: true,
          },
        },
        assignments: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                studentNo: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: '获取任务列表失败' });
  }
});

router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            title: true,
            department: true,
          },
        },
        assignments: {
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
          },
        },
      },
    });

    if (!task) {
      return res.status(404).json({ error: '任务不存在' });
    }

    if (user.role === 'mentor') {
      const mentor = await prisma.mentor.findUnique({
        where: { userId: user.id },
      });

      if (!mentor || task.mentorId !== mentor.id) {
        return res.status(403).json({ error: '无权查看此任务' });
      }
    } else if (user.role === 'student') {
      const student = await prisma.student.findUnique({
        where: { userId: user.id },
      });

      if (!student) {
        return res.status(403).json({ error: '无权查看此任务' });
      }

      const isAssigned = task.assignments.some(a => a.studentId === student.id);
      if (!isAssigned) {
        return res.status(403).json({ error: '无权查看此任务' });
      }
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: '获取任务详情失败' });
  }
});

router.post('/', authenticateToken, requireRole('mentor'), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { title, description, priority, dueDate, studentIds } = req.body;

    if (!title) {
      return res.status(400).json({ error: '任务标题不能为空' });
    }

    const mentor = await prisma.mentor.findUnique({
      where: { userId: user.id },
    });

    if (!mentor) {
      return res.status(404).json({ error: '导师信息不存在' });
    }

    const task = await prisma.task.create({
      data: {
        mentorId: mentor.id,
        title,
        description,
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'pending',
      },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            title: true,
          },
        },
      },
    });

    if (studentIds && studentIds.length > 0) {
      await prisma.taskAssignment.createMany({
        data: studentIds.map((studentId: string) => ({
          taskId: task.id,
          studentId,
          status: 'pending',
        })),
      });

      for (const studentId of studentIds) {
        const student = await prisma.student.findUnique({
          where: { id: studentId },
        });

        if (student) {
          await prisma.notification.create({
            data: {
              userId: student.userId,
              title: '新任务分配',
              content: `导师${mentor.name}为您分配了新任务：${title}`,
              type: 'task',
              relatedId: task.id,
            },
          });
        }
      }
    }

    const taskWithAssignments = await prisma.task.findUnique({
      where: { id: task.id },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            title: true,
          },
        },
        assignments: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                studentNo: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json(taskWithAssignments);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: '创建任务失败' });
  }
});

router.put('/:id', authenticateToken, requireRole('mentor'), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { title, description, priority, dueDate, status, studentIds } = req.body;

    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return res.status(404).json({ error: '任务不存在' });
    }

    const mentor = await prisma.mentor.findUnique({
      where: { userId: user.id },
    });

    if (!mentor || existingTask.mentorId !== mentor.id) {
      return res.status(403).json({ error: '无权修改此任务' });
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        title: title || existingTask.title,
        description: description !== undefined ? description : existingTask.description,
        priority: priority || existingTask.priority,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : existingTask.dueDate,
        status: status || existingTask.status,
      },
    });

    if (studentIds && studentIds.length > 0) {
      await prisma.taskAssignment.deleteMany({
        where: { taskId: id },
      });

      await prisma.taskAssignment.createMany({
        data: studentIds.map((studentId: string) => ({
          taskId: id,
          studentId,
          status: 'pending',
        })),
      });
    }

    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: '更新任务失败' });
  }
});

router.put('/:id/assignments/:assignmentId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id, assignmentId } = req.params;
    const { status, submissionContent, feedback } = req.body;

    const assignment = await prisma.taskAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        task: true,
        student: true,
      },
    });

    if (!assignment) {
      return res.status(404).json({ error: '任务分配不存在' });
    }

    if (assignment.taskId !== id) {
      return res.status(400).json({ error: '任务ID不匹配' });
    }

    if (user.role === 'student') {
      const student = await prisma.student.findUnique({
        where: { userId: user.id },
      });

      if (!student || assignment.studentId !== student.id) {
        return res.status(403).json({ error: '无权修改此任务分配' });
      }

      const updatedAssignment = await prisma.taskAssignment.update({
        where: { id: assignmentId },
        data: {
          status: status || assignment.status,
          submissionContent: submissionContent !== undefined ? submissionContent : assignment.submissionContent,
          submittedAt: status === 'completed' ? new Date() : assignment.submittedAt,
        },
      });

      res.json(updatedAssignment);
    } else if (user.role === 'mentor') {
      const mentor = await prisma.mentor.findUnique({
        where: { userId: user.id },
      });

      if (!mentor || assignment.task.mentorId !== mentor.id) {
        return res.status(403).json({ error: '无权修改此任务分配' });
      }

      const updatedAssignment = await prisma.taskAssignment.update({
        where: { id: assignmentId },
        data: {
          feedback: feedback !== undefined ? feedback : assignment.feedback,
          feedbackAt: feedback ? new Date() : assignment.feedbackAt,
          status: status || assignment.status,
        },
      });

      await prisma.notification.create({
        data: {
          userId: assignment.student.userId,
          title: '任务反馈',
          content: `您的任务"${assignment.task.title}"收到了导师反馈`,
          type: 'task',
          relatedId: assignment.task.id,
        },
      });

      res.json(updatedAssignment);
    } else {
      return res.status(403).json({ error: '无权修改此任务分配' });
    }
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ error: '更新任务分配失败' });
  }
});

router.delete('/:id', authenticateToken, requireRole('mentor'), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return res.status(404).json({ error: '任务不存在' });
    }

    const mentor = await prisma.mentor.findUnique({
      where: { userId: user.id },
    });

    if (!mentor || task.mentorId !== mentor.id) {
      return res.status(403).json({ error: '无权删除此任务' });
    }

    await prisma.task.delete({
      where: { id },
    });

    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: '删除任务失败' });
  }
});

export default router;
