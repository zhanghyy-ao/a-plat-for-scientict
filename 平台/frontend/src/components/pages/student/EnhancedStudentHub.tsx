import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';
import Sidebar from '../../layout/Sidebar';
import Button from '../../common/Button';
import Card from '../../common/Card';
import { useAuth } from '../../../contexts/AuthContext';
import { studentApi, mentorApi, myApi, progressApi } from '../../../utils/api';
import { 
  FiUser, FiBook, FiAward, FiMail, FiEdit, 
  FiCalendar, FiChevronRight, FiFile, FiPlus, 
  FiCheck, FiClock, FiTrendingUp, FiStar, 
  FiMessageSquare, FiActivity, FiArrowUpRight,
  FiLayout, FiFileText, FiEdit3
} from 'react-icons/fi';

const EnhancedStudentHub: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [studentMentor, setStudentMentor] = useState<any>(null);
  const [progressReports, setProgressReports] = useState<any[]>([]);
  const [studentLoading, setStudentLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    if (user?.role === 'student') {
      loadStudentData();
    }
  }, [user]);

  const loadStudentData = async () => {
    try {
      setStudentLoading(true);
      const progress = await myApi.getMyProgress().catch(() => []);
      
      if (user?.profile) {
        setStudentProfile(user.profile);
        if (user.profile.mentor_id) {
          const mentor = await mentorApi.getMentor(user.profile.mentor_id).catch(() => null);
          setStudentMentor(mentor);
        }
      }
      setProgressReports(progress);
    } catch (error) {
      console.error('Failed to load student data:', error);
    } finally {
      setStudentLoading(false);
    }
  };

  const stats = {
    totalProjects: progressReports.length,
    completedProjects: progressReports.filter(p => p.status === 'reviewed').length,
    ongoingProjects: progressReports.filter(p => p.status === 'pending').length,
    totalAchievements: 3,
    studyHours: 128,
    avgGrade: 92.5
  };

  const tabs = [
    { id: 'dashboard', name: '总览', icon: <FiActivity /> },
    { id: 'profile', name: '个人信息', icon: <FiUser /> },
    { id: 'progress', name: '课题进度', icon: <FiBook /> },
  ];

  const quickActions = [
    { name: '个人工作台', icon: <FiLayout />, to: '/dashboard', color: 'from-neon-purple to-neon-cyan' },
    { name: '课题进度', icon: <FiBook />, to: '/progress', color: 'from-neon-cyan to-electric-blue' },
    { name: '学习资源', icon: <FiFileText />, to: '/resources', color: 'from-neon-pink to-purple-light' },
    { name: '个人笔记', icon: <FiEdit3 />, to: '/notes', color: 'from-indigo-bright to-violet-deep' }
  ];

  const springConfig = {
    type: 'spring',
    stiffness: 300,
    damping: 20
  };

  return (
    <div className="min-h-screen flex gradient-bg particle-bg">
      <Sidebar type="student" />
      
      <div className="flex-1 flex flex-col min-h-screen">
        <Header title="学生中心" subtitle="欢迎回来，探索您的学术之旅" />
        
        <main className="flex-1 container mx-auto px-6 py-8">
          {loading || studentLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-16 h-16 border-4 border-electric-blue border-t-transparent rounded-full"
                />
                <p className="text-gray-400 animate-pulse">加载中...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={springConfig}
              >
                <Card className="p-8 glass-strong relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-neon-purple/15 to-neon-pink/15 rounded-full blur-3xl floating" />
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-neon-cyan/15 to-neon-purple/15 rounded-full blur-3xl floating-delay-1" />
                  
                  <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                    <motion.div
                      whileHover={{ scale: 1.05, rotate: 2 }}
                      transition={springConfig}
                      className="relative"
                    >
                      <div className="w-40 h-40 rounded-full bg-gradient-to-br from-neon-purple via-neon-cyan to-neon-pink p-1.5 shadow-2xl shadow-neon-purple/30 pulse-glow">
                        <div className="w-full h-full rounded-full bg-[var(--dark-gray)] flex items-center justify-center overflow-hidden">
                          <FiUser className="w-18 h-18 text-white" />
                        </div>
                      </div>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: 'spring', stiffness: 400, damping: 10 }}
                        className="absolute -bottom-3 -right-3 w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-[var(--dark-gray)] shadow-lg"
                      >
                        <FiCheck className="w-6 h-6 text-white" />
                      </motion.div>
                    </motion.div>
                    
                    <div className="flex-1 text-center md:text-left">
                      <motion.h1 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, ...springConfig }}
                        className="text-4xl font-bold text-white mb-2 font-orbitron"
                      >
                        {studentProfile?.name || '学生'}
                      </motion.h1>
                      <motion.p 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, ...springConfig }}
                        className="text-xl text-neon-purple font-medium mb-4"
                      >
                        {studentProfile?.student_type === 'graduate' ? '研究生' : studentProfile?.student_type === 'undergraduate' ? '本科生' : '学生'} · {studentProfile?.major || '计算机科学与技术'}
                      </motion.p>
                      <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.4, ...springConfig }}
                          className="px-5 py-2 bg-neon-purple/20 text-neon-purple rounded-full text-sm border border-neon-purple/30 font-medium"
                        >
                          {studentProfile?.grade || '2024级'}
                        </motion.span>
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5, ...springConfig }}
                          className="px-5 py-2 bg-cyan-light/20 text-cyan-light rounded-full text-sm border border-cyan-light/30 font-medium"
                        >
                          学号: {studentProfile?.student_no || '2024001'}
                        </motion.span>
                        {studentProfile?.gender && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6, ...springConfig }}
                            className="px-5 py-2 bg-neon-purple/20 text-neon-purple rounded-full text-sm border border-neon-purple/30 font-medium"
                          >
                            {studentProfile.gender}
                          </motion.span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Link to="/dashboard">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button className="bg-gradient-to-r from-neon-purple to-neon-cyan hover:from-neon-purple/90 hover:to-neon-cyan/90 border-0 shadow-lg shadow-neon-purple/20">
                            <FiLayout className="w-4 h-4 mr-2" />
                            工作台
                          </Button>
                        </motion.div>
                      </Link>
                      <Link to="/progress">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button className="bg-gradient-to-r from-neon-pink to-purple-light hover:from-neon-pink/90 hover:to-purple-light/90 border-0 shadow-lg">
                            <FiArrowUpRight className="w-4 h-4 mr-2" />
                            课题进度
                          </Button>
                        </motion.div>
                      </Link>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
                {tabs.map((tab, index) => (
                  <motion.button
                    key={tab.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, ...springConfig }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-6 py-3 rounded-xl whitespace-nowrap transition-all duration-300 font-medium relative group
                      ${activeTab === tab.id 
                        ? 'bg-gradient-to-r from-neon-purple to-neon-cyan text-white shadow-lg shadow-neon-purple/25' 
                        : 'bg-[var(--card)]/50 text-gray-400 hover:bg-[var(--card)] hover:text-white border border-white/5'}
                    `}
                  >
                    {tab.icon}
                    {tab.name}
                  </motion.button>
                ))}
              </div>

              {activeTab === 'dashboard' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={springConfig}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: '进度报告', value: stats.totalProjects, icon: <FiBook />, color: 'from-neon-purple to-neon-cyan', change: '+2' },
                      { label: '已反馈', value: stats.completedProjects, icon: <FiCheck />, color: 'from-teal-glow to-emerald-500', change: '+1' },
                      { label: '待审核', value: stats.ongoingProjects, icon: <FiClock />, color: 'from-neon-pink to-purple-light', change: '+1' },
                      { label: '学习时长', value: `${stats.studyHours}h`, icon: <FiStar />, color: 'from-indigo-bright to-violet-deep', change: '+8h' }
                    ].map((stat, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, ...springConfig }}
                        whileHover={{ y: -8, scale: 1.02 }}
                      >
                        <Card className="p-6 glass border border-white/10 hover:border-electric-blue/30 transition-all duration-300">
                          <div className="flex justify-between items-start mb-4">
                            <motion.div 
                              whileHover={{ rotate: 10 }}
                              transition={springConfig}
                              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}
                            >
                              {stat.icon}
                            </motion.div>
                            <span className="text-emerald-400 text-sm font-medium flex items-center gap-1">
                              <FiTrendingUp className="w-4 h-4" />
                              {stat.change}
                            </span>
                          </div>
                          <motion.h3 
                            key={stat.value}
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={springConfig}
                            className="text-3xl font-bold text-white mb-1"
                          >
                            {stat.value}
                          </motion.h3>
                          <p className="text-gray-400 text-sm">{stat.label}</p>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                      <Card className="p-6 glass-strong">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-bold text-white flex items-center gap-3 font-orbitron">
                            <FiBook className="w-6 h-6 text-electric-blue" />
                            最新进度
                          </h3>
                          <Link to="/progress">
                            <Button size="sm" variant="outline" className="border-white/20">
                              查看全部
                            </Button>
                          </Link>
                        </div>
                        <div className="space-y-4">
                          {progressReports.slice(0, 3).map((report, index) => (
                            <motion.div
                              key={report.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.15, ...springConfig }}
                              whileHover={{ x: 8, scale: 1.01 }}
                              className="p-4 bg-[var(--card)]/50 rounded-xl border border-white/5 hover:border-electric-blue/30 transition-all group"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-white group-hover:text-electric-blue transition-colors">
                                    {report.title}
                                  </h4>
                                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">{report.content}</p>
                                </div>
                                <span className={`px-3 py-1 text-xs font-medium rounded-full border flex-shrink-0 ${
                                  report.status === 'pending' 
                                    ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' 
                                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                }`}>
                                  {report.status === 'pending' ? '待审核' : '已反馈'}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 mt-3">
                                <span className="text-gray-500 text-xs flex items-center gap-1">
                                  <FiCalendar className="w-3 h-3" />
                                  {report.completion}% 完成度
                                </span>
                              </div>
                            </motion.div>
                          ))}
                          {progressReports.length === 0 && (
                            <div className="text-center py-8">
                              <FiBook className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                              <p className="text-gray-400">暂无进度报告</p>
                              <Link to="/progress" className="mt-4 inline-block">
                                <Button size="sm" className="bg-gradient-to-r from-electric-blue to-neon-cyan border-0">
                                  <FiPlus className="w-4 h-4 mr-2" />
                                  提交进度
                                </Button>
                              </Link>
                            </div>
                          )}
                        </div>
                      </Card>

                      <Card className="p-6 glass-strong">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3 font-orbitron">
                          <FiCalendar className="w-6 h-6 text-neon-cyan" />
                          快捷操作
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          {quickActions.map((action, index) => (
                            <Link key={index} to={action.to}>
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1, ...springConfig }}
                                whileHover={{ scale: 1.05, y: -4 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-4 bg-[var(--card)]/50 rounded-xl border border-white/5 hover:border-neon-cyan/30 transition-all cursor-pointer group"
                              >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white mb-3`}>
                                  {action.icon}
                                </div>
                                <p className="text-white font-medium group-hover:text-neon-cyan transition-colors">
                                  {action.name}
                                </p>
                              </motion.div>
                            </Link>
                          ))}
                        </div>
                      </Card>
                    </div>

                    <div className="space-y-6">
                      <Card className="p-6 glass-strong">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 font-orbitron">
                          <FiUser className="w-5 h-5 text-neon-cyan" />
                          研究方向
                        </h3>
                        <div className="p-4 bg-[var(--card)]/50 rounded-xl border border-white/5">
                          <p className="text-white">
                            {studentProfile?.research_topic || '深度学习在图像识别中的应用'}
                          </p>
                        </div>
                      </Card>

                      <Card className="p-6 glass-strong">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 font-orbitron">
                          <FiAward className="w-5 h-5 text-yellow-400" />
                          指导导师
                        </h3>
                        {studentMentor ? (
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3, ...springConfig }}
                            className="flex items-center gap-4 p-4 bg-[var(--card)]/50 rounded-xl border border-white/5"
                          >
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-cyan to-electric-blue flex items-center justify-center">
                              <FiUser className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-white">{studentMentor.name}</h4>
                              <p className="text-gray-400 text-sm">{studentMentor.title}</p>
                              {studentMentor.department && (
                                <p className="text-electric-blue text-sm">{studentMentor.department}</p>
                              )}
                            </div>
                          </motion.div>
                        ) : (
                          <div className="text-center py-8">
                            <FiUser className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400">暂无分配导师</p>
                          </div>
                        )}
                      </Card>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'profile' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={springConfig}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 p-8 glass-strong">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3 font-orbitron">
                          <FiUser className="w-6 h-6 text-electric-blue" />
                          个人信息
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="group">
                            <label className="block text-gray-400 text-sm mb-2 group-hover:text-white transition-colors">姓名</label>
                            <div className="bg-[var(--card)]/50 border border-white/10 rounded-lg px-4 py-3 text-white">
                              {studentProfile?.name || '-'}
                            </div>
                          </div>
                          <div className="group">
                            <label className="block text-gray-400 text-sm mb-2 group-hover:text-white transition-colors">学号</label>
                            <div className="bg-[var(--card)]/50 border border-white/10 rounded-lg px-4 py-3 text-white">
                              {studentProfile?.student_no || '-'}
                            </div>
                          </div>
                          <div className="group">
                            <label className="block text-gray-400 text-sm mb-2 group-hover:text-white transition-colors">专业</label>
                            <div className="bg-[var(--card)]/50 border border-white/10 rounded-lg px-4 py-3 text-white">
                              {studentProfile?.major || '-'}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="group">
                            <label className="block text-gray-400 text-sm mb-2 group-hover:text-white transition-colors">年级</label>
                            <div className="bg-[var(--card)]/50 border border-white/10 rounded-lg px-4 py-3 text-white">
                              {studentProfile?.grade || '-'}
                            </div>
                          </div>
                          <div className="group">
                            <label className="block text-gray-400 text-sm mb-2 group-hover:text-white transition-colors">学生类型</label>
                            <div className="bg-[var(--card)]/50 border border-white/10 rounded-lg px-4 py-3 text-white">
                              {studentProfile?.student_type === 'graduate' ? '研究生' : studentProfile?.student_type === 'undergraduate' ? '本科生' : studentProfile?.student_type || '-'}
                            </div>
                          </div>
                          <div className="group">
                            <label className="block text-gray-400 text-sm mb-2 group-hover:text-white transition-colors">研究方向</label>
                            <div className="bg-[var(--card)]/50 border border-white/10 rounded-lg px-4 py-3 text-white">
                              {studentProfile?.research_topic || '-'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <div className="space-y-6">
                      <Card className="p-6 glass-strong">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 font-orbitron">
                          <FiMail className="w-5 h-5 text-electric-blue" />
                          联系信息
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 p-3 bg-[var(--card)]/50 rounded-lg border border-white/5">
                            <div className="w-10 h-10 bg-electric-blue/20 rounded-lg flex items-center justify-center">
                              <FiMail className="w-5 h-5 text-electric-blue" />
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs">邮箱</p>
                              <p className="text-white">{user?.email || '-'}</p>
                            </div>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-6 glass-strong">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 font-orbitron">
                          <FiAward className="w-5 h-5 text-yellow-400" />
                          统计数据
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-[var(--card)]/50 rounded-lg border border-white/5">
                            <span className="text-gray-400">进度报告</span>
                            <span className="text-white font-semibold">{stats.totalProjects}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-[var(--card)]/50 rounded-lg border border-white/5">
                            <span className="text-gray-400">学习时长</span>
                            <span className="text-white font-semibold">{stats.studyHours}h</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-[var(--card)]/50 rounded-lg border border-white/5">
                            <span className="text-gray-400">完成进度</span>
                            <span className="text-emerald-400 font-semibold">{stats.completedProjects}</span>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default EnhancedStudentHub;
