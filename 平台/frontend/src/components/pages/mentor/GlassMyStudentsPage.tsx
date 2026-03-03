import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { myApi, studentApi } from '../../../utils/api';
import { 
  FaUserGraduate, FaSearch, FaArrowLeft, FaCalendarAlt, 
  FaUser, FaBook, FaFlask, FaEnvelope, FaMessage
} from 'react-icons/fa';

const GlassMyStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [progressHistory, setProgressHistory] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { studentId } = useParams<{ studentId?: string }>();

  useEffect(() => {
    if (user?.role === 'mentor') {
      loadStudents();
    }
  }, [user]);

  useEffect(() => {
    if (studentId) {
      loadStudentDetail(studentId);
      setViewMode('detail');
    } else {
      setViewMode('list');
    }
  }, [studentId]);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      const data = await myApi.getMyStudents();
      setStudents(data);
    } catch (error) {
      console.error('Failed to load students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStudentDetail = async (id: string) => {
    try {
      setIsLoading(true);
      const data = await myApi.getMyStudentDetail(id);
      setSelectedStudent(data.student);
      setProgressHistory(data.progress_history || []);
    } catch (error) {
      console.error('Failed to load student detail:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.student_no?.includes(searchQuery)
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'from-yellow-500 to-orange-500',
      reviewed: 'from-green-500 to-emerald-500'
    };
    return colors[status] || 'from-gray-500 to-slate-500';
  };

  const getStatusText = (status: string) => {
    const texts: { [key: string]: string } = {
      pending: '待审阅',
      reviewed: '已反馈'
    };
    return texts[status] || status;
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

  if (isLoading && viewMode === 'list') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center particle-bg">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-transparent border-t-purple-500 border-r-cyan-500 rounded-full mx-auto mb-6"
          />
          <p className="text-white/80 text-lg font-rajdhani tracking-wider">LOADING</p>
        </div>
      </div>
    );
  }

  if (viewMode === 'detail' && selectedStudent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 particle-bg py-8">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 80 }}
            className="mb-6"
          >
            <button
              onClick={() => navigate('/my-students')}
              className="flex items-center text-white/70 hover:text-white transition-colors mb-4 group"
            >
              <FaArrowLeft className="mr-3 group-hover:-translate-x-1 transition-transform" />
              <span className="font-rajdhani tracking-wider">返回学生列表</span>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 80, delay: 0.1 }}
            className="glass-strong rounded-3xl p-8 mb-8"
          >
            <div className="flex items-center mb-8">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center text-white text-4xl font-bold mr-6 shadow-lg shadow-blue-500/30"
              >
                {selectedStudent.name?.charAt(0) || 'S'}
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold font-orbitron text-white mb-2">{selectedStudent.name}</h1>
                <p className="text-white/60 font-rajdhani text-lg">{selectedStudent.student_no} · {selectedStudent.grade} · {selectedStudent.major}</p>
                <p className="text-purple-400 mt-2 font-medium">{selectedStudent.research_topic}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="glass rounded-2xl p-6"
              >
                <h3 className="font-semibold font-orbitron text-white mb-4 flex items-center gap-2">
                  <FaUser className="text-purple-400" />
                  基本信息
                </h3>
                <div className="space-y-3">
                  <p className="text-white/70"><span className="text-white/40 font-medium">性别：</span>{selectedStudent.gender || '未填写'}</p>
                  <p className="text-white/70"><span className="text-white/40 font-medium">入学日期：</span>{selectedStudent.enrollment_date || '未填写'}</p>
                  <p className="text-white/70"><span className="text-white/40 font-medium">类型：</span>{selectedStudent.student_type === 'undergraduate' ? '本科生' : selectedStudent.student_type === 'graduate' ? '研究生' : '博士生'}</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="glass rounded-2xl p-6"
              >
                <h3 className="font-semibold font-orbitron text-white mb-4 flex items-center gap-2">
                  <FaFlask className="text-cyan-400" />
                  研究信息
                </h3>
                <div className="space-y-3">
                  <p className="text-white/70"><span className="text-white/40 font-medium">课题：</span>{selectedStudent.research_topic || '未设置'}</p>
                  <p className="text-white/70"><span className="text-white/40 font-medium">专业：</span>{selectedStudent.major}</p>
                  <p className="text-white/70"><span className="text-white/40 font-medium">年级：</span>{selectedStudent.grade}</p>
                </div>
              </motion.div>
            </div>

            <div className="mt-8 flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/messages')}
                className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-2xl font-semibold flex items-center justify-center gap-3 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all"
              >
                <FaMessage />
                发送消息
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 80, delay: 0.2 }}
            className="glass-strong rounded-3xl p-8"
          >
            <h2 className="text-2xl font-bold font-orbitron text-white mb-8 flex items-center gap-3">
              <FaCalendarAlt className="text-purple-400" />
              进度历史
            </h2>

            {progressHistory.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <FaBook className="w-20 h-20 text-white/20 mx-auto mb-6" />
                <p className="text-white/50 font-rajdhani text-lg">暂无进度记录</p>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                {progressHistory.map((progress, index) => (
                  <motion.div
                    key={progress.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    className="glass rounded-2xl p-6 hover:bg-white/10 transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold font-orbitron text-white text-lg mb-2">{progress.title}</h3>
                        <p className="text-white/50 text-sm font-rajdhani">{formatDate(progress.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-4 ml-6">
                        <div className="text-right">
                          <p className="text-white/50 text-xs font-rajdhani">完成度</p>
                          <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 text-2xl">{progress.completion}%</p>
                        </div>
                        <div className={`px-4 py-2 bg-gradient-to-r ${getStatusColor(progress.status)} rounded-xl text-white text-sm font-semibold`}>
                          {getStatusText(progress.status)}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-white/70 mb-4 leading-relaxed">{progress.content}</p>
                    
                    {progress.problems && (
                      <div className="mb-3 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                        <p className="text-sm font-medium text-yellow-400 mb-2">遇到的问题</p>
                        <p className="text-sm text-white/60">{progress.problems}</p>
                      </div>
                    )}
                    
                    {progress.next_plan && (
                      <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                        <p className="text-sm font-medium text-green-400 mb-2">下一步计划</p>
                        <p className="text-sm text-white/60">{progress.next_plan}</p>
                      </div>
                    )}

                    <div className="mt-6">
                      <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress.completion}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 particle-bg py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 80 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold font-orbitron text-white mb-3">我的学生</h1>
          <p className="text-white/60 font-rajdhani text-lg">管理您指导的学生</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 80, delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative">
            <FaSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="搜索学生姓名或学号..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
            />
          </div>
        </motion.div>

        {filteredStudents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 80 }}
            className="glass-strong rounded-3xl p-16 text-center"
          >
            <FaUserGraduate className="w-20 h-20 text-white/20 mx-auto mb-6" />
            <h3 className="text-xl font-semibold font-orbitron text-white mb-3">暂无学生</h3>
            <p className="text-white/50 font-rajdhani text-lg">您还没有指导的学生</p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredStudents.map((student) => (
              <motion.div
                key={student.id}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to={`/my-students/${student.id}`}
                  className="glass-strong rounded-3xl p-8 block hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex items-center mb-6">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold mr-4 shadow-lg shadow-blue-500/25"
                    >
                      {student.name?.charAt(0) || 'S'}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold font-orbitron text-white mb-1 truncate">{student.name}</h3>
                      <p className="text-white/50 text-sm font-rajdhani">{student.student_no}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-white/70 text-sm">
                      <span className="text-white/40 font-medium">年级：</span>{student.grade}
                    </p>
                    <p className="text-white/70 text-sm">
                      <span className="text-white/40 font-medium">专业：</span>{student.major}
                    </p>
                    {student.research_topic && (
                      <p className="text-white/70 text-sm line-clamp-2">
                        <span className="text-white/40 font-medium">课题：</span>{student.research_topic}
                      </p>
                    )}
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/40 transition-all"
                    >
                      查看详情
                    </motion.button>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GlassMyStudentsPage;
