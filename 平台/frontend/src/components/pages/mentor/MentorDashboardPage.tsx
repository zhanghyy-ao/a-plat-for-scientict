import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { myApi, messageApi, taskApi, appointmentApi, notificationApi } from '../../../utils/api';
import { 
  FaUsers, FaTasks, FaCalendarAlt, FaBell, FaComments, 
  FaUserGraduate, FaClipboardList, FaCheckCircle
} from 'react-icons/fa';

const MentorDashboardPage: React.FC = () => {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">导师工作台</h1>
          <p className="text-gray-600">欢迎回来，{user?.profile?.name || '导师'}！</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link 
            to="/my-students" 
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white mr-4">
                <FaUsers className="text-xl" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">学生数量</p>
                <p className="text-3xl font-bold text-gray-800">{students.length}</p>
              </div>
            </div>
          </Link>

          <Link 
            to="/pending-progress" 
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center text-white mr-4">
                <FaClipboardList className="text-xl" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">待审进度</p>
                <p className="text-3xl font-bold text-gray-800">{pendingProgress.length}</p>
              </div>
            </div>
          </Link>

          <Link 
            to="/messages" 
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow relative"
          >
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center text-white mr-4">
                <FaComments className="text-xl" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">新消息</p>
                <p className="text-3xl font-bold text-gray-800">{unreadMessages}</p>
              </div>
            </div>
            {unreadMessages > 0 && (
              <div className="absolute top-3 right-3 w-4 h-4 bg-red-500 rounded-full"></div>
            )}
          </Link>

          <Link 
            to="/notifications" 
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow relative"
          >
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white mr-4">
                <FaBell className="text-xl" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">新通知</p>
                <p className="text-3xl font-bold text-gray-800">{unreadNotifications}</p>
              </div>
            </div>
            {unreadNotifications > 0 && (
              <div className="absolute top-3 right-3 w-4 h-4 bg-red-500 rounded-full"></div>
            )}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <FaUserGraduate className="mr-2 text-blue-600" />
                  学生列表
                </h2>
                <Link 
                  to="/my-students" 
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  查看全部 →
                </Link>
              </div>
              
              {students.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">暂无学生</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {students.slice(0, 4).map((student) => (
                    <Link 
                      key={student.id} 
                      to={`/my-students/${student.id}`}
                      className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                        {student.name?.charAt(0) || 'S'}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.student_no} · {student.grade}</p>
                      </div>
                      <FaCheckCircle className="text-green-500" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <FaTasks className="mr-2 text-yellow-600" />
                  待审进度
                </h2>
                <Link 
                  to="/pending-progress" 
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  查看全部 →
                </Link>
              </div>
              
              {pendingProgress.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">暂无待审进度</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingProgress.slice(0, 3).map((progress) => (
                    <div key={progress.id} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-800">{progress.title}</h3>
                        <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs">待审阅</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{progress.content}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">完成度：{progress.completion}%</span>
                        <span className="text-sm text-gray-500">{formatDate(progress.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <FaCalendarAlt className="mr-2 text-purple-600" />
                  即将到来
                </h2>
                <Link 
                  to="/appointments" 
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  查看全部 →
                </Link>
              </div>
              
              {upcomingAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">暂无预约</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">{appointment.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {formatDateTime(appointment.start_time)} - {formatDateTime(appointment.end_time).split(' ')[1]}
                      </p>
                      {appointment.location && (
                        <p className="text-sm text-gray-500">📍 {appointment.location}</p>
                      )}
                      <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${
                        appointment.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {appointment.status === 'confirmed' ? '已确认' : '待确认'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <FaTasks className="mr-2 text-green-600" />
                  近期任务
                </h2>
                <Link 
                  to="/tasks" 
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  查看全部 →
                </Link>
              </div>
              
              {tasks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">暂无任务</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">{task.title}</h3>
                      {task.due_date && (
                        <p className="text-sm text-gray-500 mb-2">截止：{formatDate(task.due_date)}</p>
                      )}
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        task.priority === 'high' 
                          ? 'bg-red-100 text-red-800' 
                          : task.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {task.priority === 'high' ? '高优先级' : task.priority === 'medium' ? '中优先级' : '低优先级'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboardPage;
