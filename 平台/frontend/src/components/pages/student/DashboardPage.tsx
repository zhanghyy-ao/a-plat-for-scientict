import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';
import Sidebar from '../../layout/Sidebar';
import Button from '../../common/Button';
import Card from '../../common/Card';
import { useAuth } from '../../../contexts/AuthContext';
import { todoApi, noteApi, resourceApi, bookingApi, progressApi } from '../../../utils/api';
import { 
  FiCheckCircle, FiClock, FiStar, FiCalendar, 
  FiFileText, FiBookOpen, FiEdit3, FiPlus, 
  FiTrendingUp, FiMessageSquare, FiUsers,
  FiAlertCircle, FiCheckSquare, FiSquare,
  FiChevronRight, FiMoreHorizontal
} from 'react-icons/fi';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [todos, setTodos] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [showAddTodoModal, setShowAddTodoModal] = useState(false);
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: ''
  });

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [todosData, notesData, resourcesData, progressData] = await Promise.all([
        todoApi.getTodos().catch(() => []),
        noteApi.getNotes().catch(() => []),
        resourceApi.getResources().catch(() => []),
        progressApi.getProgressList().catch(() => [])
      ]);
      
      setTodos(todosData);
      setNotes(notesData);
      setResources(resourcesData);
      setProgress(progressData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async () => {
    try {
      await todoApi.createTodo(newTodo);
      setShowAddTodoModal(false);
      setNewTodo({
        title: '',
        description: '',
        priority: 'medium',
        due_date: ''
      });
      loadDashboardData();
    } catch (error) {
      console.error('Failed to add todo:', error);
    }
  };

  const handleToggleTodo = async (todo: any) => {
    try {
      const newStatus = todo.status === 'completed' ? 'pending' : 'completed';
      await todoApi.updateTodo(todo.id, { status: newStatus });
      loadDashboardData();
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  };

  const stats = {
    pendingTodos: todos.filter(t => t.status === 'pending').length,
    completedTodos: todos.filter(t => t.status === 'completed').length,
    totalNotes: notes.length,
    totalResources: resources.length,
    pendingProgress: progress.filter(p => p.status === 'pending').length,
    reviewedProgress: progress.filter(p => p.status === 'reviewed').length
  };

  const priorityColors = {
    high: 'from-red-500 to-orange-500',
    medium: 'from-yellow-500 to-amber-500',
    low: 'from-green-500 to-emerald-500'
  };

  const priorityLabels = {
    high: '高',
    medium: '中',
    low: '低'
  };

  const quickLinks = [
    { name: '课题进度', icon: <FiBookOpen />, to: '/progress', color: 'from-neon-purple to-neon-cyan' },
    { name: '学习资源', icon: <FiFileText />, to: '/resources', color: 'from-neon-cyan to-electric-blue' },
    { name: '个人笔记', icon: <FiEdit3 />, to: '/notes', color: 'from-neon-pink to-purple-light' },
    { name: '资源预约', icon: <FiCalendar />, to: '/bookings', color: 'from-indigo-bright to-violet-deep' }
  ];

  return (
    <div className="min-h-screen flex">
      <Sidebar type="student" />
      
      <div className="flex-1 ml-64 flex flex-col gradient-bg particle-bg">
        <Header title="个人工作台" subtitle="高效管理您的学术日程" />
        
        <div className="flex-1 container mx-auto px-6 py-8">
          {loading ? (
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: '待办事项', value: stats.pendingTodos, icon: <FiClock />, color: 'from-neon-purple to-neon-cyan', change: `+${stats.completedTodos} 已完成` },
                    { label: '个人笔记', value: stats.totalNotes, icon: <FiEdit3 />, color: 'from-teal-glow to-emerald-500', change: '新增笔记' },
                    { label: '学习资源', value: stats.totalResources, icon: <FiFileText />, color: 'from-neon-pink to-purple-light', change: '资源库' },
                    { label: '待审进度', value: stats.pendingProgress, icon: <FiAlertCircle />, color: 'from-indigo-bright to-violet-deep', change: `${stats.reviewedProgress} 已反馈` }
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
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="p-6 glass">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-white flex items-center gap-3 font-orbitron">
                        <FiCheckSquare className="w-6 h-6 text-electric-blue" />
                        待办事项
                      </h3>
                      <Button 
                        onClick={() => setShowAddTodoModal(true)}
                        size="sm"
                        className="bg-gradient-to-r from-neon-purple to-neon-cyan hover:from-neon-purple/90 hover:to-neon-cyan/90 border-0"
                      >
                        <FiPlus className="w-4 h-4 mr-2" />
                        新增
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {todos.slice(0, 5).map((todo, index) => (
                        <motion.div
                          key={todo.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 bg-[var(--card)]/50 rounded-xl border border-white/5 hover:border-electric-blue/30 transition-all group"
                        >
                          <div className="flex items-start gap-4">
                            <button
                              onClick={() => handleToggleTodo(todo)}
                              className={`mt-1 flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                todo.status === 'completed' 
                                  ? 'bg-emerald-500 border-emerald-500 text-white' 
                                  : 'border-gray-500 hover:border-electric-blue'
                              }`}
                            >
                              {todo.status === 'completed' && <FiCheckCircle className="w-4 h-4" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className={`font-semibold ${todo.status === 'completed' ? 'text-gray-500 line-through' : 'text-white group-hover:text-electric-blue transition-colors'}`}>
                                  {todo.title}
                                </h4>
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full bg-gradient-to-r ${priorityColors[todo.priority as keyof typeof priorityColors]} text-white`}>
                                  {priorityLabels[todo.priority as keyof typeof priorityLabels]}
                                </span>
                              </div>
                              {todo.description && (
                                <p className="text-gray-400 text-sm mt-1 line-clamp-2">{todo.description}</p>
                              )}
                              {todo.due_date && (
                                <p className="text-gray-500 text-xs mt-2 flex items-center gap-1">
                                  <FiCalendar className="w-3 h-3" />
                                  截止: {new Date(todo.due_date).toLocaleDateString('zh-CN')}
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      {todos.length === 0 && (
                        <div className="text-center py-8">
                          <FiCheckSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400">暂无待办事项</p>
                          <Button 
                            onClick={() => setShowAddTodoModal(true)}
                            size="sm"
                            className="mt-4 bg-gradient-to-r from-electric-blue to-neon-cyan border-0"
                          >
                            <FiPlus className="w-4 h-4 mr-2" />
                            添加第一个待办
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>

                  <Card className="p-6 glass">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-white flex items-center gap-3 font-orbitron">
                        <FiEdit3 className="w-6 h-6 text-neon-cyan" />
                        最新笔记
                      </h3>
                      <Link to="/notes">
                        <Button size="sm" variant="outline" className="border-white/20">
                          查看全部
                        </Button>
                      </Link>
                    </div>
                    <div className="space-y-3">
                      {notes.slice(0, 3).map((note, index) => (
                        <motion.div
                          key={note.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 bg-[var(--card)]/50 rounded-xl border border-white/5 hover:border-neon-cyan/30 transition-all group"
                        >
                          <h4 className="font-semibold text-white group-hover:text-neon-cyan transition-colors">
                            {note.title}
                          </h4>
                          {note.content && (
                            <p className="text-gray-400 text-sm mt-1 line-clamp-2">{note.content}</p>
                          )}
                          <p className="text-gray-500 text-xs mt-2">
                            更新于: {new Date(note.updated_at).toLocaleDateString('zh-CN')}
                          </p>
                        </motion.div>
                      ))}
                      {notes.length === 0 && (
                        <div className="text-center py-8">
                          <FiEdit3 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400">暂无笔记</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="p-6 glass">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 font-orbitron">
                      <FiStar className="w-5 h-5 text-yellow-400" />
                      快捷入口
                    </h3>
                    <div className="space-y-3">
                      {quickLinks.map((link, index) => (
                        <Link key={index} to={link.to}>
                          <motion.div
                            whileHover={{ x: 4 }}
                            className="flex items-center gap-3 p-3 bg-[var(--card)]/50 rounded-lg border border-white/5 hover:border-electric-blue/30 transition-all cursor-pointer group"
                          >
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${link.color} flex items-center justify-center text-white`}>
                              {link.icon}
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-medium group-hover:text-electric-blue transition-colors">{link.name}</p>
                            </div>
                            <FiChevronRight className="w-4 h-4 text-gray-500" />
                          </motion.div>
                        </Link>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-6 glass">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2 font-orbitron">
                        <FiFileText className="w-5 h-5 text-neon-pink" />
                        最新资源
                      </h3>
                      <Link to="/resources">
                        <Button size="sm" variant="outline" className="border-white/20">
                          更多
                        </Button>
                      </Link>
                    </div>
                    <div className="space-y-3">
                      {resources.slice(0, 4).map((resource, index) => (
                        <motion.div
                          key={resource.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-3 bg-[var(--card)]/50 rounded-lg border border-white/5 hover:border-neon-pink/30 transition-all"
                        >
                          <p className="text-white text-sm font-medium truncate">{resource.title}</p>
                          <p className="text-gray-500 text-xs mt-1">
                            {resource.type} · {resource.view_count || 0} 次浏览
                          </p>
                        </motion.div>
                      ))}
                      {resources.length === 0 && (
                        <div className="text-center py-6">
                          <FiFileText className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                          <p className="text-gray-400 text-sm">暂无资源</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>

        {showAddTodoModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-lg"
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white font-orbitron">添加待办事项</h3>
                  <button
                    onClick={() => setShowAddTodoModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <FiMoreHorizontal className="w-6 h-6 rotate-45" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">标题 *</label>
                    <input
                      type="text"
                      value={newTodo.title}
                      onChange={(e) => setNewTodo({...newTodo, title: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                      placeholder="请输入待办事项标题"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">描述</label>
                    <textarea
                      value={newTodo.description}
                      onChange={(e) => setNewTodo({...newTodo, description: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50 resize-none"
                      rows={3}
                      placeholder="请输入详细描述"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">优先级</label>
                      <select
                        value={newTodo.priority}
                        onChange={(e) => setNewTodo({...newTodo, priority: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-electric-blue/50"
                      >
                        <option value="low">低</option>
                        <option value="medium">中</option>
                        <option value="high">高</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">截止日期</label>
                      <input
                        type="date"
                        value={newTodo.due_date}
                        onChange={(e) => setNewTodo({...newTodo, due_date: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-electric-blue/50"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddTodoModal(false)}
                    className="border-white/20"
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleAddTodo}
                    className="bg-gradient-to-r from-neon-purple to-neon-cyan hover:from-neon-purple/90 hover:to-neon-cyan/90 border-0"
                  >
                    <FiPlus className="w-4 h-4 mr-2" />
                    添加
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

export default DashboardPage;
