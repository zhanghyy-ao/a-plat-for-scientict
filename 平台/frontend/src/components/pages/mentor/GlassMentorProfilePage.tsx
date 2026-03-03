import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  FaUser, FaUniversity, FaGraduationCap, FaBriefcase, 
  FaPhone, FaEnvelope, FaMapMarkerAlt, FaFlask, 
  FaAward, FaEdit, FaSave, FaChevronRight
} from 'react-icons/fa';

const GlassMentorProfilePage: React.FC = () => {
  const { user } = useAuth();
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
    setIsEditing(false);
    alert('个人信息已保存');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 particle-bg py-8">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 80 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold font-orbitron text-white mb-2">个人信息</h1>
            <p className="text-white/60 font-rajdhani text-lg">管理您的个人资料</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            className={`px-8 py-4 rounded-2xl font-semibold flex items-center gap-3 transition-all duration-300 ${
              isEditing
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-green-500/40'
                : 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-purple-500/40'
            }`}
          >
            {isEditing ? <FaSave /> : <FaEdit />}
            {isEditing ? '保存' : '编辑'}
          </motion.button>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <motion.div
            variants={itemVariants}
            className="glass-strong rounded-3xl p-8"
          >
            <div className="flex items-center mb-8 pb-8 border-b border-white/10">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-28 h-28 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-3xl flex items-center justify-center text-white text-5xl font-bold mr-8 shadow-lg shadow-purple-500/30"
              >
                {mentorInfo.name?.charAt(0) || 'W'}
              </motion.div>
              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={mentorInfo.name}
                    onChange={(e) => setMentorInfo({ ...mentorInfo, name: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-xl text-white text-2xl font-bold font-orbitron focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                ) : (
                  <h2 className="text-3xl font-bold font-orbitron text-white mb-2">{mentorInfo.name}</h2>
                )}
                <div className="flex items-center gap-4 text-white/60 font-rajdhani">
                  {isEditing ? (
                    <input
                      type="text"
                      value={mentorInfo.title}
                      onChange={(e) => setMentorInfo({ ...mentorInfo, title: e.target.value })}
                      className="px-3 py-1 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  ) : (
                    <span>{mentorInfo.title}</span>
                  )}
                  <span>•</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={mentorInfo.department}
                      onChange={(e) => setMentorInfo({ ...mentorInfo, department: e.target.value })}
                      className="px-3 py-1 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  ) : (
                    <span>{mentorInfo.department}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="glass rounded-2xl p-6"
                >
                  <h3 className="font-semibold font-orbitron text-white mb-6 flex items-center gap-3">
                    <FaUniversity className="text-purple-400" />
                    基本信息
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/50 mb-2 text-sm font-rajdhani">姓名</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={mentorInfo.name}
                          onChange={(e) => setMentorInfo({ ...mentorInfo, name: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                      ) : (
                        <p className="text-white">{mentorInfo.name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-white/50 mb-2 text-sm font-rajdhani">职称</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={mentorInfo.title}
                          onChange={(e) => setMentorInfo({ ...mentorInfo, title: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                      ) : (
                        <p className="text-white">{mentorInfo.title}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-white/50 mb-2 text-sm font-rajdhani">所属部门</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={mentorInfo.department}
                          onChange={(e) => setMentorInfo({ ...mentorInfo, department: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                      ) : (
                        <p className="text-white">{mentorInfo.department}</p>
                      )}
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="glass rounded-2xl p-6"
                >
                  <h3 className="font-semibold font-orbitron text-white mb-6 flex items-center gap-3">
                    <FaEnvelope className="text-cyan-400" />
                    联系方式
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/50 mb-2 text-sm font-rajdhani flex items-center gap-2">
                        <FaPhone className="text-sm" />
                        联系电话
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={mentorInfo.contactInfo.phone}
                          onChange={(e) => setMentorInfo({ 
                            ...mentorInfo, 
                            contactInfo: { ...mentorInfo.contactInfo, phone: e.target.value } 
                          })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                      ) : (
                        <p className="text-white">{mentorInfo.contactInfo.phone}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-white/50 mb-2 text-sm font-rajdhani flex items-center gap-2">
                        <FaEnvelope className="text-sm" />
                        邮箱
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={mentorInfo.contactInfo.email}
                          onChange={(e) => setMentorInfo({ 
                            ...mentorInfo, 
                            contactInfo: { ...mentorInfo.contactInfo, email: e.target.value } 
                          })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                      ) : (
                        <p className="text-white">{mentorInfo.contactInfo.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-white/50 mb-2 text-sm font-rajdhani flex items-center gap-2">
                        <FaMapMarkerAlt className="text-sm" />
                        办公室
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={mentorInfo.contactInfo.office}
                          onChange={(e) => setMentorInfo({ 
                            ...mentorInfo, 
                            contactInfo: { ...mentorInfo.contactInfo, office: e.target.value } 
                          })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                      ) : (
                        <p className="text-white">{mentorInfo.contactInfo.office}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="space-y-6">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="glass rounded-2xl p-6"
                >
                  <h3 className="font-semibold font-orbitron text-white mb-6 flex items-center gap-3">
                    <FaFlask className="text-purple-400" />
                    研究方向
                  </h3>
                  {isEditing ? (
                    <input
                      type="text"
                      value={mentorInfo.researchArea.join(', ')}
                      onChange={(e) => setMentorInfo({ 
                        ...mentorInfo, 
                        researchArea: e.target.value.split(',').map(item => item.trim()) 
                      })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      placeholder="用逗号分隔多个研究方向"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {mentorInfo.researchArea.map((area, index) => (
                        <motion.span
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-full text-white/80 text-sm"
                        >
                          {area}
                        </motion.span>
                      ))}
                    </div>
                  )}
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="glass rounded-2xl p-6"
                >
                  <h3 className="font-semibold font-orbitron text-white mb-6 flex items-center gap-3">
                    <FaGraduationCap className="text-cyan-400" />
                    教育背景
                  </h3>
                  {isEditing ? (
                    <textarea
                      value={mentorInfo.educationBackground}
                      onChange={(e) => setMentorInfo({ ...mentorInfo, educationBackground: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      rows={3}
                    />
                  ) : (
                    <p className="text-white/80 leading-relaxed">{mentorInfo.educationBackground}</p>
                  )}
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="glass rounded-2xl p-6"
                >
                  <h3 className="font-semibold font-orbitron text-white mb-6 flex items-center gap-3">
                    <FaBriefcase className="text-purple-400" />
                    工作经历
                  </h3>
                  {isEditing ? (
                    <textarea
                      value={mentorInfo.workExperience}
                      onChange={(e) => setMentorInfo({ ...mentorInfo, workExperience: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      rows={3}
                    />
                  ) : (
                    <p className="text-white/80 leading-relaxed">{mentorInfo.workExperience}</p>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="glass-strong rounded-3xl p-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="glass rounded-2xl p-6"
              >
                <h3 className="font-semibold font-orbitron text-white mb-6 flex items-center gap-3">
                  <FaFlask className="text-purple-400" />
                  负责项目
                </h3>
                <ul className="space-y-3">
                  {mentorInfo.projects.map((project, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center text-white/80"
                    >
                      <FaChevronRight className="mr-3 text-purple-400 text-sm" />
                      {project}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="glass rounded-2xl p-6"
              >
                <h3 className="font-semibold font-orbitron text-white mb-6 flex items-center gap-3">
                  <FaAward className="text-cyan-400" />
                  主要成果
                </h3>
                <ul className="space-y-3">
                  {mentorInfo.achievements.map((achievement, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center text-white/80"
                    >
                      <FaChevronRight className="mr-3 text-cyan-400 text-sm" />
                      {achievement}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="glass rounded-2xl p-6"
              >
                <h3 className="font-semibold font-orbitron text-white mb-6 flex items-center gap-3">
                  <FaUserGraduate className="text-purple-400" />
                  指导学生
                </h3>
                <ul className="space-y-3">
                  {mentorInfo.students.map((student, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center text-white/80"
                    >
                      <FaChevronRight className="mr-3 text-purple-400 text-sm" />
                      {student}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default GlassMentorProfilePage;
