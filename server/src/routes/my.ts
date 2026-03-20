import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from './auth.js';

const router = Router();
const prisma = new PrismaClient();

router.get('/students', authenticateToken, requireRole('mentor'), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const mentor = await prisma.mentor.findUnique({
      where: { userId: user.id },
    });

    if (!mentor) {
      return res.status(404).json({ error: '导师信息不存在' });
    }

    const students = await prisma.student.findMany({
      where: { mentorId: mentor.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: '获取学生列表失败' });
  }
});

router.get('/students/:id', authenticateToken, requireRole('mentor'), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const mentor = await prisma.mentor.findUnique({
      where: { userId: user.id },
    });

    if (!mentor) {
      return res.status(404).json({ error: '导师信息不存在' });
    }

    const student = await prisma.student.findFirst({
      where: {
        id,
        mentorId: mentor.id,
      },
    });

    if (!student) {
      return res.status(404).json({ error: '学生不存在或不是您的学生' });
    }

    const progressHistory = await prisma.progressReport.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' },
      include: {
        feedback: true,
      },
    });

    res.json({
      student,
      progress_history: progressHistory,
    });
  } catch (error) {
    console.error('Get student detail error:', error);
    res.status(500).json({ error: '获取学生详情失败' });
  }
});

router.get('/pending-progress', authenticateToken, requireRole('mentor'), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

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

    const studentIds = students.map(s => s.id);

    const pendingProgress = await prisma.progressReport.findMany({
      where: {
        studentId: { in: studentIds },
        status: 'pending',
      },
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
      orderBy: { createdAt: 'desc' },
    });

    res.json(pendingProgress);
  } catch (error) {
    console.error('Get pending progress error:', error);
    res.status(500).json({ error: '获取待审进度失败' });
  }
});

router.get('/profile', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (user.role === 'mentor') {
      const mentor = await prisma.mentor.findUnique({
        where: { userId: user.id },
        include: {
          _count: {
            select: { students: true },
          },
        },
      });

      if (!mentor) {
        return res.status(404).json({ error: '导师信息不存在' });
      }

      res.json({
        ...mentor,
        student_count: mentor._count.students,
      });
    } else if (user.role === 'student') {
      const student = await prisma.student.findUnique({
        where: { userId: user.id },
        include: {
          mentor: {
            select: {
              id: true,
              name: true,
              title: true,
              department: true,
            },
          },
        },
      });

      if (!student) {
        return res.status(404).json({ error: '学生信息不存在' });
      }

      res.json(student);
    } else {
      res.json(null);
    }
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: '获取个人信息失败' });
  }
});

router.put('/profile', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { name, title, department, researchDirection, bio, email, phone, major, researchTopic, grade } = req.body;

    if (user.role === 'mentor') {
      const mentor = await prisma.mentor.findUnique({
        where: { userId: user.id },
      });

      if (!mentor) {
        return res.status(404).json({ error: '导师信息不存在' });
      }

      const updatedMentor = await prisma.mentor.update({
        where: { userId: user.id },
        data: {
          name: name || mentor.name,
          title: title !== undefined ? title : mentor.title,
          department: department !== undefined ? department : mentor.department,
          researchDirection: researchDirection !== undefined ? researchDirection : mentor.researchDirection,
          bio: bio !== undefined ? bio : mentor.bio,
        },
      });

      if (email || phone) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            email: email !== undefined ? email : user.email,
            phone: phone !== undefined ? phone : user.phone,
          },
        });
      }

      res.json(updatedMentor);
    } else if (user.role === 'student') {
      const student = await prisma.student.findUnique({
        where: { userId: user.id },
      });

      if (!student) {
        return res.status(404).json({ error: '学生信息不存在' });
      }

      const updatedStudent = await prisma.student.update({
        where: { userId: user.id },
        data: {
          name: name || student.name,
          major: major !== undefined ? major : student.major,
          researchTopic: researchTopic !== undefined ? researchTopic : student.researchTopic,
          grade: grade !== undefined ? grade : student.grade,
          bio: bio !== undefined ? bio : student.bio,
        },
      });

      if (email || phone) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            email: email !== undefined ? email : user.email,
            phone: phone !== undefined ? phone : user.phone,
          },
        });
      }

      res.json(updatedStudent);
    } else {
      res.status(400).json({ error: '无法更新该角色的资料' });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: '更新个人信息失败' });
  }
});

router.get('/mentors', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const mentors = await prisma.mentor.findMany({
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            email: true,
            status: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const result = mentors.map(m => ({
      userId: m.userId,
      name: m.name,
      title: m.title,
      department: m.department,
      researchDirection: m.researchDirection,
      status: m.user.status,
    }));

    res.json(result);
  } catch (error) {
    console.error('Get mentors error:', error);
    res.status(500).json({ error: '获取导师列表失败' });
  }
});

router.get('/all-users', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const result: any[] = [];

    if (user.role === 'mentor') {
      const students = await prisma.student.findMany({
        where: { mentorId: (await prisma.mentor.findUnique({ where: { userId: user.id } }))?.id },
        include: {
          user: {
            select: { id: true, nickname: true, status: true },
          },
        },
      });

      students.forEach(s => {
        result.push({
          id: s.userId,
          name: s.name,
          role: 'student',
          status: s.user.status,
          studentNo: s.studentNo,
          major: s.major,
        });
      });

      const mentors = await prisma.mentor.findMany({
        where: { userId: { not: user.id } },
        include: {
          user: {
            select: { id: true, nickname: true, status: true },
          },
        },
      });

      mentors.forEach(m => {
        result.push({
          id: m.userId,
          name: m.name,
          role: 'mentor',
          status: m.user.status,
          title: m.title,
          department: m.department,
        });
      });
    } else if (user.role === 'student') {
      const student = await prisma.student.findUnique({
        where: { userId: user.id },
        include: {
          mentor: {
            include: {
              user: {
                select: { id: true, nickname: true, status: true },
              },
            },
          },
        },
      });

      if (student?.mentor) {
        result.push({
          id: student.mentor.userId,
          name: student.mentor.name,
          role: 'mentor',
          status: student.mentor.user.status,
          title: student.mentor.title,
          department: student.mentor.department,
        });
      }

      const otherStudents = await prisma.student.findMany({
        where: { 
          mentorId: student?.mentorId,
          userId: { not: user.id }
        },
        include: {
          user: {
            select: { id: true, nickname: true, status: true },
          },
        },
      });

      otherStudents.forEach(s => {
        result.push({
          id: s.userId,
          name: s.name,
          role: 'student',
          status: s.user.status,
          studentNo: s.studentNo,
          major: s.major,
        });
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: '获取用户列表失败' });
  }
});

export default router;
