import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';
import Button from '../../common/Button';
import Card from '../../common/Card';
import { useAuth } from '../../../contexts/AuthContext';
import { taskApi } from '../../../utils/api';
import { 
  FiPlus, FiSearch, FiCalendar, FiUser, 
  FiCheckCircle, FiEdit3, FiTrash2, FiX,
  FiClock
} from 'react-icons/fi';

const TaskManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
    assigned_to: ''
  });
  const [error, setError] = useState<string | null>(null);

  const priorityColors: Record<string, string> = {
    high: 'from-red-500 to-red-600',
    medium: 'from-yellow-500 to-orange-500',
    low: 'from-emerald-500 to-teal-500'
  };

  const priorityLabels: Record<string, string> = {
    high: '高',
    medium: '中',
    low: '低'
  };

  useEffect(() => {
    loadTasks();
  }, [user]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await taskApi.getTasks();
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTask = async () => {
    // 表单验证
    if (!taskForm.title || taskForm.title.trim() === '') {
      setError('请输入任务标题');
      return;
    }
    
    setError(null);
    
    try {
      const dataToSend = {
        ...taskForm,
        title: taskForm.title.trim(),
        description: taskForm.description?.trim() || ''
      };
      
      if (editingTask) {
        await taskApi.updateTask(editingTask.id, dataToSend);
      } else {
        await taskApi.createTask(dataToSend);
      }
      setShowAddModal(false);
      setEditingTask(null);
      setTaskForm({
        title: '',
        description: '',
        priority: 'medium',
        due_date: '',
        assigned_to: ''
      });
      loadTasks();
    } catch (error: any) {
      console.error('Failed to save task:', error);
      setError(error.message || '保存失败，请重试');
    }
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority || 'medium',
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      assigned_to: task.assigned_to || ''
    });
    setShowAddModal(true);
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('确定要删除这个任务吗？')) return;
    try {
      await taskApi.deleteTask(id);
      loadTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleToggleStatus = async (task: any) => {
    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      await taskApi.updateTask(task.id, { ...task, status: newStatus });
      loadTasks();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen flex flex-col gradient-bg particle-bg">
      <Header title="任务管理" subtitle="管理和分配学生任务" />
      
      <main className="flex-1 container mx-auto px-6 py-8">
        <Card className="p-6 mb-6 glass">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="搜索任务标题或描述..."
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
                <option value="pending">进行中</option>
                <option value="completed">已完成</option>
              </select>
              <Button 
                onClick={() => {
                  setEditingTask(null);
                  setTaskForm({
                    title: '',
                    description: '',
                    priority: 'medium',
                    due_date: '',
                    assigned_to: ''
                  });
                  setShowAddModal(true);
                }}
                className="bg-gradient-to-r from-electric-blue to-neon-cyan hover:from-electric-blue/90 hover:to-neon-cyan/90 border-0"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                新建任务
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
            {filteredTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`p-6 glass border transition-all duration-300 ${
                  task.status === 'completed' 
                    ? 'border-emerald-500/30 opacity-75' 
                    : 'border-white/10 hover:border-electric-blue/30'
                }`}>
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => handleToggleStatus(task)}
                      className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        task.status === 'completed'
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-gray-500 hover:border-electric-blue'
                      }`}
                    >
                      {task.status === 'completed' && <FiCheckCircle className="w-4 h-4" />}
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className={`text-lg font-bold ${
                          task.status === 'completed' 
                            ? 'text-gray-500 line-through' 
                            : 'text-white'
                        }`}>
                          {task.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r ${priorityColors[task.priority]} text-white`}>
                          {priorityLabels[task.priority]}
                        </span>
                      </div>
                      
                      {task.description && (
                        <p className={`text-sm mb-3 ${
                          task.status === 'completed' ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        {task.due_date && (
                          <span className="flex items-center gap-1">
                            <FiCalendar className="w-3 h-3" />
                            截止: {new Date(task.due_date).toLocaleDateString('zh-CN')}
                          </span>
                        )}
                        {task.assigned_to_name && (
                          <span className="flex items-center gap-1">
                            <FiUser className="w-3 h-3" />
                            分配给: {task.assigned_to_name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <FiClock className="w-3 h-3" />
                          创建于: {new Date(task.created_at).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditTask(task)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-electric-blue"
                      >
                        <FiEdit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
            {filteredTasks.length === 0 && (
              <div className="col-span-full">
                <Card className="p-12 text-center">
                  <FiCheckCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-400 mb-2">暂无任务</h3>
                  <p className="text-gray-500 mb-6">开始创建第一个任务吧</p>
                  <Button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-gradient-to-r from-electric-blue to-neon-cyan border-0"
                  >
                    <FiPlus className="w-4 h-4 mr-2" />
                    新建任务
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
                  {editingTask ? '编辑任务' : '新建任务'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingTask(null);
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
                    value={taskForm.title}
                    onChange={(e) => {
                      setTaskForm({...taskForm, title: e.target.value});
                      if (error) setError(null);
                    }}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                    placeholder="请输入任务标题"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">描述</label>
                  <textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50 resize-none"
                    rows={4}
                    placeholder="请输入任务描述"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">优先级</label>
                    <select
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-electric-blue/50"
                    >
                      <option value="high">高</option>
                      <option value="medium">中</option>
                      <option value="low">低</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">截止日期</label>
                    <input
                      type="date"
                      value={taskForm.due_date}
                      onChange={(e) => setTaskForm({...taskForm, due_date: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-electric-blue/50"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingTask(null);
                    setError(null);
                  }}
                  className="border-white/20"
                >
                  取消
                </Button>
                <Button
                  onClick={handleSaveTask}
                  className="bg-gradient-to-r from-electric-blue to-neon-cyan hover:from-electric-blue/90 hover:to-neon-cyan/90 border-0"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  {editingTask ? '更新' : '创建'}
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

export default TaskManagementPage;
