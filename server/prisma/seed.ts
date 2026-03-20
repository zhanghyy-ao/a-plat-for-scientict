import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('开始创建测试数据...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      password: adminPassword,
      nickname: '系统管理员',
      email: 'admin@lab.edu',
      role: 'admin',
      status: 'online',
    },
  });
  console.log('创建管理员:', admin.username);

  const mentorPassword = await bcrypt.hash('mentor123', 10);
  
  const mentor1User = await prisma.user.create({
    data: {
      username: 'zhanglaoshi',
      password: mentorPassword,
      nickname: '张教授',
      email: 'zhang@lab.edu',
      phone: '13800138001',
      role: 'mentor',
      status: 'online',
    },
  });

  const mentor1 = await prisma.mentor.create({
    data: {
      userId: mentor1User.id,
      name: '张教授',
      title: '教授',
      department: '计算机科学与技术系',
      researchDirection: '人工智能、机器学习、深度学习',
      bio: '博士生导师，主要从事人工智能领域研究。',
    },
  });
  console.log('创建导师:', mentor1.name);

  const mentor2User = await prisma.user.create({
    data: {
      username: 'lilaoshi',
      password: mentorPassword,
      nickname: '李副教授',
      email: 'li@lab.edu',
      phone: '13800138002',
      role: 'mentor',
      status: 'online',
    },
  });

  const mentor2 = await prisma.mentor.create({
    data: {
      userId: mentor2User.id,
      name: '李副教授',
      title: '副教授',
      department: '计算机科学与技术系',
      researchDirection: '计算机视觉、图像处理',
      bio: '硕士生导师，研究方向为计算机视觉。',
    },
  });
  console.log('创建导师:', mentor2.name);

  const studentPassword = await bcrypt.hash('student123', 10);
  
  const studentsData = [
    { name: '王小明', studentNo: '2021001', grade: '2021级', major: '计算机科学与技术', studentType: 'graduate', mentorId: mentor1.id },
    { name: '李小红', studentNo: '2021002', grade: '2021级', major: '软件工程', studentType: 'graduate', mentorId: mentor1.id },
    { name: '张小华', studentNo: '2022001', grade: '2022级', major: '计算机科学与技术', studentType: 'graduate', mentorId: mentor1.id },
    { name: '刘小丽', studentNo: '2022002', grade: '2022级', major: '人工智能', studentType: 'graduate', mentorId: mentor2.id },
    { name: '陈小强', studentNo: '2023001', grade: '2023级', major: '计算机科学与技术', studentType: 'undergraduate', mentorId: mentor2.id },
  ];

  for (const s of studentsData) {
    const studentUser = await prisma.user.create({
      data: {
        username: s.studentNo,
        password: studentPassword,
        nickname: s.name,
        email: `${s.studentNo}@lab.edu`,
        role: 'student',
        status: 'online',
      },
    });

    await prisma.student.create({
      data: {
        userId: studentUser.id,
        name: s.name,
        studentNo: s.studentNo,
        grade: s.grade,
        major: s.major,
        studentType: s.studentType,
        mentorId: s.mentorId,
        researchTopic: `${s.name}的研究课题`,
      },
    });
    console.log('创建学生:', s.name);
  }

  console.log('\n===== 测试数据创建完成 =====');
  console.log('\n测试账号信息：');
  console.log('管理员: admin / admin123');
  console.log('导师1: zhanglaoshi / mentor123');
  console.log('导师2: lilaoshi / mentor123');
  console.log('学生: 学号 / student123 (如 2021001 / student123)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
