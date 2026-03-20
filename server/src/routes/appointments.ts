import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from './auth.js';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { status } = req.query;

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

      where.studentId = student.id;
    }

    if (status) {
      where.status = status as string;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            title: true,
            department: true,
          },
        },
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
      orderBy: { startTime: 'asc' },
    });

    res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: '获取预约列表失败' });
  }
});

router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
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
    });

    if (!appointment) {
      return res.status(404).json({ error: '预约不存在' });
    }

    if (user.role === 'mentor') {
      const mentor = await prisma.mentor.findUnique({
        where: { userId: user.id },
      });

      if (!mentor || appointment.mentorId !== mentor.id) {
        return res.status(403).json({ error: '无权查看此预约' });
      }
    } else if (user.role === 'student') {
      const student = await prisma.student.findUnique({
        where: { userId: user.id },
      });

      if (!student || appointment.studentId !== student.id) {
        return res.status(403).json({ error: '无权查看此预约' });
      }
    }

    res.json(appointment);
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ error: '获取预约详情失败' });
  }
});

router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { mentorId, studentId, title, description, appointmentType, location, startTime, endTime } = req.body;

    if (!title || !startTime || !endTime) {
      return res.status(400).json({ error: '标题、开始时间和结束时间不能为空' });
    }

    let actualMentorId = mentorId;
    let actualStudentId = studentId;

    if (user.role === 'mentor') {
      const mentor = await prisma.mentor.findUnique({
        where: { userId: user.id },
      });

      if (!mentor) {
        return res.status(404).json({ error: '导师信息不存在' });
      }

      actualMentorId = mentor.id;

      if (!studentId) {
        return res.status(400).json({ error: '请选择学生' });
      }
    } else if (user.role === 'student') {
      const student = await prisma.student.findUnique({
        where: { userId: user.id },
      });

      if (!student) {
        return res.status(404).json({ error: '学生信息不存在' });
      }

      actualStudentId = student.id;

      if (!student.mentorId) {
        return res.status(400).json({ error: '您还没有分配导师' });
      }

      actualMentorId = student.mentorId;
    }

    const appointment = await prisma.appointment.create({
      data: {
        mentorId: actualMentorId,
        studentId: actualStudentId,
        title,
        description,
        appointmentType: appointmentType || 'offline',
        location,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
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
        student: {
          select: {
            id: true,
            name: true,
            studentNo: true,
          },
        },
      },
    });

    const notifyUserId = user.role === 'mentor' 
      ? (await prisma.student.findUnique({ where: { id: actualStudentId } }))?.userId
      : (await prisma.mentor.findUnique({ where: { id: actualMentorId } }))?.userId;

    if (notifyUserId) {
      await prisma.notification.create({
        data: {
          userId: notifyUserId,
          title: '新预约创建',
          content: `${user.role === 'mentor' ? '导师' : '学生'}创建了预约：${title}`,
          type: 'appointment',
          relatedId: appointment.id,
        },
      });
    }

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: '创建预约失败' });
  }
});

router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { status, notes, title, description, location, startTime, endTime } = req.body;

    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!existingAppointment) {
      return res.status(404).json({ error: '预约不存在' });
    }

    if (user.role === 'mentor') {
      const mentor = await prisma.mentor.findUnique({
        where: { userId: user.id },
      });

      if (!mentor || existingAppointment.mentorId !== mentor.id) {
        return res.status(403).json({ error: '无权修改此预约' });
      }
    } else if (user.role === 'student') {
      const student = await prisma.student.findUnique({
        where: { userId: user.id },
      });

      if (!student || existingAppointment.studentId !== student.id) {
        return res.status(403).json({ error: '无权修改此预约' });
      }
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: status || existingAppointment.status,
        notes: notes !== undefined ? notes : existingAppointment.notes,
        title: title || existingAppointment.title,
        description: description !== undefined ? description : existingAppointment.description,
        location: location !== undefined ? location : existingAppointment.location,
        startTime: startTime ? new Date(startTime) : existingAppointment.startTime,
        endTime: endTime ? new Date(endTime) : existingAppointment.endTime,
      },
    });

    res.json(appointment);
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ error: '更新预约失败' });
  }
});

router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return res.status(404).json({ error: '预约不存在' });
    }

    if (user.role === 'mentor') {
      const mentor = await prisma.mentor.findUnique({
        where: { userId: user.id },
      });

      if (!mentor || appointment.mentorId !== mentor.id) {
        return res.status(403).json({ error: '无权删除此预约' });
      }
    } else if (user.role === 'student') {
      const student = await prisma.student.findUnique({
        where: { userId: user.id },
      });

      if (!student || appointment.studentId !== student.id) {
        return res.status(403).json({ error: '无权删除此预约' });
      }
    }

    await prisma.appointment.delete({
      where: { id },
    });

    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ error: '删除预约失败' });
  }
});

export default router;
