import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';
import Sidebar from '../../layout/Sidebar';
import Button from '../../common/Button';
import Card from '../../common/Card';
import { useAuth } from '../../../contexts/AuthContext';
import { resourceApi } from '../../../utils/api';
import { 
  FiFileText, FiBookOpen, FiVideo, FiLink, 
  FiSearch, FiPlus, FiEye,
  FiDownload, FiCalendar, FiStar
} from 'react-icons/fi';

const ResourcesPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    type: 'document',
    category: '',
    url: '',
    tags: '',
    is_public: true
  });
  const [error, setError] = useState<string | null>(null);

  const resourceTypes = [
    { value: 'all', label: '全部类型' },
    { value: 'document', label: '文档' },
    { value: 'video', label: '视频' },
    { value: 'link', label: '链接' },
    { value: 'book', label: '书籍' }
  ];

  const categories = [
    { value: 'all', label: '全部分类' },
    { value: '机器学习', label: '机器学习' },
    { value: '深度学习', label: '深度学习' },
    { value: '计算机视觉', label: '计算机视觉' },
    { value: '自然语言处理', label: '自然语言处理' },
    { value: '其他', label: '其他' }
  ];

  useEffect(() => {
    loadResources();
  }, [user]);

  const loadResources = async () => {
    try {
      setLoading(true);
      const type = filterType === 'all' ? undefined : filterType;
      const category = filterCategory === 'all' ? undefined : filterCategory;
      const data = await resourceApi.getResources(type, category);
      setResources(data);
    } catch (error) {
      console.error('Failed to load resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddResource = async () => {
    // 表单验证
    if (!newResource.title || newResource.title.trim() === '') {
      setError('请输入资源标题');
      return;
    }
    if (!newResource.type) {
      setError('请选择资源类型');
      return;
    }
    
    setError(null);
    
    try {
      const dataToSend = {
        ...newResource,
        title: newResource.title.trim(),
        description: newResource.description?.trim() || '',
        category: newResource.category?.trim() || '',
        url: newResource.url?.trim() || '',
        tags: newResource.tags?.trim() || ''
      };
      
      await resourceApi.createResource(dataToSend);
      setShowAddModal(false);
      setNewResource({
        title: '',
        description: '',
        type: 'document',
        category: '',
        url: '',
        tags: '',
        is_public: true
      });
      loadResources();
    } catch (error: any) {
      console.error('Failed to add resource:', error);
      setError(error.message || '保存失败，请重试');
    }
  };

  const filteredResources = resources.filter(resource =>
    resource.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.tags?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'document': return <FiFileText />;
      case 'video': return <FiVideo />;
      case 'link': return <FiLink />;
      case 'book': return <FiBookOpen />;
      default: return <FiFileText />;
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case 'document': return 'from-neon-purple to-neon-cyan';
      case 'video': return 'from-neon-pink to-purple-light';
      case 'link': return 'from-neon-cyan to-electric-blue';
      case 'book': return 'from-indigo-bright to-violet-deep';
      default: return 'from-neon-purple to-neon-cyan';
    }
  };

  return (
    <div className="min-h-screen flex gradient-bg particle-bg">
      <Sidebar type="student" />
      
      <div className="flex-1 flex flex-col min-h-screen">
        <Header title="学习资源库" subtitle="探索和共享优质学习资源" />
        
        <main className="flex-1 container mx-auto px-6 py-8">
          <Card className="p-6 mb-6 glass">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex-1 max-w-xl">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="搜索资源标题、描述或标签..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                  />
                </div>
              </div>
              <div className="flex gap-3 flex-wrap">
                <select
                  value={filterType}
                  onChange={(e) => { setFilterType(e.target.value); loadResources(); }}
                  className="px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-neon-cyan/50"
                >
                  {resourceTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <select
                  value={filterCategory}
                  onChange={(e) => { setFilterCategory(e.target.value); loadResources(); }}
                  className="px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-neon-cyan/50"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                <Button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-gradient-to-r from-neon-purple to-neon-cyan hover:from-neon-purple/90 hover:to-neon-cyan/90 border-0"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  上传资源
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource, index) => (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Card className="p-6 glass border border-white/10 hover:border-electric-blue/30 transition-all duration-300 h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getResourceColor(resource.type)} flex items-center justify-center text-white shadow-lg`}>
                        {getResourceIcon(resource.type)}
                      </div>
                      {!resource.is_public && (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs border border-yellow-500/30">
                          私有
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-electric-blue transition-colors">
                      {resource.title}
                    </h3>
                    
                    {resource.description && (
                      <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                        {resource.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {resource.category && (
                        <span className="px-2 py-1 bg-electric-blue/20 text-electric-blue rounded-full text-xs border border-electric-blue/30">
                          {resource.category}
                        </span>
                      )}
                      {resource.tags?.split(',').slice(0, 2).map((tag: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-slate-700/50 text-gray-400 rounded-full text-xs">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-gray-500 text-xs pt-4 border-t border-white/5">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <FiEye className="w-3 h-3" />
                          {resource.view_count || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiDownload className="w-3 h-3" />
                          {resource.download_count || 0}
                        </span>
                      </div>
                      <span className="flex items-center gap-1">
                        <FiCalendar className="w-3 h-3" />
                        {new Date(resource.created_at).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      {resource.url && (
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-white/20 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-colors"
                        >
                          <FiLink className="w-4 h-4 mr-2" />
                          访问
                        </a>
                      )}
                      <button className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-electric-blue to-neon-cyan rounded-xl text-sm font-medium text-white hover:shadow-lg transition-all">
                        <FiStar className="w-4 h-4 mr-2" />
                        收藏
                      </button>
                    </div>
                  </Card>
                </motion.div>
              ))}
              {filteredResources.length === 0 && (
                <div className="col-span-full">
                  <Card className="p-12 text-center">
                    <FiFileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-400 mb-2">暂无资源</h3>
                    <p className="text-gray-500 mb-6">开始上传第一个学习资源吧</p>
                    <Button 
                      onClick={() => setShowAddModal(true)}
                      className="bg-gradient-to-r from-electric-blue to-neon-cyan border-0"
                    >
                      <FiPlus className="w-4 h-4 mr-2" />
                      上传资源
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
                  <h3 className="text-2xl font-bold text-white font-orbitron">上传学习资源</h3>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setError(null);
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <FiPlus className="w-6 h-6 rotate-45" />
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
                      value={newResource.title}
                      onChange={(e) => {
                        setNewResource({...newResource, title: e.target.value});
                        if (error) setError(null);
                      }}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                      placeholder="请输入资源标题"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">描述</label>
                    <textarea
                      value={newResource.description}
                      onChange={(e) => setNewResource({...newResource, description: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50 resize-none"
                      rows={3}
                      placeholder="请输入资源描述"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">类型 *</label>
                      <select
                        value={newResource.type}
                        onChange={(e) => setNewResource({...newResource, type: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-electric-blue/50"
                      >
                        <option value="document">文档</option>
                        <option value="video">视频</option>
                        <option value="link">链接</option>
                        <option value="book">书籍</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">分类</label>
                      <select
                        value={newResource.category}
                        onChange={(e) => setNewResource({...newResource, category: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-electric-blue/50"
                      >
                        <option value="">请选择分类</option>
                        <option value="机器学习">机器学习</option>
                        <option value="深度学习">深度学习</option>
                        <option value="计算机视觉">计算机视觉</option>
                        <option value="自然语言处理">自然语言处理</option>
                        <option value="其他">其他</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">URL链接</label>
                    <input
                      type="url"
                      value={newResource.url}
                      onChange={(e) => setNewResource({...newResource, url: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">标签（用逗号分隔）</label>
                    <input
                      type="text"
                      value={newResource.tags}
                      onChange={(e) => setNewResource({...newResource, tags: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                      placeholder="机器学习, 深度学习, Python"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="is_public"
                      checked={newResource.is_public}
                      onChange={(e) => setNewResource({...newResource, is_public: e.target.checked})}
                      className="w-5 h-5 rounded border-gray-500 bg-slate-800 text-electric-blue focus:ring-electric-blue"
                    />
                    <label htmlFor="is_public" className="text-gray-400 text-sm">公开资源（其他用户可见）</label>
                  </div>
                </div>
                <div className="flex gap-3 mt-6 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddModal(false);
                      setError(null);
                    }}
                    className="border-white/20"
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleAddResource}
                    className="bg-gradient-to-r from-neon-purple to-neon-cyan hover:from-neon-purple/90 hover:to-neon-cyan/90 border-0"
                  >
                    <FiPlus className="w-4 h-4 mr-2" />
                    上传
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

export default ResourcesPage;
