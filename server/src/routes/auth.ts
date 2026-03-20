import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

interface JwtPayload {
  userId: string;
  role: string;
}

export const authenticateToken = async (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        mentor: true,
        student: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: '用户不存在' });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: '无效的令牌' });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: Function) => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: '权限不足' });
    }
    next();
  };
};

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        mentor: true,
        student: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { status: 'online' },
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const profile = user.role === 'mentor' ? user.mentor : user.role === 'student' ? user.student : null;

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        profile,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: '登录失败' });
  }
});

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password, nickname, email, phone, role = 'student' } = req.body;

    if (!username || !password || !nickname) {
      return res.status(400).json({ error: '用户名、密码和昵称不能为空' });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          ...(email ? [{ email }] : []),
        ],
      },
    });

    if (existingUser) {
      return res.status(400).json({ error: '用户名或邮箱已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        nickname,
        email,
        phone,
        role,
      },
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profile: null,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: '注册失败' });
  }
});

router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const profile = user.role === 'mentor' ? user.mentor : user.role === 'student' ? user.student : null;

    res.json({
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      profile,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

router.post('/logout', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    await prisma.user.update({
      where: { id: user.id },
      data: { status: 'offline' },
    });

    res.json({ message: '登出成功' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: '登出失败' });
  }
});

router.put('/password', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: '旧密码和新密码不能为空' });
    }

    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: '旧密码错误' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    res.json({ message: '密码修改成功' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: '密码修改失败' });
  }
});

export default router;
