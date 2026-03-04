import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { myApi, messageApi, taskApi, appointmentApi, notificationApi } from '../../../utils/api';
import { 
  FaUsers, FaTasks, FaCalendarAlt, FaBell, FaComments, 
  FaUserGraduate, FaClipboardList, FaCheckCircle, FaArrowRight,
  FaClock, FaArrowUp, FaRocket
} from 'react-icons/fa';

const GlassMentorDashboard: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [pendingProgress, setPendingProgress] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'mentor') {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const [studentsData, progressData, tasksData, appointmentsData, notificationsData, messagesData] = await Promise.all([
        myApi.getMyStudents(),
        myApi.getMyPendingProgress(),
        taskApi.getTasks(),
        appointmentApi.getAppointments(),
        notificationApi.getNotifications(),
        messageApi.getMessages()
      ]);
      
      setStudents(studentsData);
      setPendingProgress(progressData);
      setTasks(tasksData);
      setAppointments(appointmentsData);
      setNotifications(notificationsData);
      setMessages(messagesData.received || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const unreadMessages = messages.filter(m => !m.is_read).length;
  const unreadNotifications = notifications.filter(n => !n.is_read).length;
  const upcomingAppointments = appointments.filter(a => 
    a.status === 'pending' || a.status === 'confirmed'
  ).slice(0, 3);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        mass: 0.8
      }
    }
  };

  const statCardVariants = {
    hover: {
      scale: 1.05,
      y: -8,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: {
      scale: 0.95
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-transparent border-t-blue-500 border-r-cyan-500 rounded-full mx-auto mb-6"
          />
          <p className="text-white/80 text-lg font-rajdhani tracking-wider">LOADING</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 particle-bg">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="mb-10"
        >
          <div className="glass-strong rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl font-bold font-orbitron text-white mb-3">
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-sky-400 bg-clip-text text-transparent">
                  导师工作台
                </span>
              </h1>
              <p className="text-white/70 text-lg font-rajdhani">
                欢迎回来，<span className="text-cyan-400 font-semibold">{user?.profile?.name || '导师'}</span>！
                今天是个指导学生的好日子 🚀
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
        >
          <motion.div variants={itemVariants} whileHover="hover" whileTap="tap">
            <Link to="/my-students" className="block">
              <motion.div
                variants={statCardVariants}
                className="glass rounded-3xl p-8 h-full relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30"
                    >
                      <FaUsers className="text-2xl text-white" />
                    </motion.div>
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                      <FaArrowUp className="text-emerald-400" />
                    </div>
                  </div>
                  <p className="text-white/60 text-sm font-rajdhani uppercase tracking-wider mb-2">学生数量</p>
                  <p className="text-4xl font-bold font-orbitron text-white">{students.length}</p>
                </div>
              </motion.div>
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} whileHover="hover" whileTap="tap">
            <Link to="/pending-progress" className="block">
              <motion.div
                variants={statCardVariants}
                className="glass rounded-3xl p-8 h-full relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                      className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30"
                    >
                      <FaClipboardList className="text-2xl text-white" />
                    </motion.div>
                    {pendingProgress.length > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center"
                      >
                        <span className="text-white font-bold">{pendingProgress.length}</span>
                      </motion.div>
                    )}
                  </div>
                  <p className="text-white/60 text-sm font-rajdhani uppercase tracking-wider mb-2">待审进度</p>
                  <p className="text-4xl font-bold font-orbitron text-white">{pendingProgress.length}</p>
                </div>
              </motion.div>
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} whileHover="hover" whileTap="tap">
            <Link to="/messages" className="block">
              <motion.div
                variants={statCardVariants}
                className="glass rounded-3xl p-8 h-full relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                      className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30"
                    >
                      <FaComments className="text-2xl text-white" />
                    </motion.div>
                    {unreadMessages > 0 && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center"
                      >
                        <span className="text-white font-bold">{unreadMessages}</span>
                      </motion.div>
                    )}
                  </div>
                  <p className="text-white/60 text-sm font-rajdhani uppercase tracking-wider mb-2">新消息</p>
                  <p className="text-4xl font-bold font-orbitron text-white">{unreadMessages}</p>
                </div>
              </motion.div>
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} whileHover="hover" whileTap="tap">
            <Link to="/notifications" className="block">
              <motion.div
                variants={statCardVariants}
                className="glass rounded-3xl p-8 h-full relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4 }}
                      className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/30"
                    >
                      <FaBell className="text-2xl text-white" />
                    </motion.div>
                    {unreadNotifications > 0 && (
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center"
                      >
                        <span className="text-white font-bold">{unreadNotifications}</span>
                      </motion.div>
                    )}
                  </div>
                  <p className="text-white/60 text-sm font-rajdhani uppercase tracking-wider mb-2">新通知</p>
                  <p className="text-4xl font-bold font-orbitron text-white">{unreadNotifications}</p>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 80, delay: 0.3 }}
            className="lg:col-span-2 space-y-8"
          >
            <motion.div className="glass-strong rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold font-orbitron text-white flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                      <FaUserGraduate className="text-lg text-white" />
                    </div>
                    学生列表
                  </h2>
                  <Link 
                    to="/my-students" 
                    className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-rajdhani font-semibold"
                  >
                    查看全部 <FaArrowRight />
                  </Link>
                </div>
                
                {students.length === 0 ? (
                  <div className="text-center py-16">
                    <FaUserGraduate className="w-20 h-20 text-white/20 mx-auto mb-6" />
                    <p className="text-white/50 text-lg font-rajdhani">暂无学生</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {students.slice(0, 4).map((student, index) => (
                      <motion.div
                        key={student.id}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: "spring", stiffness: 100, delay: 0.4 + index * 0.1 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link 
                          to={`/my-students/${student.id}`}
                          className="block"
                        >
                          <div className="glass-light rounded-2xl p-6 flex items-center gap-6 hover:bg-white/10 transition-all duration-300">
                            <motion.div
                              whileHover={{ rotate: 360 }}
                              transition={{ duration: 0.6 }}
                              className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-blue-500/25"
                            >
                              {student.name?.charAt(0) || 'S'}
                            </motion.div>
                            <div className="flex-1">
                              <p className="font-semibold text-white text-lg mb-1">{student.name}</p>
                              <p className="text-white/60 text-sm font-rajdhani">{student.student_no} · {student.grade}</p>
                            </div>
                            <FaCheckCircle className="text-emerald-400 text-2xl" />
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div className="glass-strong rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold font-orbitron text-white flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                      <FaClipboardList className="text-lg text-white" />
                    </div>
                    待审进度
                  </h2>
                  <Link 
                    to="/pending-progress" 
                    className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-rajdhani font-semibold"
                  >
                    查看全部 <FaArrowRight />
                  </Link>
                </div>
                
                {pendingProgress.length === 0 ? (
                  <div className="text-center py-16">
                    <FaClipboardList className="w-20 h-20 text-white/20 mx-auto mb-6" />
                    <p className="text-white/50 text-lg font-rajdhani">暂无待审进度</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingProgress.slice(0, 3).map((progress, index) => (
                      <motion.div
                        key={progress.id}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: "spring", stiffness: 100, delay: 0.6 + index * 0.1 }}
                        className="bg-gradient-to-r from-yellow-500/15 to-orange-500/15 border border-yellow-500/20 rounded-2xl p-6"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-white text-xl mb-2">{progress.title}</h3>
                            <p className="text-white/70 text-sm font-rajdhani mb-3">{progress.content}</p>
                          </div>
                          <span className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-rajdhani font-semibold border border-yellow-500/30">
                            待审阅
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 text-white/60">
                            <FaClock className="text-sm" />
                            <span className="font-rajdhani">完成度：{progress.completion}%</span>
                          </div>
                          <span className="text-white/50 text-sm font-rajdhani">{formatDate(progress.created_at)}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 80, delay: 0.4 }}
            className="space-y-8"
          >
            <motion.div className="glass-strong rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold font-orbitron text-white flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                      <FaCalendarAlt className="text-lg text-white" />
                    </div>
                    即将到来
                  </h2>
                </div>
                
                {upcomingAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <FaCalendarAlt className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/50 font-rajdhani">暂无预约</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment, index) => (
                      <motion.div
                        key={appointment.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 100, delay: 0.5 + index * 0.1 }}
                        className="glass-light rounded-2xl p-6 border border-white/10"
                      >
                        <h3 className="font-semibold text-white mb-3">{appointment.title}</h3>
                        <p className="text-white/70 text-sm font-rajdhani mb-2">
                          {formatDateTime(appointment.start_time)} - {formatDateTime(appointment.end_time).split(' ')[1]}
                        </p>
                        {appointment.location && (
                          <p className="text-white/50 text-sm font-rajdhani mb-3">📍 {appointment.location}</p>
                        )}
                        <span className={`inline-block px-4 py-2 rounded-full text-xs font-rajdhani font-semibold ${
                          appointment.status === 'confirmed' 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}>
                          {appointment.status === 'confirmed' ? '已确认' : '待确认'}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div className="glass-strong rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl translate-y-1/2 translate-x-1/2" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold font-orbitron text-white flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                      <FaTasks className="text-lg text-white" />
                    </div>
                    近期任务
                  </h2>
                </div>
                
                {tasks.length === 0 ? (
                  <div className="text-center py-12">
                    <FaTasks className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/50 font-rajdhani">暂无任务</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tasks.slice(0, 3).map((task, index) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 100, delay: 0.6 + index * 0.1 }}
                        className="glass-light rounded-2xl p-6"
                      >
                        <h3 className="font-semibold text-white mb-3">{task.title}</h3>
                        {task.due_date && (
                          <p className="text-white/60 text-sm font-rajdhani mb-3">
                            <FaClock className="inline mr-2" />
                            截止：{formatDate(task.due_date)}
                          </p>
                        )}
                        <span className={`inline-block px-4 py-2 rounded-full text-xs font-rajdhani font-semibold ${
                          task.priority === 'high' 
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                            : task.priority === 'medium'
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            : 'bg-green-500/20 text-green-400 border border-green-500/30'
                        }`}>
                          {task.priority === 'high' ? '高优先级' : task.priority === 'medium' ? '中优先级' : '低优先级'}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 80, delay: 0.7 }}
              className="glass-strong rounded-3xl p-8 relative overflow-hidden bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-sky-500/20"
            >
              <div className="relative z-10 text-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/40"
                >
                  <FaRocket className="text-3xl text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold font-orbitron text-white mb-3">准备好开始了吗？</h3>
                <p className="text-white/70 font-rajdhani mb-6">
                  管理你的学生，审阅进度报告，与学生保持沟通！
                </p>
                <Link
                  to="/my-students"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-lg hover:shadow-blue-500/40 transition-all duration-300"
                >
                  开始指导 <FaArrowRight />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GlassMentorDashboard;
