import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';
import Button from '../../common/Button';
import Card from '../../common/Card';
import { useAuth } from '../../../contexts/AuthContext';
import { notificationApi } from '../../../utils/api';
import { 
  FiBell, FiCheck, FiCheckCircle, FiMessageSquare, 
  FiFileText, FiUser, FiCalendar, FiInfo, FiTrash2,
  FiCheckSquare
} from 'react-icons/fi';

const NotificationPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [filterType, setFilterType] = useState('all');

  const notificationTypeIcons: Record<string, React.ReactNode> = {
    message: <FiMessageSquare className="w-5 h-5" />,
    progress: <FiFileText className="w-5 h-5" />,
    task: <FiCheckSquare className="w-5 h-5" />,
    appointment: <FiCalendar className="w-5 h-5" />,
    system: <FiInfo className="w-5 h-5" />,
    default: <FiBell className="w-5 h-5" />
  };

  const notificationTypeColors: Record<string, string> = {
    message: 'from-blue-500 to-indigo-500',
    progress: 'from-purple-500 to-pink-500',
    task: 'from-yellow-500 to-orange-500',
    appointment: 'from-emerald-500 to-teal-500',
    system: 'from-gray-500 to-slate-500',
    default: 'from-electric-blue to-neon-cyan'
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationApi.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      loadNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      loadNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await notificationApi.deleteNotification(id);
      loadNotifications();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    return filterType === 'all' || notification.type === filterType;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen flex flex-col gradient-bg particle-bg">
      <Header title="通知中心" subtitle={`${unreadCount} 条未读通知`} />
      
      <main className="flex-1 container mx-auto px-6 py-8">
        <Card className="p-6 mb-6 glass">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  filterType === 'all'
                    ? 'bg-gradient-to-r from-electric-blue to-neon-cyan text-white'
                    : 'bg-slate-800/50 text-gray-400 hover:text-white'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => setFilterType('message')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  filterType === 'message'
                    ? 'bg-gradient-to-r from-electric-blue to-neon-cyan text-white'
                    : 'bg-slate-800/50 text-gray-400 hover:text-white'
                }`}
              >
                消息
              </button>
              <button
                onClick={() => setFilterType('progress')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  filterType === 'progress'
                    ? 'bg-gradient-to-r from-electric-blue to-neon-cyan text-white'
                    : 'bg-slate-800/50 text-gray-400 hover:text-white'
                }`}
              >
                进度
              </button>
              <button
                onClick={() => setFilterType('task')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  filterType === 'task'
                    ? 'bg-gradient-to-r from-electric-blue to-neon-cyan text-white'
                    : 'bg-slate-800/50 text-gray-400 hover:text-white'
                }`}
              >
                任务
              </button>
              <button
                onClick={() => setFilterType('appointment')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  filterType === 'appointment'
                    ? 'bg-gradient-to-r from-electric-blue to-neon-cyan text-white'
                    : 'bg-slate-800/50 text-gray-400 hover:text-white'
                }`}
              >
                预约
              </button>
            </div>
            {unreadCount > 0 && (
              <Button 
                onClick={handleMarkAllAsRead}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-500/90 hover:to-teal-500/90 border-0"
              >
                <FiCheckCircle className="w-4 h-4 mr-2" />
                全部标为已读
              </Button>
            )}
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
          <div className="space-y-4">
            {filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`p-6 glass border transition-all duration-300 ${
                  notification.is_read 
                    ? 'border-white/5 opacity-75' 
                    : 'border-electric-blue/30 bg-electric-blue/5'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${notificationTypeColors[notification.type] || notificationTypeColors.default} flex items-center justify-center text-white flex-shrink-0`}>
                      {notificationTypeIcons[notification.type] || notificationTypeIcons.default}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className={`font-bold ${
                          notification.is_read ? 'text-gray-400' : 'text-white'
                        }`}>
                          {notification.title}
                        </h3>
                        {!notification.is_read && (
                          <span className="px-2 py-0.5 bg-electric-blue/20 text-electric-blue rounded-full text-xs">
                            未读
                          </span>
                        )}
                      </div>
                      
                      {notification.message && (
                        <p className={`text-sm mb-2 ${
                          notification.is_read ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          {notification.message}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          {new Date(notification.created_at).toLocaleString('zh-CN')}
                        </span>
                        {notification.sender_name && (
                          <span className="flex items-center gap-1">
                            <FiUser className="w-3 h-3" />
                            {notification.sender_name}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-1 flex-shrink-0">
                      {!notification.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="p-2 hover:bg-emerald-500/20 rounded-lg transition-colors text-emerald-400"
                          title="标为已读"
                        >
                          <FiCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                        title="删除"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
            {filteredNotifications.length === 0 && (
              <Card className="p-12 text-center">
                <FiBell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-400 mb-2">暂无通知</h3>
                <p className="text-gray-500">有新消息时会在这里显示</p>
              </Card>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default NotificationPage;
