import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';
import Button from '../../common/Button';
import Card from '../../common/Card';
import { useAuth } from '../../../contexts/AuthContext';
import { appointmentApi } from '../../../utils/api';
import { 
  FiPlus, FiSearch, FiCalendar, FiClock, FiUser, 
  FiCheckCircle, FiXCircle, FiEdit3, FiTrash2, FiX,
  FiMapPin, FiVideo, FiPhone
} from 'react-icons/fi';

const AppointmentManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const [appointmentForm, setAppointmentForm] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location: '',
    meeting_type: 'offline',
    student_id: ''
  });
  const [error, setError] = useState<string | null>(null);

  const meetingTypeIcons: Record<string, React.ReactNode> = {
    offline: <FiMapPin className="w-4 h-4" />,
    online: <FiVideo className="w-4 h-4" />,
    phone: <FiPhone className="w-4 h-4" />
  };

  const meetingTypeLabels: Record<string, string> = {
    offline: '线下',
    online: '线上',
    phone: '电话'
  };

  const statusColors: Record<string, string> = {
    pending: 'from-yellow-500 to-orange-500',
    confirmed: 'from-emerald-500 to-teal-500',
    cancelled: 'from-gray-500 to-gray-600',
    completed: 'from-blue-500 to-indigo-500'
  };

  const statusLabels: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    cancelled: '已取消',
    completed: '已完成'
  };

  useEffect(() => {
    loadAppointments();
  }, [user]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentApi.getAppointments();
      setAppointments(data);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAppointment = async () => {
    // 表单验证
    if (!appointmentForm.title || appointmentForm.title.trim() === '') {
      setError('请输入预约标题');
      return;
    }
    if (!appointmentForm.start_time) {
      setError('请选择开始时间');
      return;
    }
    if (!appointmentForm.end_time) {
      setError('请选择结束时间');
      return;
    }
    if (new Date(appointmentForm.start_time) >= new Date(appointmentForm.end_time)) {
      setError('结束时间必须晚于开始时间');
      return;
    }
    
    setError(null);
    
    try {
      const dataToSend = {
        ...appointmentForm,
        title: appointmentForm.title.trim(),
        description: appointmentForm.description?.trim() || '',
        location: appointmentForm.location?.trim() || ''
      };
      
      if (editingAppointment) {
        await appointmentApi.updateAppointment(editingAppointment.id, dataToSend);
      } else {
        await appointmentApi.createAppointment(dataToSend);
      }
      setShowAddModal(false);
      setEditingAppointment(null);
      setAppointmentForm({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        location: '',
        meeting_type: 'offline',
        student_id: ''
      });
      loadAppointments();
    } catch (error: any) {
      console.error('Failed to save appointment:', error);
      setError(error.message || '保存失败，请重试');
    }
  };

  const handleEditAppointment = (appointment: any) => {
    setEditingAppointment(appointment);
    setAppointmentForm({
      title: appointment.title,
      description: appointment.description || '',
      start_time: appointment.start_time ? appointment.start_time.slice(0, 16) : '',
      end_time: appointment.end_time ? appointment.end_time.slice(0, 16) : '',
      location: appointment.location || '',
      meeting_type: appointment.meeting_type || 'offline',
      student_id: appointment.student_id || ''
    });
    setShowAddModal(true);
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!confirm('确定要删除这个预约吗？')) return;
    try {
      await appointmentApi.deleteAppointment(id);
      loadAppointments();
    } catch (error) {
      console.error('Failed to delete appointment:', error);
    }
  };

  const handleUpdateStatus = async (appointment: any, newStatus: string) => {
    try {
      await appointmentApi.updateAppointment(appointment.id, { ...appointment, status: newStatus });
      loadAppointments();
    } catch (error) {
      console.error('Failed to update appointment status:', error);
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen flex flex-col gradient-bg particle-bg">
      <Header title="预约管理" subtitle="管理导师与学生的预约会议" />
      
      <main className="flex-1 container mx-auto px-6 py-8">
        <Card className="p-6 mb-6 glass">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="搜索预约标题或描述..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                />
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-neon-cyan/50"
              >
                <option value="all">全部状态</option>
                <option value="pending">待确认</option>
                <option value="confirmed">已确认</option>
                <option value="completed">已完成</option>
                <option value="cancelled">已取消</option>
              </select>
              <Button 
                onClick={() => {
                  setEditingAppointment(null);
                  setAppointmentForm({
                    title: '',
                    description: '',
                    start_time: '',
                    end_time: '',
                    location: '',
                    meeting_type: 'offline',
                    student_id: ''
                  });
                  setShowAddModal(true);
                }}
                className="bg-gradient-to-r from-electric-blue to-neon-cyan hover:from-electric-blue/90 hover:to-neon-cyan/90 border-0"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                新建预约
              </Button>
            </div>
          </div>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-electric-blue border-t-transparent"></div>
              <p className="text-gray-400 animate-pulse">加载中...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAppointments.map((appointment, index) => (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 glass border border-white/10 hover:border-electric-blue/30 transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${statusColors[appointment.status]} flex items-center justify-center text-white`}>
                        <FiCalendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{appointment.title}</h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full bg-gradient-to-r ${statusColors[appointment.status]} text-white`}>
                          {statusLabels[appointment.status]}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {appointment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(appointment, 'confirmed')}
                            className="p-2 hover:bg-emerald-500/20 rounded-lg transition-colors text-emerald-400"
                            title="确认"
                          >
                            <FiCheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(appointment, 'cancelled')}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                            title="取消"
                          >
                            <FiXCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleEditAppointment(appointment)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-electric-blue"
                      >
                        <FiEdit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAppointment(appointment.id)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {appointment.description && (
                    <p className="text-gray-400 text-sm mb-4">
                      {appointment.description}
                    </p>
                  )}
                  
                  <div className="space-y-2 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <FiClock className="w-4 h-4 text-electric-blue" />
                      <span>
                        {new Date(appointment.start_time).toLocaleString('zh-CN')} - 
                        {new Date(appointment.end_time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {meetingTypeIcons[appointment.meeting_type]}
                      <span>{meetingTypeLabels[appointment.meeting_type]}</span>
                      {appointment.location && (
                        <span className="text-gray-500">({appointment.location})</span>
                      )}
                    </div>
                    
                    {appointment.student_name && (
                      <div className="flex items-center gap-2">
                        <FiUser className="w-4 h-4 text-neon-cyan" />
                        <span>学生: {appointment.student_name}</span>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
            {filteredAppointments.length === 0 && (
              <div className="col-span-full">
                <Card className="p-12 text-center">
                  <FiCalendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-400 mb-2">暂无预约</h3>
                  <p className="text-gray-500 mb-6">开始创建第一个预约吧</p>
                  <Button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-gradient-to-r from-electric-blue to-neon-cyan border-0"
                  >
                    <FiPlus className="w-4 h-4 mr-2" />
                    新建预约
                  </Button>
                </Card>
              </div>
            )}
          </div>
        )}
      </main>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white font-orbitron">
                  {editingAppointment ? '编辑预约' : '新建预约'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingAppointment(null);
                    setError(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm mb-4">
                  {error}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">标题 *</label>
                  <input
                    type="text"
                    value={appointmentForm.title}
                    onChange={(e) => {
                      setAppointmentForm({...appointmentForm, title: e.target.value});
                      if (error) setError(null);
                    }}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                    placeholder="请输入预约标题"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">描述</label>
                  <textarea
                    value={appointmentForm.description}
                    onChange={(e) => setAppointmentForm({...appointmentForm, description: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50 resize-none"
                    rows={3}
                    placeholder="请输入预约描述"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">开始时间 *</label>
                    <input
                      type="datetime-local"
                      value={appointmentForm.start_time}
                      onChange={(e) => setAppointmentForm({...appointmentForm, start_time: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-electric-blue/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">结束时间 *</label>
                    <input
                      type="datetime-local"
                      value={appointmentForm.end_time}
                      onChange={(e) => setAppointmentForm({...appointmentForm, end_time: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-electric-blue/50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">会议类型</label>
                    <select
                      value={appointmentForm.meeting_type}
                      onChange={(e) => setAppointmentForm({...appointmentForm, meeting_type: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-electric-blue/50"
                    >
                      <option value="offline">线下</option>
                      <option value="online">线上</option>
                      <option value="phone">电话</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">地点/链接</label>
                    <input
                      type="text"
                      value={appointmentForm.location}
                      onChange={(e) => setAppointmentForm({...appointmentForm, location: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                      placeholder="会议室A / Zoom链接"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingAppointment(null);
                  }}
                  className="border-white/20"
                >
                  取消
                </Button>
                <Button
                  onClick={handleSaveAppointment}
                  className="bg-gradient-to-r from-electric-blue to-neon-cyan hover:from-electric-blue/90 hover:to-neon-cyan/90 border-0"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  {editingAppointment ? '更新' : '创建'}
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AppointmentManagementPage;
