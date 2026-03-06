import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';
import Button from '../../common/Button';
import Card from '../../common/Card';
import { useAuth } from '../../../contexts/AuthContext';
import { studentApi, mentorApi } from '../../../utils/api';
import { 
  FiUser, FiMail, FiEdit, FiPlus, FiTrash2, 
  FiSearch, FiSave, FiX, FiBook, FiCalendar,
  FiUsers, FiLock
} from 'react-icons/fi';

const AdminStudentManagement: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [newStudent, setNewStudent] = useState({
    username: '',
    password: '',
    name: '',
    student_no: '',
    email: '',
    phone: '',
    major: '',
    grade: '',
    gender: '',
    student_type: 'undergraduate',
    research_topic: '',
    enrollment_date: new Date().toISOString().split('T')[0],
    mentor_id: ''
  });

  useEffect(() => {
    console.log('AdminStudentManagement - user:', user);
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      console.log('Loading admin data...');
      
      // 分别加载，便于调试
      let studentsData = [];
      let mentorsData = [];
      
      try {
        studentsData = await studentApi.getStudents();
        console.log('Students loaded:', studentsData);
      } catch (e: any) {
        console.error('Failed to load students:', e);
        alert('加载学生列表失败: ' + e.message);
      }
      
      try {
        mentorsData = await mentorApi.getMentors();
        console.log('Mentors loaded:', mentorsData);
      } catch (e: any) {
        console.error('Failed to load mentors:', e);
      }
      
      setStudents(studentsData || []);
      setMentors(mentorsData || []);
    } catch (error: any) {
      console.error('Failed to load admin data:', error);
      alert('加载数据失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async () => {
    try {
      setLoading(true);
      await studentApi.createStudent(newStudent);
      setShowAddModal(false);
      setNewStudent({
        username: '',
        password: '',
        name: '',
        student_no: '',
        email: '',
        phone: '',
        major: '',
        grade: '',
        gender: '',
        student_type: 'undergraduate',
        research_topic: '',
        enrollment_date: new Date().toISOString().split('T')[0],
        mentor_id: ''
      });
      loadAdminData();
    } catch (error: any) {
      console.error('Failed to add student:', error);
      alert('添加学生失败: ' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
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

  const openDeleteModal = (id: string) => {
    setDeletingStudentId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteStudent = async () => {
    if (!deletingStudentId) return;
    try {
      setLoading(true);
      await studentApi.deleteStudent(deletingStudentId);
      setShowDeleteModal(false);
      setDeletingStudentId(null);
      loadAdminData();
    } catch (error: any) {
      console.error('Failed to delete student:', error);
      alert('删除学生失败: ' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
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

  const handleUpdatePassword = async () => {
    if (!editingStudent) return;
    if (!newPassword || newPassword.length < 6) {
      alert('密码长度至少为6位');
      return;
    }
    try {
      await studentApi.updateStudentPassword(editingStudent.id, newPassword);
      setShowPasswordModal(false);
      setNewPassword('');
      setEditingStudent(null);
      alert('密码修改成功');
    } catch (error: any) {
      console.error('Failed to update password:', error);
      alert(error.message || '密码修改失败');
    }
  };

  const openPasswordModal = (student: any) => {
    setEditingStudent(student);
    setNewPassword('');
    setShowPasswordModal(true);
  };

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_no?.includes(searchTerm) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const springConfig = {
    type: 'spring' as const,
    stiffness: 300,
    damping: 20
  };

  return (
    <div className="min-h-screen flex flex-col gradient-bg particle-bg">
      <Header title="学生管理" subtitle="管理实验室的学生账号" />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springConfig}
        >
          <Card className="p-6 mb-6 glass-strong">
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
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-gradient-to-r from-electric-blue to-neon-cyan hover:from-electric-blue/90 hover:to-neon-cyan/90 border-0"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  添加学生
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {loading ? (
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
                transition={{ delay: index * 0.05, ...springConfig }}
                whileHover={{ y: -2 }}
              >
                <Card className="p-6 glass border border-white/10 hover:border-electric-blue/30 transition-all">
                  <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <div className="flex-shrink-0">
                      <motion.div
                        whileHover={{ rotate: 5, scale: 1.05 }}
                        transition={springConfig}
                        className="w-16 h-16 rounded-full bg-gradient-to-br from-electric-blue to-neon-cyan flex items-center justify-center"
                      >
                        <FiUser className="w-8 h-8 text-white" />
                      </motion.div>
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
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
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
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openPasswordModal(student)}
                          className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                          title="修改密码"
                        >
                          <FiLock className="w-4 h-4" />
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteModal(student.id)}
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
            {filteredStudents.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={springConfig}
              >
                <Card className="p-12 text-center glass-strong">
                  <FiUsers className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-400 mb-2">暂无学生</h3>
                  <p className="text-gray-500">点击上方"添加学生"按钮来创建新的学生账号</p>
                </Card>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springConfig}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <Card className="p-6 glass-strong">
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
                    value={newStudent.student_no}
                    onChange={(e) => setNewStudent({...newStudent, student_no: e.target.value})}
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
                  <label className="block text-sm text-gray-400 mb-2">电话</label>
                  <input
                    type="text"
                    value={newStudent.phone}
                    onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                    placeholder="联系电话"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">性别</label>
                  <select
                    value={newStudent.gender}
                    onChange={(e) => setNewStudent({...newStudent, gender: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-electric-blue/50"
                  >
                    <option value="">请选择</option>
                    <option value="男">男</option>
                    <option value="女">女</option>
                  </select>
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
                <div>
                  <label className="block text-sm text-gray-400 mb-2">学生类型</label>
                  <select
                    value={newStudent.student_type}
                    onChange={(e) => setNewStudent({...newStudent, student_type: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-electric-blue/50"
                  >
                    <option value="undergraduate">本科生</option>
                    <option value="master">硕士生</option>
                    <option value="phd">博士生</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">入学日期</label>
                  <input
                    type="date"
                    value={newStudent.enrollment_date}
                    onChange={(e) => setNewStudent({...newStudent, enrollment_date: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-400 mb-2">研究课题</label>
                  <input
                    type="text"
                    value={newStudent.research_topic}
                    onChange={(e) => setNewStudent({...newStudent, research_topic: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                    placeholder="研究课题"
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
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                    className="border-white/20"
                  >
                    取消
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleAddStudent}
                    className="bg-gradient-to-r from-electric-blue to-neon-cyan hover:from-electric-blue/90 hover:to-neon-cyan/90 border-0"
                  >
                    <FiSave className="w-4 h-4 mr-2" />
                    保存
                  </Button>
                </motion.div>
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
            transition={springConfig}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <Card className="p-6 glass-strong">
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
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleEditStudent}
                    className="bg-gradient-to-r from-electric-blue to-neon-cyan hover:from-electric-blue/90 hover:to-neon-cyan/90 border-0"
                  >
                    <FiSave className="w-4 h-4 mr-2" />
                    保存
                  </Button>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </div>
      )}

      {showPasswordModal && editingStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springConfig}
            className="w-full max-w-md"
          >
            <Card className="p-6 glass-strong">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white font-orbitron">修改密码</h3>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setEditingStudent(null);
                    setNewPassword('');
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              <div className="mb-4">
                <p className="text-gray-400 mb-4">
                  正在为 <span className="text-white font-semibold">{editingStudent.name}</span> ({editingStudent.student_no}) 修改密码
                </p>
                <label className="block text-sm text-gray-400 mb-2">新密码 *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                  placeholder="请输入新密码（至少6位）"
                />
              </div>
              <div className="flex gap-3 mt-6 justify-end">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setEditingStudent(null);
                      setNewPassword('');
                    }}
                    className="border-white/20"
                  >
                    取消
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleUpdatePassword}
                    className="bg-gradient-to-r from-electric-blue to-neon-cyan hover:from-electric-blue/90 hover:to-neon-cyan/90 border-0"
                  >
                    <FiSave className="w-4 h-4 mr-2" />
                    保存
                  </Button>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springConfig}
            className="w-full max-w-md"
          >
            <Card className="p-6 glass-strong">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white font-orbitron">确认删除</h3>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingStudentId(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              <div className="mb-6">
                <p className="text-gray-400">
                  确定要删除这个学生吗？此操作不可恢复。
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeletingStudentId(null);
                    }}
                    className="border-white/20"
                  >
                    取消
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleDeleteStudent}
                    className="bg-red-500 hover:bg-red-600 border-0"
                  >
                    <FiTrash2 className="w-4 h-4 mr-2" />
                    删除
                  </Button>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminStudentManagement;
