import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';
import Button from '../../common/Button';
import { useAuth } from '../../../contexts/AuthContext';

interface News {
  id: string;
  title: string;
  content: string;
  category: string;
  publish_date: string;
  author: string;
  view_count: number;
}

const NewsManagement: React.FC = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [formData, setFormData] = useState<Partial<News>>({
    title: '',
    content: '',
    category: 'academic',
    publish_date: new Date().toISOString().split('T')[0],
    author: '',
    view_count: 0
  });
  const { user } = useAuth();

  const mockNews: News[] = [
    {
      id: '1',
      title: '实验室在人工智能领域取得重大突破',
      content: '实验室研究团队在国际顶级会议上发表了最新研究成果...',
      category: 'academic',
      publish_date: '2024-01-15',
      author: '李教授',
      view_count: 1250
    },
    {
      id: '2',
      title: '实验室2024年招生开始',
      content: '欢迎优秀的本科生和研究生加入我们的研究团队...',
      category: 'admission',
      publish_date: '2024-01-10',
      author: '王副教授',
      view_count: 890
    }
  ];

  const categories = [
    { value: 'all', label: '全部' },
    { value: 'academic', label: '学术新闻' },
    { value: 'admission', label: '招生信息' },
    { value: 'cooperation', label: '合作交流' },
    { value: 'event', label: '活动通知' }
  ];

  useEffect(() => {
    setTimeout(() => {
      setNews(mockNews);
      setLoading(false);
    }, 500);
  }, []);

  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      academic: '学术新闻',
      admission: '招生信息',
      cooperation: '合作交流',
      event: '活动通知'
    };
    return names[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      academic: 'bg-blue-500/20 text-blue-400',
      admission: 'bg-green-500/20 text-green-400',
      cooperation: 'bg-yellow-500/20 text-yellow-400',
      event: 'bg-purple-500/20 text-purple-400'
    };
    return colors[category] || 'bg-gray-500/20 text-gray-400';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNews) {
      setNews(news.map(n => n.id === editingNews.id ? { ...n, ...formData } as News : n));
    } else {
      const newNewsItem: News = {
        ...formData,
        id: Date.now().toString()
      } as News;
      setNews([newNewsItem, ...news]);
    }
    setShowModal(false);
    setEditingNews(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'academic',
      publish_date: new Date().toISOString().split('T')[0],
      author: '',
      view_count: 0
    });
  };

  const handleEdit = (newsItem: News) => {
    setEditingNews(newsItem);
    setFormData(newsItem);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条新闻吗？')) {
      setNews(news.filter(n => n.id !== id));
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header title="新闻管理" subtitle="管理实验室的新闻和公告" />
      
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
              新闻列表
            </h3>
            <div className="flex gap-4 flex-wrap">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索新闻..."
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
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-dark-gray border border-light-gray/30 rounded-lg text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              {user?.role === 'admin' && (
                <Button onClick={() => setShowModal(true)}>
                  发布新闻
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
              {filteredNews.map((newsItem) => (
                <motion.div
                  key={newsItem.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-dark-gray border border-light-gray/10 rounded-lg p-6 hover:border-electric-blue transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(newsItem.category)}`}>
                          {getCategoryName(newsItem.category)}
                        </span>
                        <span className="text-light-gray text-sm">
                          {newsItem.publish_date}
                        </span>
                      </div>
                      <h4 className="text-lg font-semibold text-white mb-2">
                        {newsItem.title}
                      </h4>
                      <p className="text-light-gray mb-3 line-clamp-2">
                        {newsItem.content}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-light-gray">
                        <span>作者: {newsItem.author}</span>
                        <span>阅读: {newsItem.view_count}</span>
                      </div>
                    </div>
                    {user?.role === 'admin' && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(newsItem)}
                          className="text-electric-blue hover:text-electric-blue/80 p-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(newsItem.id)}
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
          
          {filteredNews.length === 0 && !loading && (
            <div className="text-center py-12 text-light-gray">
              暂无新闻数据
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
              {editingNews ? '编辑新闻' : '发布新闻'}
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
                <div>
                  <label className="block text-light-gray mb-2">分类</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue"
                  >
                    <option value="academic">学术新闻</option>
                    <option value="admission">招生信息</option>
                    <option value="cooperation">合作交流</option>
                    <option value="event">活动通知</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-light-gray mb-2">发布日期</label>
                    <input
                      type="date"
                      required
                      value={formData.publish_date}
                      onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-light-gray mb-2">作者</label>
                    <input
                      type="text"
                      required
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-light-gray mb-2">内容</label>
                  <textarea
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <Button type="button" variant="outline" onClick={() => {
                  setShowModal(false);
                  setEditingNews(null);
                  resetForm();
                }}>
                  取消
                </Button>
                <Button type="submit">
                  {editingNews ? '保存' : '发布'}
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

export default NewsManagement;
