import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import Sidebar from '../layout/Sidebar';
import Button from '../common/Button';
import Card from '../common/Card';
import { useAuth } from '../../contexts/AuthContext';
import { studentApi, mentorApi, myApi, progressApi } from '../../utils/api';
import { 
  FiUser, FiBook, FiFolder, FiAward, FiMail, FiPhone, FiMapPin, 
  FiEdit, FiUpload, FiDownload, FiCalendar, FiChevronRight, FiFile,
  FiPlus, FiCheck, FiClock, FiTrendingUp,
  FiBell, FiStar, FiMessageSquare, FiActivity,
  FiTrash2, FiUsers, FiSearch, FiSave, FiX,
  FiArrowUpRight
} from 'react-icons/fi';

const StudentManagement: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [students, setStudents] = useState<any[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);
  const [adminLoading, setAdminLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [newStudent, setNewStudent] = useState({
    username: '',
    password: '',
    name: '',
    student_id: '',
    email: '',
    phone: '',
    major: '',
    grade: '',
    research_area: '',
    mentor_id: ''
  });

  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [studentMentor, setStudentMentor] = useState<any>(null);
  const [progressReports, setProgressReports] = useState<any[]>([]);
  const [studentLoading, setStudentLoading] = useState(true);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<any>(null);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAdminData();
    } else if (user?.role === 'student') {
      loadStudentData();
    }
  }, [user]);

  const loadAdminData = async () => {
    try {
      setAdminLoading(true);
      const [studentsData, mentorsData] = await Promise.all([
        studentApi.getStudents(),
        mentorApi.getMentors()
      ]);
      setStudents(studentsData);
      setMentors(mentorsData);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setAdminLoading(false);
    }
  };

  const loadStudentData = async () => {
    try {
      setStudentLoading(true);
      const [profile, progress] = await Promise.all([
        myApi.getMyStudents().catch(() => []),
        myApi.getMyProgress().catch(() => [])
      ]);
      
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

  const handleAddStudent = async () => {
    try {
      await studentApi.createStudent(newStudent);
      setShowAddModal(false);
      setNewStudent({
        username: '',
        password: '',
        name: '',
        student_id: '',
        email: '',
        phone: '',
        major: '',
        grade: '',
        research_area: '',
        mentor_id: ''
      });
      loadAdminData();
    } catch (error) {
      console.error('Failed to add student:', error);
    }
  };

  const handleEditStudent = async () => {
    if (!editingStudent) return;
    try {
      await studentApi.updateStudent(editingStudent.id, editingStudent);
      setShowEditModal(false);
      setEditingStudent(null);
      loadAdminData();
    } catch (error) {
      console.error('Failed to update student:', error);
    }
  };

  const handleEditProfile = async () => {
    if (!editingProfile || !studentProfile) return;
    try {
      await studentApi.updateStudent(studentProfile.id, editingProfile);
      setShowProfileEditModal(false);
      setEditingProfile(null);
      setStudentProfile(editingProfile);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('确定要删除这个学生吗？')) return;
    try {
      await studentApi.deleteStudent(id);
      loadAdminData();
    } catch (error) {
      console.error('Failed to delete student:', error);
    }
  };

  const handleAssignMentor = async (studentId: string, mentorId: string) => {
    try {
      await studentApi.assignMentor(studentId, mentorId);
      loadAdminData();
    } catch (error) {
      console.error('Failed to assign mentor:', error);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_no?.includes(searchTerm) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (user?.role === 'admin') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header title="学生管理" subtitle="管理实验室的学生账号" />
        <div className="flex-1 container mx-auto px-4 py-8">
          <Card className="p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="搜索学生姓名、学号或邮箱..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                  />
                </div>
              </div>
              <Button 
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-electric-blue to-neon-cyan hover:from-electric-blue/90 hover:to-neon-cyan/90 border-0"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                添加学生
              </Button>
            </div>
          </Card>

          {adminLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-electric-blue border-t-transparent"></div>
                <p className="text-gray-400 animate-pulse">加载中...</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredStudents.map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-6 hover:border-electric-blue/30 transition-all">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-electric-blue to-neon-cyan flex items-center justify-center">
                          <FiUser className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                          <h3 className="text-xl font-bold text-white">{student.name}</h3>
                          <span className="px-3 py-1 bg-electric-blue/20 text-electric-blue rounded-full text-sm border border-electric-blue/30">
                            学号: {student.student_no}
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                          <p className="text-gray-400">
                            <FiMail className="w-4 h-4 inline mr-1" />
                            {student.email || '-'}
                          </p>
                          {student.gender && (
                            <p className="text-gray-400">
                              <FiUser className="w-4 h-4 inline mr-1" />
                              {student.gender}
                            </p>
                          )}
                          {student.major && (
                            <p className="text-gray-400">
                              <FiBook className="w-4 h-4 inline mr-1" />
                              {student.major}
                            </p>
                          )}
                          {student.grade && (
                            <p className="text-gray-400">
                              <FiCalendar className="w-4 h-4 inline mr-1" />
                              {student.grade}
                            </p>
                          )}
                        </div>
                        <div className="mt-3">
                          <label className="block text-sm text-gray-400 mb-1">指导导师</label>
                          <select
                            value={student.mentor_id || ''}
                            onChange={(e) => handleAssignMentor(student.id, e.target.value)}
                            className="px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-neon-cyan/50"
                          >
                            <option value="">未分配导师</option>
                            {mentors.map(mentor => (
                              <option key={mentor.id} value={mentor.id}>
                                {mentor.name} - {mentor.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingStudent({...student});
                            setShowEditModal(true);
                          }}
                          className="border-white/20"
                        >
                          <FiEdit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteStudent(student.id)}
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
              {filteredStudents.length === 0 && (
                <Card className="p-12 text-center">
                  <FiUsers className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-400 mb-2">暂无学生</h3>
                  <p className="text-gray-500">点击上方"添加学生"按钮来创建新的学生账号</p>
                </Card>
              )}
            </div>
          )}
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-2xl"
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white font-orbitron">添加新学生</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">用户名 *</label>
                    <input
                      type="text"
                      value={newStudent.username}
                      onChange={(e) => setNewStudent({...newStudent, username: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                      placeholder="登录用户名"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">密码 *</label>
                    <input
                      type="password"
                      value={newStudent.password}
                      onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                      placeholder="登录密码"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">姓名 *</label>
                    <input
                      type="text"
                      value={newStudent.name}
                      onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                      placeholder="学生姓名"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">学号 *</label>
                    <input
                      type="text"
                      value={newStudent.student_id}
                      onChange={(e) => setNewStudent({...newStudent, student_id: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                      placeholder="学号"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">邮箱</label>
                    <input
                      type="email"
                      value={newStudent.email}
                      onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                      placeholder="邮箱地址"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">性别</label>
                    <input
                      type="text"
                      value={newStudent.phone}
                      onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                      placeholder="男/女"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">专业</label>
                    <input
                      type="text"
                      value={newStudent.major}
                      onChange={(e) => setNewStudent({...newStudent, major: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                      placeholder="专业"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">年级</label>
                    <input
                      type="text"
                      value={newStudent.grade}
                      onChange={(e) => setNewStudent({...newStudent, grade: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                      placeholder="年级"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-400 mb-2">研究方向</label>
                    <input
                      type="text"
                      value={newStudent.research_area}
                      onChange={(e) => setNewStudent({...newStudent, research_area: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                      placeholder="研究方向"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-400 mb-2">分配导师</label>
                    <select
                      value={newStudent.mentor_id}
                      onChange={(e) => setNewStudent({...newStudent, mentor_id: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-neon-cyan/50"
                    >
                      <option value="">暂不分配</option>
                      {mentors.map(mentor => (
                        <option key={mentor.id} value={mentor.id}>
                          {mentor.name} - {mentor.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-6 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                    className="border-white/20"
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleAddStudent}
                    className="bg-gradient-to-r from-electric-blue to-neon-cyan hover:from-electric-blue/90 hover:to-neon-cyan/90 border-0"
                  >
                    <FiSave className="w-4 h-4 mr-2" />
                    保存
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}

        {showEditModal && editingStudent && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-2xl"
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white font-orbitron">编辑学生信息</h3>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingStudent(null);
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">姓名</label>
                    <input
                      type="text"
                      value={editingStudent.name || ''}
                      onChange={(e) => setEditingStudent({...editingStudent, name: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">学号</label>
                    <input
                      type="text"
                      value={editingStudent.student_no || ''}
                      onChange={(e) => setEditingStudent({...editingStudent, student_no: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">邮箱</label>
                    <input
                      type="email"
                      value={editingStudent.email || ''}
                      onChange={(e) => setEditingStudent({...editingStudent, email: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">性别</label>
                    <input
                      type="text"
                      value={editingStudent.gender || ''}
                      onChange={(e) => setEditingStudent({...editingStudent, gender: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">专业</label>
                    <input
                      type="text"
                      value={editingStudent.major || ''}
                      onChange={(e) => setEditingStudent({...editingStudent, major: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">年级</label>
                    <input
                      type="text"
                      value={editingStudent.grade || ''}
                      onChange={(e) => setEditingStudent({...editingStudent, grade: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-400 mb-2">研究方向</label>
                    <input
                      type="text"
                      value={editingStudent.research_topic || ''}
                      onChange={(e) => setEditingStudent({...editingStudent, research_topic: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingStudent(null);
                    }}
                    className="border-white/20"
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleEditStudent}
                    className="bg-gradient-to-r from-electric-blue to-neon-cyan hover:from-electric-blue/90 hover:to-neon-cyan/90 border-0"
                  >
                    <FiSave className="w-4 h-4 mr-2" />
                    保存
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar type="student" />
      
      <div className="flex-1 ml-64 flex flex-col gradient-bg particle-bg">
        <Header title="学生中心" subtitle="欢迎回来，探索您的学术之旅" />
        
        <div className="flex-1 container mx-auto px-6 py-8">
          {loading || studentLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-electric-blue border-t-transparent"></div>
                <p className="text-gray-400 animate-pulse">加载中...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="p-8 glass relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-neon-purple/10 to-neon-pink/10 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-neon-cyan/10 to-neon-purple/10 rounded-full blur-3xl"></div>
                  
                  <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="relative"
                    >
                      <div className="w-36 h-36 rounded-full bg-gradient-to-br from-neon-purple via-neon-cyan to-neon-pink p-1.5 shadow-2xl shadow-neon-purple/20">
                        <div className="w-full h-full rounded-full bg-[var(--dark-gray)] flex items-center justify-center overflow-hidden">
                          <FiUser className="w-16 h-16 text-white" />
                        </div>
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-[var(--dark-gray)] shadow-lg">
                        <FiCheck className="w-5 h-5 text-white" />
                      </div>
                    </motion.div>
                    
                    <div className="flex-1 text-center md:text-left">
                      <h1 className="text-4xl font-bold text-white mb-2 font-orbitron">
                        {studentProfile?.name || '学生'}
                      </h1>
                      <p className="text-xl text-neon-purple font-medium mb-4">
                        {studentProfile?.student_type === 'graduate' ? '研究生' : studentProfile?.student_type === 'undergraduate' ? '本科生' : '学生'} · {studentProfile?.major || '计算机科学与技术'}
                      </p>
                      <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                        <span className="px-5 py-2 bg-neon-purple/20 text-neon-purple rounded-full text-sm border border-neon-purple/30 font-medium">
                          {studentProfile?.grade || '2024级'}
                        </span>
                        <span className="px-5 py-2 bg-cyan-light/20 text-cyan-light rounded-full text-sm border border-cyan-light/30 font-medium">
                          学号: {studentProfile?.student_no || '2024001'}
                        </span>
                        {studentProfile?.gender && (
                          <span className="px-5 py-2 bg-neon-purple/20 text-neon-purple rounded-full text-sm border border-neon-purple/30 font-medium">
                            {studentProfile.gender}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        onClick={() => {
                          setEditingProfile({...studentProfile});
                          setShowProfileEditModal(true);
                        }}
                        className="bg-gradient-to-r from-neon-purple to-neon-cyan hover:from-neon-purple/90 hover:to-neon-cyan/90 border-0 shadow-lg shadow-neon-purple/20"
                      >
                        <FiEdit className="w-4 h-4 mr-2" />
                        编辑资料
                      </Button>
                      <Link to="/progress">
                        <Button className="bg-gradient-to-r from-neon-pink to-purple-light hover:from-neon-pink/90 hover:to-purple-light/90 border-0 shadow-lg">
                          <FiArrowUpRight className="w-4 h-4 mr-2" />
                          课题进度
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
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
                  </button>
                ))}
              </div>

              {activeTab === 'dashboard' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
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
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{ y: -4 }}
                      >
                        <Card className="p-6 glass border border-white/10 hover:border-electric-blue/30 transition-all duration-300">
                          <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                              {stat.icon}
                            </div>
                            <span className="text-emerald-400 text-sm font-medium flex items-center gap-1">
                              <FiTrendingUp className="w-4 h-4" />
                              {stat.change}
                            </span>
                          </div>
                          <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
                          <p className="text-gray-400 text-sm">{stat.label}</p>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                      <Card className="p-6 glass">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-bold text-white flex items-center gap-3 font-orbitron">
                            <FiBook className="w-6 h-6 text-electric-blue" />
                            最新进度
                          </h3>
                          <Link to="/progress">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-white/20"
                            >
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
                              transition={{ delay: index * 0.1 }}
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

                      <Card className="p-6 glass">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3 font-orbitron">
                          <FiCalendar className="w-6 h-6 text-neon-cyan" />
                          指导导师
                        </h3>
                        {studentMentor ? (
                          <div className="flex items-center gap-4 p-4 bg-[var(--card)]/50 rounded-xl border border-white/5">
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
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <FiUser className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400">暂无分配导师</p>
                          </div>
                        )}
                      </Card>
                    </div>

                    <div className="space-y-6">
                      <Card className="p-6 glass">
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

                      <Card className="p-6 glass">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 font-orbitron">
                          <FiAward className="w-5 h-5 text-yellow-400" />
                          快捷入口
                        </h3>
                        <div className="space-y-3">
                          <Link to="/progress">
                            <div className="flex items-center gap-3 p-3 bg-[var(--card)]/50 rounded-lg border border-white/5 hover:border-electric-blue/30 transition-all cursor-pointer group">
                              <div className="w-10 h-10 bg-electric-blue/20 rounded-lg flex items-center justify-center">
                                <FiBook className="w-5 h-5 text-electric-blue" />
                              </div>
                              <div className="flex-1">
                                <p className="text-white font-medium group-hover:text-electric-blue transition-colors">课题进度</p>
                                <p className="text-gray-500 text-xs">提交和查看进度报告</p>
                              </div>
                              <FiChevronRight className="w-4 h-4 text-gray-500" />
                            </div>
                          </Link>
                        </div>
                      </Card>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'profile' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 p-8 glass">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3 font-orbitron">
                          <FiUser className="w-6 h-6 text-electric-blue" />
                          个人信息
                        </h2>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setEditingProfile({...studentProfile});
                            setShowProfileEditModal(true);
                          }}
                          className="border-white/20"
                        >
                          <FiEdit className="w-4 h-4 mr-2" />
                          编辑
                        </Button>
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
                          <div className="group">
                            <label className="block text-gray-400 text-sm mb-2 group-hover:text-white transition-colors">研究方向</label>
                            <div className="bg-[var(--card)]/50 border border-white/10 rounded-lg px-4 py-3 text-white">
                              {studentProfile?.research_topic || '-'}
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
                            <label className="block text-gray-400 text-sm mb-2 group-hover:text-white transition-colors">入学日期</label>
                            <div className="bg-[var(--card)]/50 border border-white/10 rounded-lg px-4 py-3 text-white">
                              {studentProfile?.enrollment_date || '-'}
                            </div>
                          </div>
                          <div className="group">
                            <label className="block text-gray-400 text-sm mb-2 group-hover:text-white transition-colors">性别</label>
                            <div className="bg-[var(--card)]/50 border border-white/10 rounded-lg px-4 py-3 text-white">
                              {studentProfile?.gender || '-'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <div className="space-y-6">
                      <Card className="p-6 glass">
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
                              <p className="text-white">{studentProfile?.email || user?.email || '-'}</p>
                            </div>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-6 glass">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 font-orbitron">
                          <FiUser className="w-5 h-5 text-neon-cyan" />
                          指导导师
                        </h3>
                        {studentMentor ? (
                          <div className="flex items-center gap-4 p-4 bg-[var(--card)]/50 rounded-lg border border-white/5">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-neon-cyan to-electric-blue flex items-center justify-center">
                              <FiUser className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-white">{studentMentor.name}</h4>
                              <p className="text-gray-400 text-sm">{studentMentor.title}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-gray-400">暂无分配导师</p>
                          </div>
                        )}
                      </Card>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'progress' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-8 glass">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-bold text-white flex items-center gap-3 font-orbitron">
                        <FiBook className="w-6 h-6 text-electric-blue" />
                        课题进度
                      </h2>
                      <Link to="/progress">
                        <Button className="bg-gradient-to-r from-electric-blue to-neon-cyan hover:from-electric-blue/90 hover:to-neon-cyan/90 border-0">
                          <FiPlus className="w-4 h-4 mr-2" />
                          提交进度
                        </Button>
                      </Link>
                    </div>
                    <div className="space-y-4">
                      {progressReports.map((report, index) => (
                        <motion.div
                          key={report.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="p-6 bg-[var(--card)]/50 rounded-xl border border-white/5 hover:border-electric-blue/30 transition-all group"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-white group-hover:text-electric-blue transition-colors">
                                {report.title}
                              </h3>
                              <p className="text-gray-400 text-sm mt-2">{report.content}</p>
                            </div>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full border flex-shrink-0 ${
                              report.status === 'pending' 
                                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' 
                                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            }`}>
                              {report.status === 'pending' ? '待审核' : '已反馈'}
                            </span>
                          </div>
                          <div className="mt-4 flex items-center gap-4">
                            <div className="flex-1">
                              <div className="flex justify-between text-xs text-gray-400 mb-2">
                                <span>完成度</span>
                                <span className="font-bold text-electric-blue">{report.completion}%</span>
                              </div>
                              <div className="w-full bg-[var(--card)] rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-electric-blue to-neon-cyan h-2 rounded-full transition-all duration-1000"
                                  style={{ width: `${report.completion}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      {progressReports.length === 0 && (
                        <div className="text-center py-12">
                          <FiBook className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                          <h3 className="text-xl font-bold text-gray-400 mb-2">暂无进度报告</h3>
                          <p className="text-gray-500 mb-6">点击上方按钮提交您的第一个进度报告</p>
                          <Link to="/progress">
                            <Button className="bg-gradient-to-r from-electric-blue to-neon-cyan border-0">
                              <FiPlus className="w-4 h-4 mr-2" />
                              提交进度
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {showProfileEditModal && editingProfile && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-2xl"
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white font-orbitron">编辑个人信息</h3>
                  <button
                    onClick={() => {
                      setShowProfileEditModal(false);
                      setEditingProfile(null);
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">姓名</label>
                    <input
                      type="text"
                      value={editingProfile.name || ''}
                      onChange={(e) => setEditingProfile({...editingProfile, name: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">学号</label>
                    <input
                      type="text"
                      value={editingProfile.student_no || ''}
                      onChange={(e) => setEditingProfile({...editingProfile, student_no: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">专业</label>
                    <input
                      type="text"
                      value={editingProfile.major || ''}
                      onChange={(e) => setEditingProfile({...editingProfile, major: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">年级</label>
                    <input
                      type="text"
                      value={editingProfile.grade || ''}
                      onChange={(e) => setEditingProfile({...editingProfile, grade: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">性别</label>
                    <input
                      type="text"
                      value={editingProfile.gender || ''}
                      onChange={(e) => setEditingProfile({...editingProfile, gender: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">入学日期</label>
                    <input
                      type="text"
                      value={editingProfile.enrollment_date || ''}
                      onChange={(e) => setEditingProfile({...editingProfile, enrollment_date: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-400 mb-2">研究方向</label>
                    <input
                      type="text"
                      value={editingProfile.research_topic || ''}
                      onChange={(e) => setEditingProfile({...editingProfile, research_topic: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowProfileEditModal(false);
                      setEditingProfile(null);
                    }}
                    className="border-white/20"
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleEditProfile}
                    className="bg-gradient-to-r from-electric-blue to-neon-cyan hover:from-electric-blue/90 hover:to-neon-cyan/90 border-0"
                  >
                    <FiSave className="w-4 h-4 mr-2" />
                    保存
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
};

export default StudentManagement;
