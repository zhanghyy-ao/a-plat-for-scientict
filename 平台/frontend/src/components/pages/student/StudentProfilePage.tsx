import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../../common/Button';

const StudentProfilePage: React.FC = () => {
  const [studentInfo, setStudentInfo] = useState({
    id: '1',
    name: '张三',
    studentId: '2020001',
    gender: '男',
    birthday: '2002-01-01',
    major: '计算机科学与技术',
    grade: '大四',
    studentType: 'undergraduate',
    enrollmentDate: '2020-09-01',
    graduationDate: '2024-06-30',
    advisorId: '1',
    contactInfo: {
      phone: '13800138000',
      email: 'zhangsan@example.com',
      address: '北京市海淀区'
    },
    researchArea: '人工智能',
    achievements: ['优秀学生奖学金', '数学建模竞赛一等奖'],
    projects: ['智能推荐系统', '机器学习算法研究']
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    // 模拟保存操作
    setIsEditing(false);
    alert('个人信息已保存');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-dark-gray/50 rounded-xl p-6 border border-light-gray/10"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-orbitron font-bold text-electric-blue">个人信息</h2>
        <Button 
          variant={isEditing ? 'primary' : 'secondary'}
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
        >
          {isEditing ? '保存' : '编辑'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-light-gray mb-2">姓名</label>
            {isEditing ? (
              <input
                type="text"
                value={studentInfo.name}
                onChange={(e) => setStudentInfo({ ...studentInfo, name: e.target.value })}
                className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-electric-blue"
              />
            ) : (
              <p className="text-white">{studentInfo.name}</p>
            )}
          </div>

          <div>
            <label className="block text-light-gray mb-2">学号</label>
            {isEditing ? (
              <input
                type="text"
                value={studentInfo.studentId}
                onChange={(e) => setStudentInfo({ ...studentInfo, studentId: e.target.value })}
                className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-electric-blue"
              />
            ) : (
              <p className="text-white">{studentInfo.studentId}</p>
            )}
          </div>

          <div>
            <label className="block text-light-gray mb-2">性别</label>
            {isEditing ? (
              <select
                value={studentInfo.gender}
                onChange={(e) => setStudentInfo({ ...studentInfo, gender: e.target.value })}
                className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-electric-blue"
              >
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            ) : (
              <p className="text-white">{studentInfo.gender}</p>
            )}
          </div>

          <div>
            <label className="block text-light-gray mb-2">出生日期</label>
            {isEditing ? (
              <input
                type="date"
                value={studentInfo.birthday}
                onChange={(e) => setStudentInfo({ ...studentInfo, birthday: e.target.value })}
                className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-electric-blue"
              />
            ) : (
              <p className="text-white">{studentInfo.birthday}</p>
            )}
          </div>

          <div>
            <label className="block text-light-gray mb-2">专业</label>
            {isEditing ? (
              <input
                type="text"
                value={studentInfo.major}
                onChange={(e) => setStudentInfo({ ...studentInfo, major: e.target.value })}
                className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-electric-blue"
              />
            ) : (
              <p className="text-white">{studentInfo.major}</p>
            )}
          </div>

          <div>
            <label className="block text-light-gray mb-2">年级</label>
            {isEditing ? (
              <input
                type="text"
                value={studentInfo.grade}
                onChange={(e) => setStudentInfo({ ...studentInfo, grade: e.target.value })}
                className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-electric-blue"
              />
            ) : (
              <p className="text-white">{studentInfo.grade}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-light-gray mb-2">学生类型</label>
            {isEditing ? (
              <select
                value={studentInfo.studentType}
                onChange={(e) => setStudentInfo({ ...studentInfo, studentType: e.target.value })}
                className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-electric-blue"
              >
                <option value="undergraduate">本科生</option>
                <option value="graduate">研究生</option>
                <option value="phd">博士生</option>
              </select>
            ) : (
              <p className="text-white">
                {studentInfo.studentType === 'undergraduate' ? '本科生' : 
                 studentInfo.studentType === 'graduate' ? '研究生' : '博士生'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-light-gray mb-2">入学日期</label>
            {isEditing ? (
              <input
                type="date"
                value={studentInfo.enrollmentDate}
                onChange={(e) => setStudentInfo({ ...studentInfo, enrollmentDate: e.target.value })}
                className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-electric-blue"
              />
            ) : (
              <p className="text-white">{studentInfo.enrollmentDate}</p>
            )}
          </div>

          <div>
            <label className="block text-light-gray mb-2">毕业日期</label>
            {isEditing ? (
              <input
                type="date"
                value={studentInfo.graduationDate}
                onChange={(e) => setStudentInfo({ ...studentInfo, graduationDate: e.target.value })}
                className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-electric-blue"
              />
            ) : (
              <p className="text-white">{studentInfo.graduationDate}</p>
            )}
          </div>

          <div>
            <label className="block text-light-gray mb-2">研究方向</label>
            {isEditing ? (
              <input
                type="text"
                value={studentInfo.researchArea}
                onChange={(e) => setStudentInfo({ ...studentInfo, researchArea: e.target.value })}
                className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-electric-blue"
              />
            ) : (
              <p className="text-white">{studentInfo.researchArea}</p>
            )}
          </div>

          <div>
            <label className="block text-light-gray mb-2">联系电话</label>
            {isEditing ? (
              <input
                type="text"
                value={studentInfo.contactInfo.phone}
                onChange={(e) => setStudentInfo({ 
                  ...studentInfo, 
                  contactInfo: { ...studentInfo.contactInfo, phone: e.target.value } 
                })}
                className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-electric-blue"
              />
            ) : (
              <p className="text-white">{studentInfo.contactInfo.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-light-gray mb-2">邮箱</label>
            {isEditing ? (
              <input
                type="email"
                value={studentInfo.contactInfo.email}
                onChange={(e) => setStudentInfo({ 
                  ...studentInfo, 
                  contactInfo: { ...studentInfo.contactInfo, email: e.target.value } 
                })}
                className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-electric-blue"
              />
            ) : (
              <p className="text-white">{studentInfo.contactInfo.email}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <div>
          <h3 className="text-xl font-orbitron font-semibold mb-4 text-electric-blue">我的成果</h3>
          <ul className="space-y-2">
            {studentInfo.achievements.map((achievement, index) => (
              <li key={index} className="flex items-center text-white">
                <span className="mr-2">•</span>
                {achievement}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-orbitron font-semibold mb-4 text-electric-blue">我的项目</h3>
          <ul className="space-y-2">
            {studentInfo.projects.map((project, index) => (
              <li key={index} className="flex items-center text-white">
                <span className="mr-2">•</span>
                {project}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default StudentProfilePage;