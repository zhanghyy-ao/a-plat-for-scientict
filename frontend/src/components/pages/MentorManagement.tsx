import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import Button from '../common/Button';
import Card from '../common/Card';
import { useAuth } from '../../contexts/AuthContext';
import { mentorApi, studentApi, myApi } from '../../utils/api';
import { 
  FiUser, FiMail, FiEdit, FiPlus, FiTrash2, 
  FiSearch, FiSave, FiX, FiBook, FiCalendar,
  FiUsers, FiLock, FiPhone, FiBriefcase
} from 'react-icons/fi';

const MentorManagement: React.FC = () => {
  const { user } = useAuth();
  const [mentors, setMentors] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [myStudents, setMyStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingMentorId, setDeletingMentorId] = useState<string | null>(null);
  const [editingMentor, setEditingMentor] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [newMentor, setNewMentor] = useState({
    username: '',
    password: '',
    name: '',
    title: '',
    department: '',
    email: '',
    phone: '',
    research_direction: ''
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (user?.role === 'admin') {
        // Admin加载所有导师
        const mentorsData = await mentorApi.getMentors();
        setMentors(mentorsData);
      } else if (user?.role === 'mentor') {
        // 导师加载自己的学生
        const studentsData = await myApi.getMyStudents();
        setMyStudents(studentsData);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMentor = async () => {
    try {
      await mentorApi.createMentor(newMentor);
      setShowAddModal(false);
      setNewMentor({
        username: '',
        password: '',
        name: '',
        title: '',
        department: '',
        email: '',
        phone: '',
        research_direction: ''
      });
      loadData();
    } catch (error) {
      console.error('Failed to add mentor:', error);
      alert('添加导师失败');
    }
  };

  const handleEditMentor = async () => {
    if (!editingMentor) return;
    try {
      await mentorApi.updateMentor(editingMentor.id, editingMentor);
      setShowEditModal(false);
      setEditingMentor(null);
      loadData();
    } catch (error) {
      console.error('Failed to update mentor:', error);
      alert('更新导师信息失败');
    }
  };

  const openDeleteModal = (id: string) => {
    setDeletingMentorId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteMentor = async () => {
    if (!deletingMentorId) return;
    try {
      setLoading(true);
      await mentorApi.deleteMentor(deletingMentorId);
      setShowDeleteModal(false);
      setDeletingMentorId(null);
      loadData();
      alert('导师删除成功');
    } catch (error: any) {
      console.error('Failed to delete mentor:', error);
      alert('删除导师失败: ' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!editingMentor) return;
    if (!newPassword || newPassword.length < 6) {
      alert('密码长度至少为6位');
      return;
    }
    try {
      await mentorApi.updateMentorPassword(editingMentor.id, newPassword);
      setShowPasswordModal(false);
      setNewPassword('');
      setEditingMentor(null);
      alert('密码修改成功');
    } catch (error: any) {
      console.error('Failed to update password:', error);
      alert(error.message || '密码修改失败');
    }
  };

  const openPasswordModal = (mentor: any) => {
    setEditingMentor(mentor);
    setNewPassword('');
    setShowPasswordModal(true);
  };

  const openEditModal = (mentor: any) => {
    setEditingMentor({...mentor});
    setShowEditModal(true);
  };

  const filteredMentors = mentors.filter(mentor =>
    mentor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const springConfig = {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30
  };

  // Admin视图
  if (user?.role === 'admin') {
    return (
      <div className="min-h-screen flex flex-col bg-deep-space">
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
              {/* 搜索和添加按钮 */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="relative flex-1 w-full md:w-96">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-gray/50" />
                  <input
                    type="text"
                    placeholder="搜索导师姓名、部门或职称..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-dark-gray border border-light-gray/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-light-gray/50 focus:outline-none focus:border-electric-blue transition-colors"
                  />
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => setShowAddModal(true)}
                    className="bg-gradient-to-r from-electric-blue to-neon-cyan text-deep-space font-semibold px-6 py-3 rounded-lg"
                  >
                    <FiPlus className="w-5 h-5 mr-2 inline" />
                    添加导师
                  </Button>
                </motion.div>
              </div>

              {/* 导师列表 */}
              <div className="grid grid-cols-1 gap-4">
                {filteredMentors.map((mentor, index) => (
                  <motion.div
                    key={mentor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...springConfig, delay: index * 0.05 }}
                  >
                    <Card className="p-6 glass-strong hover:border-electric-blue/30 transition-all">
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          transition={springConfig}
                          className="w-16 h-16 rounded-full bg-gradient-to-br from-electric-blue to-neon-cyan flex items-center justify-center flex-shrink-0"
                        >
                          <FiUser className="w-8 h-8 text-white" />
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                            <h3 className="text-xl font-bold text-white">{mentor.name}</h3>
                            <span className="px-3 py-1 bg-electric-blue/20 text-electric-blue rounded-full text-sm border border-electric-blue/30">
                              {mentor.title}
                            </span>
                          </div>
                          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                            <p className="text-gray-400">
                              <FiBriefcase className="w-4 h-4 inline mr-1" />
                              {mentor.department || '-'}
                            </p>
                            <p className="text-gray-400">
                              <FiMail className="w-4 h-4 inline mr-1" />
                              {mentor.email || '-'}
                            </p>
                            <p className="text-gray-400">
                              <FiPhone className="w-4 h-4 inline mr-1" />
                              {mentor.phone || '-'}
                            </p>
                            <p className="text-gray-400">
                              <FiUsers className="w-4 h-4 inline mr-1" />
                              学生数: {mentor.student_count || 0}
                            </p>
                          </div>
                          {mentor.research_direction && (
                            <p className="mt-2 text-gray-400 text-sm">
                              <span className="text-electric-blue">研究方向:</span> {mentor.research_direction}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(mentor)}
                              className="border-white/20"
                            >
                              <FiEdit className="w-4 h-4" />
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openPasswordModal(mentor)}
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
                              onClick={() => openDeleteModal(mentor.id)}
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
                {filteredMentors.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={springConfig}
                  >
                    <Card className="p-12 text-center glass-strong">
                      <FiUsers className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-400 mb-2">暂无导师</h3>
                      <p className="text-gray-500">点击上方"添加导师"按钮来创建新的导师账号</p>
                    </Card>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </div>
        
        <Footer />

        {/* 添加导师模态框 */}
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
                  <h3 className="text-2xl font-bold text-white font-orbitron">添加新导师</h3>
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
                      value={newMentor.username}
                      onChange={(e) => setNewMentor({...newMentor, username: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                      placeholder="登录用户名"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">密码 *</label>
                    <input
                      type="password"
                      value={newMentor.password}
                      onChange={(e) => setNewMentor({...newMentor, password: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                      placeholder="登录密码"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">姓名 *</label>
                    <input
                      type="text"
                      value={newMentor.name}
                      onChange={(e) => setNewMentor({...newMentor, name: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                      placeholder="导师姓名"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">职称</label>
                    <select
                      value={newMentor.title}
                      onChange={(e) => setNewMentor({...newMentor, title: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-electric-blue/50"
                    >
                      <option value="">请选择职称</option>
                      <option value="教授">教授</option>
                      <option value="副教授">副教授</option>
                      <option value="讲师">讲师</option>
                      <option value="研究员">研究员</option>
                      <option value="副研究员">副研究员</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">院系</label>
                    <input
                      type="text"
                      value={newMentor.department}
                      onChange={(e) => setNewMentor({...newMentor, department: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                      placeholder="所属院系"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">邮箱</label>
                    <input
                      type="email"
                      value={newMentor.email}
                      onChange={(e) => setNewMentor({...newMentor, email: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                      placeholder="邮箱地址"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">电话</label>
                    <input
                      type="text"
                      value={newMentor.phone}
                      onChange={(e) => setNewMentor({...newMentor, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                      placeholder="联系电话"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-400 mb-2">研究方向</label>
                    <input
                      type="text"
                      value={newMentor.research_direction}
                      onChange={(e) => setNewMentor({...newMentor, research_direction: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                      placeholder="研究方向"
                    />
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
                      onClick={handleAddMentor}
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

        {/* 编辑导师模态框 */}
        {showEditModal && editingMentor && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={springConfig}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <Card className="p-6 glass-strong">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white font-orbitron">编辑导师信息</h3>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingMentor(null);
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
                      value={editingMentor.name || ''}
                      onChange={(e) => setEditingMentor({...editingMentor, name: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">职称</label>
                    <select
                      value={editingMentor.title || ''}
                      onChange={(e) => setEditingMentor({...editingMentor, title: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-electric-blue/50"
                    >
                      <option value="">请选择职称</option>
                      <option value="教授">教授</option>
                      <option value="副教授">副教授</option>
                      <option value="讲师">讲师</option>
                      <option value="研究员">研究员</option>
                      <option value="副研究员">副研究员</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">院系</label>
                    <input
                      type="text"
                      value={editingMentor.department || ''}
                      onChange={(e) => setEditingMentor({...editingMentor, department: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">邮箱</label>
                    <input
                      type="email"
                      value={editingMentor.email || ''}
                      onChange={(e) => setEditingMentor({...editingMentor, email: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">电话</label>
                    <input
                      type="text"
                      value={editingMentor.phone || ''}
                      onChange={(e) => setEditingMentor({...editingMentor, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-400 mb-2">研究方向</label>
                    <input
                      type="text"
                      value={editingMentor.research_direction || ''}
                      onChange={(e) => setEditingMentor({...editingMentor, research_direction: e.target.value})}
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
                        setEditingMentor(null);
                      }}
                      className="border-white/20"
                    >
                      取消
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={handleEditMentor}
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

        {/* 修改密码模态框 */}
        {showPasswordModal && editingMentor && (
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
                      setEditingMentor(null);
                      setNewPassword('');
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
                <div className="mb-4">
                  <p className="text-gray-400 mb-4">
                    正在为 <span className="text-white font-semibold">{editingMentor.name}</span> 修改密码
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
                        setEditingMentor(null);
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

        {/* 删除确认模态框 */}
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
                      setDeletingMentorId(null);
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
                <div className="mb-6">
                  <p className="text-gray-400">
                    确定要删除这位导师吗？此操作不可恢复。
                  </p>
                </div>
                <div className="flex gap-3 justify-end">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowDeleteModal(false);
                        setDeletingMentorId(null);
                      }}
                      className="border-white/20"
                    >
                      取消
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={handleDeleteMentor}
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
      </div>
    );
  }

  // 导师视图 - 显示自己的学生
  return (
    <div className="min-h-screen flex flex-col bg-deep-space">
      <Header title="我的学生" subtitle="管理您的指导学生" />
      
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
            <div className="grid grid-cols-1 gap-4">
              {myStudents.map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...springConfig, delay: index * 0.05 }}
                >
                  <Card className="p-6 glass-strong">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={springConfig}
                        className="w-16 h-16 rounded-full bg-gradient-to-br from-electric-blue to-neon-cyan flex items-center justify-center flex-shrink-0"
                      >
                        <FiUser className="w-8 h-8 text-white" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                          <h3 className="text-xl font-bold text-white">{student.name}</h3>
                          <span className="px-3 py-1 bg-electric-blue/20 text-electric-blue rounded-full text-sm border border-electric-blue/30">
                            学号: {student.student_no}
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                          <p className="text-gray-400">
                            <FiBook className="w-4 h-4 inline mr-1" />
                            {student.major || '-'}
                          </p>
                          <p className="text-gray-400">
                            <FiCalendar className="w-4 h-4 inline mr-1" />
                            {student.grade || '-'}
                          </p>
                          <p className="text-gray-400">
                            <FiUser className="w-4 h-4 inline mr-1" />
                            {student.gender || '-'}
                          </p>
                          <p className="text-gray-400">
                            <FiUsers className="w-4 h-4 inline mr-1" />
                            {student.student_type || '-'}
                          </p>
                        </div>
                        {student.research_topic && (
                          <p className="mt-2 text-gray-400 text-sm">
                            <span className="text-electric-blue">研究课题:</span> {student.research_topic}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
              {myStudents.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={springConfig}
                >
                  <Card className="p-12 text-center glass-strong">
                    <FiUsers className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-400 mb-2">暂无学生</h3>
                    <p className="text-gray-500">您还没有指导学生</p>
                  </Card>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default MentorManagement;
