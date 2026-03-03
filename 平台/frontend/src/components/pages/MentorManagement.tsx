import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import { useAuth } from '../../contexts/AuthContext';

interface Mentor {
  id: string;
  name: string;
  title: string;
  department: string;
  researchArea: string[];
  email: string;
  phone: string;
  studentCount: number;
}

interface Student {
  id: string;
  name: string;
  studentId: string;
  major: string;
  grade: string;
  studentType: 'undergraduate' | 'graduate' | 'phd';
  researchArea: string;
  email: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'planning' | 'ongoing' | 'completed';
  startDate: string;
  endDate?: string;
  students: string[];
  funding: string;
  progress: number;
}

interface Achievement {
  id: string;
  title: string;
  type: 'paper' | 'project' | 'award' | 'patent';
  date: string;
  authors: string[];
  venue: string;
  description: string;
}

const MentorManagement: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFloatingMenu, setShowFloatingMenu] = useState(false);

  const mentors: Mentor[] = [
    {
      id: '1',
      name: '李教授',
      title: '教授',
      department: '计算机科学与技术系',
      researchArea: ['人工智能', '机器学习'],
      email: 'liprof@example.com',
      phone: '13900139001',
      studentCount: 5
    },
    {
      id: '2',
      name: '王副教授',
      title: '副教授',
      department: '软件工程系',
      researchArea: ['软件工程', '分布式系统'],
      email: 'wangprof@example.com',
      phone: '13900139002',
      studentCount: 3
    },
    {
      id: '3',
      name: '张讲师',
      title: '讲师',
      department: '人工智能系',
      researchArea: ['计算机视觉', '深度学习'],
      email: 'zhangprof@example.com',
      phone: '13900139003',
      studentCount: 4
    }
  ];

  const mentorData = {
    name: '李教授',
    title: '教授',
    department: '计算机科学与技术系',
    researchArea: ['人工智能', '机器学习', '计算机视觉'],
    educationBackground: '清华大学计算机科学博士',
    workExperience: '20年科研和教学经验',
    contactInfo: {
      phone: '13900139001',
      email: 'liprof@example.com',
      office: '科研楼A301'
    }
  };

  const students: Student[] = [
    {
      id: '1',
      name: '张三',
      studentId: '20230001',
      major: '计算机科学与技术',
      grade: '2023级',
      studentType: 'graduate',
      researchArea: '人工智能',
      email: 'zhangsan@example.com'
    },
    {
      id: '2',
      name: '李四',
      studentId: '20230002',
      major: '软件工程',
      grade: '2023级',
      studentType: 'phd',
      researchArea: '计算机视觉',
      email: 'lisi@example.com'
    },
    {
      id: '3',
      name: '王五',
      studentId: '20220001',
      major: '人工智能',
      grade: '2022级',
      studentType: 'graduate',
      researchArea: '机器学习',
      email: 'wangwu@example.com'
    }
  ];

  const projects: Project[] = [
    {
      id: '1',
      title: '基于深度学习的图像识别研究',
      description: '研究新一代深度学习架构，提升图像识别准确率',
      status: 'ongoing',
      startDate: '2023-06-01',
      students: ['张三', '李四'],
      funding: '国家自然科学基金',
      progress: 65
    },
    {
      id: '2',
      title: '智能推荐系统开发',
      description: '开发个性化推荐系统，应用于教育领域',
      status: 'planning',
      startDate: '2024-03-01',
      students: ['王五'],
      funding: '省部级项目',
      progress: 20
    },
    {
      id: '3',
      title: '自然语言处理应用',
      description: '研究NLP技术在智能问答中的应用',
      status: 'completed',
      startDate: '2022-09-01',
      endDate: '2023-12-31',
      students: ['赵六', '钱七'],
      funding: '企业合作项目',
      progress: 100
    }
  ];

  const achievements: Achievement[] = [
    {
      id: '1',
      title: '高效图像识别算法研究',
      type: 'paper',
      date: '2024-01-15',
      authors: ['李教授', '张三', '李四'],
      venue: 'CVPR 2024',
      description: '发表于顶级计算机视觉会议'
    },
    {
      id: '2',
      title: '智能教育系统',
      type: 'project',
      date: '2023-11-20',
      authors: ['李教授', '王五'],
      venue: '教育部重点项目',
      description: '获得省部级科技进步奖'
    },
    {
      id: '3',
      title: '一种深度学习训练方法',
      type: 'patent',
      date: '2023-08-10',
      authors: ['李教授'],
      venue: '国家发明专利',
      description: '已获得授权'
    }
  ];

  const filteredMentors = mentors.filter(mentor =>
    mentor.name.includes(searchTerm) ||
    mentor.department.includes(searchTerm) ||
    mentor.researchArea.some(area => area.includes(searchTerm))
  );

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const getStudentTypeName = (type: string) => {
    const names: Record<string, string> = {
      undergraduate: '本科生',
      graduate: '研究生',
      phd: '博士生'
    };
    return names[type] || type;
  };

  const getStudentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      undergraduate: 'bg-blue-500/20 text-blue-400',
      graduate: 'bg-green-500/20 text-green-400',
      phd: 'bg-purple-500/20 text-purple-400'
    };
    return colors[type] || 'bg-gray-500/20 text-gray-400';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planning: 'bg-yellow-500/20 text-yellow-400',
      ongoing: 'bg-green-500/20 text-green-400',
      completed: 'bg-blue-500/20 text-blue-400'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      planning: '规划中',
      ongoing: '进行中',
      completed: '已完成'
    };
    return texts[status] || status;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'paper':
        return '📄';
      case 'project':
        return '🔬';
      case 'award':
        return '🏆';
      case 'patent':
        return '💡';
      default:
        return '📋';
    }
  };

  const handleAddMentor = () => {
    alert('添加导师功能（需对接后端API）');
    setShowAddModal(false);
  };

  const handleEditMentor = () => {
    alert('编辑导师功能（需对接后端API）');
    setShowEditModal(false);
    setSelectedMentor(null);
  };

  const handleDeleteMentor = (id: string) => {
    if (confirm('确定要删除这位导师吗？')) {
      alert('删除导师功能（需对接后端API）');
    }
  };

  const handleUpdateProject = () => {
    alert('更新项目进度功能（需对接后端API）');
    setShowProjectModal(false);
    setSelectedProject(null);
  };

  if (user?.role === 'admin') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header title="导师管理" subtitle="管理系统中的导师信息" />
        
        <div className="flex-1 container mx-auto px-4 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue"></div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="relative flex-1 w-full md:w-96">
                  <input
                    type="text"
                    placeholder="搜索导师姓名、部门或研究方向..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-dark-gray border border-light-gray/20 rounded-lg px-4 py-3 text-white placeholder-light-gray/50 focus:outline-none focus:border-electric-blue transition-colors"
                  />
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-electric-blue text-deep-space font-semibold px-6 py-3 rounded-lg hover:bg-electric-blue/80 transition-colors"
                >
                  + 添加导师
                </button>
              </div>

              <div className="bg-dark-gray/50 border border-light-gray/10 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-dark-gray">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-orbitron text-light-gray uppercase tracking-wider">姓名</th>
                        <th className="px-6 py-4 text-left text-xs font-orbitron text-light-gray uppercase tracking-wider">职称</th>
                        <th className="px-6 py-4 text-left text-xs font-orbitron text-light-gray uppercase tracking-wider">部门</th>
                        <th className="px-6 py-4 text-left text-xs font-orbitron text-light-gray uppercase tracking-wider">研究方向</th>
                        <th className="px-6 py-4 text-left text-xs font-orbitron text-light-gray uppercase tracking-wider">学生数</th>
                        <th className="px-6 py-4 text-left text-xs font-orbitron text-light-gray uppercase tracking-wider">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-light-gray/10">
                      {filteredMentors.map((mentor) => (
                        <tr key={mentor.id} className="hover:bg-light-gray/5 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-electric-blue/20 rounded-full flex items-center justify-center text-electric-blue font-semibold">
                                {mentor.name.charAt(0)}
                              </div>
                              <div className="ml-4">
                                <div className="text-white font-medium">{mentor.name}</div>
                                <div className="text-light-gray text-sm">{mentor.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-white">{mentor.title}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-white">{mentor.department}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {mentor.researchArea.map((area, idx) => (
                              <span key={idx} className="px-2 py-1 bg-electric-blue/20 text-electric-blue text-xs rounded">
                                {area}
                              </span>
                            ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-white">{mentor.studentCount}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setSelectedMentor(mentor);
                                  setShowEditModal(true);
                                }}
                                className="text-electric-blue hover:text-electric-blue/80 mr-3"
                              >
                                编辑
                              </button>
                              <button
                                onClick={() => handleDeleteMentor(mentor.id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                删除
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </div>
        
        <Footer />

        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-deep-space border border-light-gray/20 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-orbitron font-semibold text-electric-blue mb-4">添加导师</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-light-gray text-sm mb-1">姓名</label>
                  <input type="text" className="w-full bg-dark-gray border border-light-gray/20 rounded-lg px-4 py-2 text-white" placeholder="请输入姓名" />
                </div>
                <div>
                  <label className="block text-light-gray text-sm mb-1">职称</label>
                  <input type="text" className="w-full bg-dark-gray border border-light-gray/20 rounded-lg px-4 py-2 text-white" placeholder="请输入职称" />
                </div>
                <div>
                  <label className="block text-light-gray text-sm mb-1">部门</label>
                  <input type="text" className="w-full bg-dark-gray border border-light-gray/20 rounded-lg px-4 py-2 text-white" placeholder="请输入部门" />
                </div>
                <div>
                  <label className="block text-light-gray text-sm mb-1">研究方向（逗号分隔）</label>
                  <input type="text" className="w-full bg-dark-gray border border-light-gray/20 rounded-lg px-4 py-2 text-white" placeholder="请输入研究方向" />
                </div>
                <div>
                  <label className="block text-light-gray text-sm mb-1">邮箱</label>
                  <input type="email" className="w-full bg-dark-gray border border-light-gray/20 rounded-lg px-4 py-2 text-white" placeholder="请输入邮箱" />
                </div>
                <div>
                  <label className="block text-light-gray text-sm mb-1">电话</label>
                  <input type="tel" className="w-full bg-dark-gray border border-light-gray/20 rounded-lg px-4 py-2 text-white" placeholder="请输入电话" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-light-gray hover:text-white transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAddMentor}
                  className="px-4 py-2 bg-electric-blue text-deep-space rounded-lg hover:bg-electric-blue/80 transition-colors"
                >
                  确定
                </button>
              </div>
            </div>
          </div>
        )}

        {showEditModal && selectedMentor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-deep-space border border-light-gray/20 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-orbitron font-semibold text-electric-blue mb-4">编辑导师</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-light-gray text-sm mb-1">姓名</label>
                  <input type="text" defaultValue={selectedMentor.name} className="w-full bg-dark-gray border border-light-gray/20 rounded-lg px-4 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-light-gray text-sm mb-1">职称</label>
                  <input type="text" defaultValue={selectedMentor.title} className="w-full bg-dark-gray border border-light-gray/20 rounded-lg px-4 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-light-gray text-sm mb-1">部门</label>
                  <input type="text" defaultValue={selectedMentor.department} className="w-full bg-dark-gray border border-light-gray/20 rounded-lg px-4 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-light-gray text-sm mb-1">邮箱</label>
                  <input type="email" defaultValue={selectedMentor.email} className="w-full bg-dark-gray border border-light-gray/20 rounded-lg px-4 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-light-gray text-sm mb-1">电话</label>
                  <input type="tel" defaultValue={selectedMentor.phone} className="w-full bg-dark-gray border border-light-gray/20 rounded-lg px-4 py-2 text-white" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedMentor(null);
                  }}
                  className="px-4 py-2 text-light-gray hover:text-white transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleEditMentor}
                  className="px-4 py-2 bg-electric-blue text-deep-space rounded-lg hover:bg-electric-blue/80 transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header title="导师中心" subtitle="管理您的学生、项目和成果" />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue"></div>
          </div>
        ) : (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-dark-gray/50 border border-light-gray/10 rounded-lg p-6"
            >
              <h3 className="text-xl font-orbitron font-semibold text-electric-blue mb-6">
                个人信息
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-light-gray text-sm mb-1">姓名</label>
                  <p className="text-white">{mentorData.name}</p>
                </div>
                <div>
                  <label className="block text-light-gray text-sm mb-1">职称</label>
                  <p className="text-white">{mentorData.title}</p>
                </div>
                <div>
                  <label className="block text-light-gray text-sm mb-1">所属部门</label>
                  <p className="text-white">{mentorData.department}</p>
                </div>
                <div>
                  <label className="block text-light-gray text-sm mb-1">研究方向</label>
                  <div className="flex flex-wrap gap-2">
                    {mentorData.researchArea.map((area, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-electric-blue/20 text-electric-blue text-xs rounded-full"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-light-gray text-sm mb-1">联系电话</label>
                  <p className="text-white">{mentorData.contactInfo.phone}</p>
                </div>
                <div>
                  <label className="block text-light-gray text-sm mb-1">电子邮箱</label>
                  <p className="text-white">{mentorData.contactInfo.email}</p>
                </div>
                <div>
                  <label className="block text-light-gray text-sm mb-1">办公室</label>
                  <p className="text-white">{mentorData.contactInfo.office}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-dark-gray/50 border border-light-gray/10 rounded-lg p-6"
            >
              <h3 className="text-xl font-orbitron font-semibold text-electric-blue mb-6">
                指导学生 ({students.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="bg-dark-gray border border-light-gray/10 rounded-lg p-4 hover:border-electric-blue transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-white">{student.name}</h4>
                        <p className="text-light-gray text-sm">{student.studentId}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStudentTypeColor(student.studentType)}`}>
                        {getStudentTypeName(student.studentType)}
                      </span>
                    </div>
                    <p className="text-light-gray text-sm mb-2">{student.major} · {student.grade}</p>
                    <p className="text-light-gray text-sm mb-2">研究方向: {student.researchArea}</p>
                    <p className="text-light-gray text-xs">{student.email}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-dark-gray/50 border border-light-gray/10 rounded-lg p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-orbitron font-semibold text-electric-blue">
                  负责项目 ({projects.length})
                </h3>
              </div>
              <div className="space-y-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-dark-gray border border-light-gray/10 rounded-lg p-4 hover:border-electric-blue transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-white">{project.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
                          {getStatusText(project.status)}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedProject(project);
                            setShowProjectModal(true);
                          }}
                          className="text-electric-blue text-sm hover:underline"
                        >
                          更新进度
                        </button>
                      </div>
                    </div>
                    <p className="text-light-gray text-sm mb-3">{project.description}</p>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-light-gray mb-1">
                        <span>项目进度</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="w-full bg-light-gray/20 rounded-full h-2">
                        <div
                          className="bg-electric-blue h-2 rounded-full transition-all duration-500"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-light-gray text-xs">
                      <span>开始: {project.startDate}</span>
                      {project.endDate && <span>结束: {project.endDate}</span>}
                      <span>学生: {project.students.join(', ')}</span>
                      <span>经费: {project.funding}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-dark-gray/50 border border-light-gray/10 rounded-lg p-6"
            >
              <h3 className="text-xl font-orbitron font-semibold text-electric-blue mb-6">
                主要成果
              </h3>
              <div className="space-y-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-start gap-4 bg-dark-gray border border-light-gray/10 rounded-lg p-4"
                  >
                    <div className="text-3xl">{getTypeIcon(achievement.type)}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-white">{achievement.title}</h4>
                        <span className="text-light-gray text-sm">{achievement.date}</span>
                      </div>
                      <p className="text-light-gray text-sm mt-1">{achievement.venue}</p>
                      <p className="text-light-gray text-sm mt-1">作者: {achievement.authors.join(', ')}</p>
                      <p className="text-light-gray text-xs mt-1">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>
      
      <Footer />

      <div className="fixed bottom-6 right-6">
        {showFloatingMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute bottom-16 right-0 flex flex-col gap-2"
          >
            <button
              onClick={() => {
                alert('发送文件给学生功能');
                setShowFloatingMenu(false);
              }}
              className="bg-dark-gray border border-light-gray/20 px-4 py-2 rounded-lg text-white hover:border-electric-blue transition-colors whitespace-nowrap"
            >
              📤 发送文件
            </button>
            <button
              onClick={() => {
                alert('添加新项目功能');
                setShowFloatingMenu(false);
              }}
              className="bg-dark-gray border border-light-gray/20 px-4 py-2 rounded-lg text-white hover:border-electric-blue transition-colors whitespace-nowrap"
            >
              ➕ 添加项目
            </button>
          </motion.div>
        )}
        <button
          onClick={() => setShowFloatingMenu(!showFloatingMenu)}
          className="w-14 h-14 bg-electric-blue text-deep-space rounded-full flex items-center justify-center text-2xl shadow-lg hover:bg-electric-blue/80 transition-colors"
        >
          {showFloatingMenu ? '✕' : '+'}
        </button>
      </div>

      {showProjectModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-deep-space border border-light-gray/20 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-orbitron font-semibold text-electric-blue mb-4">
              更新项目进度
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-light-gray text-sm mb-1">项目名称</label>
                <p className="text-white">{selectedProject.title}</p>
              </div>
              <div>
                <label className="block text-light-gray text-sm mb-1">项目进度 (%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue={selectedProject.progress}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-light-gray text-sm mb-1">备注</label>
                <textarea
                  className="w-full bg-dark-gray border border-light-gray/20 rounded-lg px-4 py-2 text-white"
                  rows={3}
                  placeholder="添加项目备注..."
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowProjectModal(false);
                  setSelectedProject(null);
                }}
                className="px-4 py-2 text-light-gray hover:text-white transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleUpdateProject}
                className="px-4 py-2 bg-electric-blue text-deep-space rounded-lg hover:bg-electric-blue/80 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorManagement;
