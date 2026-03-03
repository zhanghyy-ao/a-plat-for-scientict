import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';
import Button from '../../common/Button';
import { useAuth } from '../../../contexts/AuthContext';

interface Achievement {
  id: string;
  title: string;
  type: string;
  description: string;
  publish_date: string;
  authors: string[];
  venue: string;
  level: string;
  link: string;
  citations: number;
}

const AchievementsManagement: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [formData, setFormData] = useState<Partial<Achievement>>({
    title: '',
    type: 'paper',
    description: '',
    publish_date: new Date().toISOString().split('T')[0],
    authors: [],
    venue: '',
    level: 'international',
    link: '',
    citations: 0
  });
  const { user } = useAuth();

  const mockAchievements: Achievement[] = [
    {
      id: '1',
      title: '基于深度学习的图像识别研究',
      type: 'paper',
      description: '提出了一种新的深度学习架构，在图像识别任务上取得了突破性进展...',
      publish_date: '2024-01-10',
      authors: ['李教授', '张三', '李四'],
      venue: 'CVPR 2024',
      level: 'international',
      link: 'https://example.com/paper1',
      citations: 45
    },
    {
      id: '2',
      title: '智能问答系统',
      type: 'project',
      description: '开发了一套基于自然语言处理的智能问答系统...',
      publish_date: '2023-12-15',
      authors: ['王副教授', '王五'],
      venue: '科技部重点研发项目',
      level: 'national',
      link: 'https://example.com/project1',
      citations: 0
    }
  ];

  const types = [
    { value: 'all', label: '全部' },
    { value: 'paper', label: '论文' },
    { value: 'project', label: '项目' },
    { value: 'award', label: '奖项' },
    { value: 'patent', label: '专利' }
  ];

  const levels = [
    { value: 'international', label: '国际级' },
    { value: 'national', label: '国家级' },
    { value: 'provincial', label: '省部级' }
  ];

  useEffect(() => {
    setTimeout(() => {
      setAchievements(mockAchievements);
      setLoading(false);
    }, 500);
  }, []);

  const filteredAchievements = achievements.filter(achievement => {
    const matchesSearch = achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || achievement.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeName = (type: string) => {
    const names: Record<string, string> = {
      paper: '论文',
      project: '项目',
      award: '奖项',
      patent: '专利'
    };
    return names[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      paper: 'bg-blue-500/20 text-blue-400',
      project: 'bg-green-500/20 text-green-400',
      award: 'bg-yellow-500/20 text-yellow-400',
      patent: 'bg-purple-500/20 text-purple-400'
    };
    return colors[type] || 'bg-gray-500/20 text-gray-400';
  };

  const getLevelName = (level: string) => {
    const names: Record<string, string> = {
      international: '国际级',
      national: '国家级',
      provincial: '省部级'
    };
    return names[level] || level;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAchievement) {
      setAchievements(achievements.map(a => a.id === editingAchievement.id ? { ...a, ...formData } as Achievement : a));
    } else {
      const newAchievement: Achievement = {
        ...formData,
        id: Date.now().toString()
      } as Achievement;
      setAchievements([newAchievement, ...achievements]);
    }
    setShowModal(false);
    setEditingAchievement(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'paper',
      description: '',
      publish_date: new Date().toISOString().split('T')[0],
      authors: [],
      venue: '',
      level: 'international',
      link: '',
      citations: 0
    });
  };

  const handleEdit = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setFormData(achievement);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个成果吗？')) {
      setAchievements(achievements.filter(a => a.id !== id));
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header title="成果管理" subtitle="管理实验室的科研成果" />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4"
        >
          <Link
            to="/content-management"
            className="inline-flex items-center text-electric-blue hover:text-electric-blue/80"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回内容管理
          </Link>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-dark-gray/50 border border-light-gray/10 rounded-lg p-6"
        >
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <h3 className="text-xl font-orbitron font-semibold text-electric-blue">
              成果列表
            </h3>
            <div className="flex gap-4 flex-wrap">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索成果..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-dark-gray border border-light-gray/30 rounded-lg text-white placeholder-light-gray/50 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-light-gray/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-dark-gray border border-light-gray/30 rounded-lg text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue"
              >
                {types.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {user?.role === 'admin' && (
                <Button onClick={() => setShowModal(true)}>
                  添加成果
                </Button>
              )}
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAchievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-dark-gray border border-light-gray/10 rounded-lg p-6 hover:border-electric-blue transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(achievement.type)}`}>
                          {getTypeName(achievement.type)}
                        </span>
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-500/20 text-gray-400">
                          {getLevelName(achievement.level)}
                        </span>
                        <span className="text-light-gray text-sm">
                          {achievement.publish_date}
                        </span>
                      </div>
                      <h4 className="text-lg font-semibold text-white mb-2">
                        {achievement.title}
                      </h4>
                      <p className="text-light-gray mb-3 line-clamp-2">
                        {achievement.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-light-gray">
                        <span>发表于: {achievement.venue}</span>
                        <span>作者: {achievement.authors.join(', ')}</span>
                        {achievement.citations > 0 && (
                          <span>引用: {achievement.citations}</span>
                        )}
                      </div>
                    </div>
                    {user?.role === 'admin' && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(achievement)}
                          className="text-electric-blue hover:text-electric-blue/80 p-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(achievement.id)}
                          className="text-red-400 hover:text-red-300 p-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          {filteredAchievements.length === 0 && !loading && (
            <div className="text-center py-12 text-light-gray">
              暂无成果数据
            </div>
          )}
        </motion.div>
      </div>
      
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-gray border border-light-gray/10 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl font-orbitron font-semibold text-electric-blue mb-6">
              {editingAchievement ? '编辑成果' : '添加成果'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-light-gray mb-2">标题</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-light-gray mb-2">类型</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue"
                    >
                      <option value="paper">论文</option>
                      <option value="project">项目</option>
                      <option value="award">奖项</option>
                      <option value="patent">专利</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-light-gray mb-2">级别</label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue"
                    >
                      {levels.map(l => (
                        <option key={l.value} value={l.value}>{l.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-light-gray mb-2">发表日期</label>
                    <input
                      type="date"
                      required
                      value={formData.publish_date}
                      onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-light-gray mb-2">发表/获得地点</label>
                    <input
                      type="text"
                      required
                      value={formData.venue}
                      onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-light-gray mb-2">作者 (用逗号分隔)</label>
                  <input
                    type="text"
                    value={formData.authors?.join(', ') || ''}
                    onChange={(e) => setFormData({ ...formData, authors: e.target.value.split(',').map(s => s.trim()) })}
                    className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue"
                  />
                </div>
                <div>
                  <label className="block text-light-gray mb-2">描述</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-light-gray mb-2">链接</label>
                    <input
                      type="url"
                      value={formData.link}
                      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-light-gray mb-2">引用次数</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.citations}
                      onChange={(e) => setFormData({ ...formData, citations: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <Button type="button" variant="outline" onClick={() => {
                  setShowModal(false);
                  setEditingAchievement(null);
                  resetForm();
                }}>
                  取消
                </Button>
                <Button type="submit">
                  {editingAchievement ? '保存' : '添加'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default AchievementsManagement;
