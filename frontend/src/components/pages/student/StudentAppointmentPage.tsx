import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';
import Sidebar from '../../layout/Sidebar';
import Button from '../../common/Button';
import Card from '../../common/Card';
import { useAuth } from '../../../contexts/AuthContext';
import { appointmentApi, myApi } from '../../../utils/api';
import { 
  FiPlus, FiSearch, FiCalendar, FiClock, FiUser, 
  FiCheckCircle, FiXCircle, FiEdit3, FiTrash2, FiX,
  FiMapPin, FiVideo, FiPhone, FiChevronLeft, FiChevronRight,
  FiGrid, FiList, FiRefreshCw
} from 'react-icons/fi';

const StudentAppointmentPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [myMentor, setMyMentor] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointmentForm, setAppointmentForm] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location: '',
    appointment_type: 'offline'
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
    loadMyMentor();
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

  const loadMyMentor = async () => {
    try {
      const data = await myApi.getMyMentor();
      setMyMentor(data);
    } catch (error) {
      console.error('Failed to load my mentor:', error);
    }
  };

  const handleCreateAppointment = async () => {
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
    if (!myMentor) {
      setError('您还没有分配导师，无法创建预约');
      return;
    }
    
    setError(null);
    
    try {
      const dataToSend = {
        ...appointmentForm,
        title: appointmentForm.title.trim(),
        description: appointmentForm.description?.trim() || '',
        location: appointmentForm.location?.trim() || '',
        mentor_id: myMentor.id
      };
      
      if (editingAppointment) {
        await appointmentApi.updateAppointment(editingAppointment.id, dataToSend);
      } else {
        await appointmentApi.createAppointment(dataToSend);
      }
      setShowAddModal(false);
      setEditingAppointment(null);
      resetForm();
      loadAppointments();
    } catch (error: any) {
      console.error('Failed to save appointment:', error);
      setError(error.message || '保存失败，请重试');
    }
  };

  const resetForm = () => {
    setAppointmentForm({
      title: '',
      description: '',
      start_time: '',
      end_time: '',
      location: '',
      appointment_type: 'offline'
    });
  };

  const handleEditAppointment = (appointment: any) => {
    // 只能编辑pending状态的预约
    if (appointment.status !== 'pending') {
      alert('只能编辑待确认状态的预约');
      return;
    }
    setEditingAppointment(appointment);
    setAppointmentForm({
      title: appointment.title,
      description: appointment.description || '',
      start_time: appointment.start_time ? appointment.start_time.slice(0, 16) : '',
      end_time: appointment.end_time ? appointment.end_time.slice(0, 16) : '',
      location: appointment.location || '',
      appointment_type: appointment.appointment_type || 'offline'
    });
    setShowAddModal(true);
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!confirm('确定要取消这个预约请求吗？')) return;
    try {
      await appointmentApi.deleteAppointment(id);
      loadAppointments();
    } catch (error) {
      console.error('Failed to delete appointment:', error);
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // 日历相关函数
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getAppointmentsForDate = (date: Date) => {
    return filteredAppointments.filter(appointment => {
      const appointmentDate = new Date(appointment.start_time);
      return appointmentDate.toDateString() === date.toDateString();
    });
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-slate-800/30 rounded-lg"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayAppointments = getAppointmentsForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();
      
      days.push(
        <div 
          key={day} 
          className={`h-24 bg-slate-800/50 rounded-lg p-2 border transition-all ${
            isToday ? 'border-electric-blue/50 bg-electric-blue/10' : 'border-white/5'
          }`}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-electric-blue' : 'text-gray-400'}`}>
            {day}
          </div>
          <div className="space-y-1 overflow-hidden">
            {dayAppointments.slice(0, 2).map((appt, idx) => (
              <div 
                key={idx}
                className={`text-xs px-2 py-1 rounded truncate bg-gradient-to-r ${statusColors[appt.status]} text-white`}
              >
                {appt.title}
              </div>
            ))}
            {dayAppointments.length > 2 && (
              <div className="text-xs text-gray-500">+{dayAppointments.length - 2} 更多</div>
            )}
          </div>
        </div>
      );
    }
    
    return days;
  };

  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="min-h-screen flex flex-col gradient-bg particle-bg">
      <Header showNavbar={true} />
      
      <div className="flex-1 flex pt-20">
        <Sidebar type="student" />
        
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
                <div className="flex bg-slate-800/50 border border-white/10 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-3 flex items-center gap-2 transition-colors ${
                      viewMode === 'list' ? 'bg-electric-blue/30 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <FiList className="w-4 h-4" />
                    列表
                  </button>
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`px-4 py-3 flex items-center gap-2 transition-colors ${
                      viewMode === 'calendar' ? 'bg-electric-blue/30 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <FiGrid className="w-4 h-4" />
                    日历
                  </button>
                </div>
                <Button 
                  onClick={() => {
                    if (!myMentor) {
                      alert('您还没有分配导师，无法创建预约');
                      return;
                    }
                    setEditingAppointment(null);
                    resetForm();
                    setShowAddModal(true);
                  }}
                  className="bg-gradient-to-r from-electric-blue to-neon-cyan hover:from-electric-blue/90 hover:to-neon-cyan/90 border-0"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  申请预约
                </Button>
              </div>
            </div>
          </Card>

          {myMentor && (
            <Card className="p-4 mb-6 glass border-l-4 border-l-electric-blue">
              <div className="flex items-center gap-3">
                <FiUser className="w-5 h-5 text-electric-blue" />
                <span className="text-gray-300">我的导师:</span>
                <span className="text-white font-medium">{myMentor.name}</span>
                {myMentor.title && <span className="text-gray-400 text-sm">({myMentor.title})</span>}
              </div>
            </Card>
          )}

          {viewMode === 'calendar' && (
            <Card className="p-6 mb-6 glass">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                  >
                    <FiChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white hover:bg-slate-700/50 transition-colors"
                  >
                    今天
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                  >
                    <FiChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2 mb-2">
                {weekDays.map(day => (
                  <div key={day} className="text-center text-gray-400 text-sm py-2">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {renderCalendar()}
              </div>
            </Card>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-electric-blue border-t-transparent"></div>
                <p className="text-gray-400 animate-pulse">加载中...</p>
              </div>
            </div>
          ) : viewMode === 'list' ? (
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
                              onClick={() => handleEditAppointment(appointment)}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-electric-blue"
                              title="编辑"
                            >
                              <FiEdit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAppointment(appointment.id)}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                              title="取消预约"
                            >
                              <FiXCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
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
                        {meetingTypeIcons[appointment.appointment_type]}
                        <span>{meetingTypeLabels[appointment.appointment_type]}</span>
                        {appointment.location && (
                          <span className="text-gray-500">({appointment.location})</span>
                        )}
                      </div>
                      
                      {appointment.mentor_name && (
                        <div className="flex items-center gap-2">
                          <FiUser className="w-4 h-4 text-neon-cyan" />
                          <span>导师: {appointment.mentor_name}</span>
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
                    <p className="text-gray-500 mb-6">向导师发起预约请求吧</p>
                    {myMentor ? (
                      <Button 
                        onClick={() => {
                          setEditingAppointment(null);
                          resetForm();
                          setShowAddModal(true);
                        }}
                        className="bg-gradient-to-r from-electric-blue to-neon-cyan border-0"
                      >
                        <FiPlus className="w-4 h-4 mr-2" />
                        申请预约
                      </Button>
                    ) : (
                      <p className="text-yellow-400 text-sm">您还没有分配导师，请联系管理员</p>
                    )}
                  </Card>
                </div>
              )}
            </div>
          ) : null}
        </main>
      </div>

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
                  {editingAppointment ? '编辑预约' : '申请预约'}
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
              
              {myMentor && (
                <div className="p-4 bg-electric-blue/10 border border-electric-blue/30 rounded-xl mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <FiUser className="w-4 h-4 text-electric-blue" />
                    <span className="text-gray-300">预约导师:</span>
                    <span className="text-white font-medium">{myMentor.name}</span>
                  </div>
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
                    placeholder="请输入预约标题，如：课题讨论"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">描述</label>
                  <textarea
                    value={appointmentForm.description}
                    onChange={(e) => setAppointmentForm({...appointmentForm, description: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50 resize-none"
                    rows={3}
                    placeholder="请输入预约描述，说明预约目的..."
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
                      value={appointmentForm.appointment_type}
                      onChange={(e) => setAppointmentForm({...appointmentForm, appointment_type: e.target.value})}
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
                  onClick={handleCreateAppointment}
                  className="bg-gradient-to-r from-electric-blue to-neon-cyan hover:from-electric-blue/90 hover:to-neon-cyan/90 border-0"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  {editingAppointment ? '更新' : '提交申请'}
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

export default StudentAppointmentPage;
