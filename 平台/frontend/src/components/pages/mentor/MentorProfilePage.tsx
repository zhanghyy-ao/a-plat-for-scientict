import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../../common/Button';

const MentorProfilePage: React.FC = () => {
  const [mentorInfo, setMentorInfo] = useState({
    id: '1',
    name: '王教授',
    title: '教授',
    department: '计算机科学与技术系',
    researchArea: ['人工智能', '机器学习', '数据挖掘'],
    educationBackground: '博士，清华大学计算机科学与技术',
    workExperience: '2005年至今，在计算机学院任教',
    contactInfo: {
      phone: '13900139000',
      email: 'wang@example.com',
      office: '科技楼 501'
    },
    projects: ['智能推荐系统研究', '机器学习算法优化'],
    achievements: ['国家自然科学基金', '教育部科技进步奖'],
    students: ['张三', '李四', '王五']
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
                value={mentorInfo.name}
                onChange={(e) => setMentorInfo({ ...mentorInfo, name: e.target.value })}
                className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-electric-blue"
              />
            ) : (
              <p className="text-white">{mentorInfo.name}</p>
            )}
          </div>

          <div>
            <label className="block text-light-gray mb-2">职称</label>
            {isEditing ? (
              <input
                type="text"
                value={mentorInfo.title}
                onChange={(e) => setMentorInfo({ ...mentorInfo, title: e.target.value })}
                className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-electric-blue"
              />
            ) : (
              <p className="text-white">{mentorInfo.title}</p>
            )}
          </div>

          <div>
            <label className="block text-light-gray mb-2">所属部门</label>
            {isEditing ? (
              <input
                type="text"
                value={mentorInfo.department}
                onChange={(e) => setMentorInfo({ ...mentorInfo, department: e.target.value })}
                className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-electric-blue"
              />
            ) : (
              <p className="text-white">{mentorInfo.department}</p>
            )}
          </div>

          <div>
            <label className="block text-light-gray mb-2">联系电话</label>
            {isEditing ? (
              <input
                type="text"
                value={mentorInfo.contactInfo.phone}
                onChange={(e) => setMentorInfo({ 
                  ...mentorInfo, 
                  contactInfo: { ...mentorInfo.contactInfo, phone: e.target.value } 
                })}
                className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-electric-blue"
              />
            ) : (
              <p className="text-white">{mentorInfo.contactInfo.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-light-gray mb-2">邮箱</label>
            {isEditing ? (
              <input
                type="email"
                value={mentorInfo.contactInfo.email}
                onChange={(e) => setMentorInfo({ 
                  ...mentorInfo, 
                  contactInfo: { ...mentorInfo.contactInfo, email: e.target.value } 
                })}
                className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-electric-blue"
              />
            ) : (
              <p className="text-white">{mentorInfo.contactInfo.email}</p>
            )}
          </div>

          <div>
            <label className="block text-light-gray mb-2">办公室</label>
            {isEditing ? (
              <input
                type="text"
                value={mentorInfo.contactInfo.office}
                onChange={(e) => setMentorInfo({ 
                  ...mentorInfo, 
                  contactInfo: { ...mentorInfo.contactInfo, office: e.target.value } 
                })}
                className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-electric-blue"
              />
            ) : (
              <p className="text-white">{mentorInfo.contactInfo.office}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-light-gray mb-2">研究方向</label>
            {isEditing ? (
              <input
                type="text"
                value={mentorInfo.researchArea.join(', ')}
                onChange={(e) => setMentorInfo({ 
                  ...mentorInfo, 
                  researchArea: e.target.value.split(',').map(item => item.trim()) 
                })}
                className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-electric-blue"
                placeholder="用逗号分隔多个研究方向"
              />
            ) : (
              <ul className="space-y-1">
                {mentorInfo.researchArea.map((area, index) => (
                  <li key={index} className="flex items-center text-white">
                    <span className="mr-2">•</span>
                    {area}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="block text-light-gray mb-2">教育背景</label>
            {isEditing ? (
              <textarea
                value={mentorInfo.educationBackground}
                onChange={(e) => setMentorInfo({ ...mentorInfo, educationBackground: e.target.value })}
                className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-electric-blue"
                rows={3}
              />
            ) : (
              <p className="text-white">{mentorInfo.educationBackground}</p>
            )}
          </div>

          <div>
            <label className="block text-light-gray mb-2">工作经历</label>
            {isEditing ? (
              <textarea
                value={mentorInfo.workExperience}
                onChange={(e) => setMentorInfo({ ...mentorInfo, workExperience: e.target.value })}
                className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-electric-blue"
                rows={3}
              />
            ) : (
              <p className="text-white">{mentorInfo.workExperience}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <div>
          <h3 className="text-xl font-orbitron font-semibold mb-4 text-electric-blue">负责项目</h3>
          <ul className="space-y-2">
            {mentorInfo.projects.map((project, index) => (
              <li key={index} className="flex items-center text-white">
                <span className="mr-2">•</span>
                {project}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-orbitron font-semibold mb-4 text-electric-blue">主要成果</h3>
          <ul className="space-y-2">
            {mentorInfo.achievements.map((achievement, index) => (
              <li key={index} className="flex items-center text-white">
                <span className="mr-2">•</span>
                {achievement}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-orbitron font-semibold mb-4 text-electric-blue">指导学生</h3>
          <ul className="space-y-2">
            {mentorInfo.students.map((student, index) => (
              <li key={index} className="flex items-center text-white">
                <span className="mr-2">•</span>
                {student}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default MentorProfilePage;