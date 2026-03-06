import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';
import Button from '../../common/Button';
import Card from '../../common/Card';
import { useAuth } from '../../../contexts/AuthContext';
import { FiEdit, FiPlus, FiTrash2, FiSave, FiX, FiBook } from 'react-icons/fi';

interface ResearchArea {
  id: string;
  name: string;
  description: string;
  icon: string;
  leader?: string;
  member_count?: number;
  project_count?: number;
}

const ResearchAreasManagement: React.FC = () => {
  const { user } = useAuth();
  const [researchAreas, setResearchAreas] = useState<ResearchArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingArea, setEditingArea] = useState<ResearchArea | null>(null);
  const [deletingAreaId, setDeletingAreaId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ResearchArea>>({
    name: '',
    description: '',
    icon: '📚',
    leader: ''
  });

  // 模拟数据 - 实际应该从API获取
  const mockResearchAreas: ResearchArea[] = [
    {
      id: '1',
      name: '人工智能',
      description: '深度学习、机器学习、自然语言处理、计算机视觉等前沿AI技术研究',
      icon: '🤖',
      leader: '张教授',
      member_count: 15,
      project_count: 8
    },
    {
      id: '2',
      name: '计算机视觉',
      description: '图像识别、目标检测、视频分析、医学影像处理等视觉技术研究',
      icon: '👁️',
      leader: '李副教授',
      member_count: 12,
      project_count: 6
    },
    {
      id: '3',
      name: '机器人技术',
      description: '智能控制、自主导航、人机交互、多机器人协作等机器人技术研究',
      icon: '🦾',
      leader: '王讲师',
      member_count: 10,
      project_count: 5
    },
    {
      id: '4',
      name: '网络安全',
      description: '密码学、网络防护、安全协议、区块链等安全技术研究',
      icon: '🔒',
      leader: '赵助教',
      member_count: 8,
      project_count: 4
    }
  ];

  const iconOptions = [
    { value: '🤖', label: '机器人' },
    { value: '👁️', label: '视觉' },
    { value: '🧠', label: '智能' },
    { value: '🔒', label: '安全' },
    { value: '📊', label: '数据' },
    { value: '💻', label: '计算机' },
    { value: '🌐', label: '网络' },
    { value: '📚', label: '学术' },
    { value: '🔬', label: '研究' },
    { value: '⚡', label: '能源' },
    { value: '🦾', label: '机械' },
    { value: '🎯', label: '目标' }
  ];

  useEffect(() => {
    loadResearchAreas();
  }, []);

  const loadResearchAreas = async () => {
    try {
      setLoading(true);
      // 实际应该从API获取数据
      // const data = await researchAreaApi.getResearchAreas();
      setResearchAreas(mockResearchAreas);
    } catch (error) {
      console.error('Failed to load research areas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingArea) {
        // 更新研究方向
        setResearchAreas(areas => 
          areas.map(area => 
            area.id === editingArea.id 
              ? { ...area, ...formData } as ResearchArea
              : area
          )
        );
      } else {
        // 添加新研究方向
        const newArea: ResearchArea = {
          id: Date.now().toString(),
          name: formData.name || '',
          description: formData.description || '',
          icon: formData.icon || '📚',
          leader: formData.leader || '',
          member_count: 0,
          project_count: 0
        };
        setResearchAreas([...researchAreas, newArea]);
      }
      closeModal();
    } catch (error) {
      console.error('Failed to save research area:', error);
      alert('保存失败');
    }
  };

  const handleDelete = async () => {
    if (!deletingAreaId) return;
    try {
      setResearchAreas(areas => areas.filter(area => area.id !== deletingAreaId));
      setShowDeleteModal(false);
      setDeletingAreaId(null);
    } catch (error) {
      console.error('Failed to delete research area:', error);
      alert('删除失败');
    }
  };

  const openAddModal = () => {
    setEditingArea(null);
    setFormData({
      name: '',
      description: '',
      icon: '📚',
      leader: ''
    });
    setShowAddModal(true);
  };

  const openEditModal = (area: ResearchArea) => {
    setEditingArea(area);
    setFormData(area);
    setShowEditModal(true);
  };

  const openDeleteModal = (id: string) => {
    setDeletingAreaId(id);
    setShowDeleteModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingArea(null);
    setFormData({
      name: '',
      description: '',
      icon: '📚',
      leader: ''
    });
  };

  const springConfig = {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30
  };

  return (
    <div className="min-h-screen flex flex-col bg-deep-space">
      <Header title="研究方向管理" subtitle="管理实验室的研究方向" />
      
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
        >
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <h3 className="text-xl font-orbitron font-semibold text-electric-blue">
              研究方向列表
            </h3>
            {user?.role === 'admin' && (
              <Button onClick={openAddModal}>
                <FiPlus className="w-5 h-5 mr-2 inline" />
                添加研究方向
              </Button>
            )}
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {researchAreas.map((area, index) => (
                <motion.div
                  key={area.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...springConfig, delay: index * 0.1 }}
                >
                  <Card className="p-6 glass-strong hover:border-electric-blue/30 transition-all h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl">{area.icon}</div>
                      {user?.role === 'admin' && (
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openEditModal(area)}
                            className="p-2 text-electric-blue hover:bg-electric-blue/10 rounded-lg transition-colors"
                          >
                            <FiEdit className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openDeleteModal(area.id)}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      )}
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">{area.name}</h4>
                    <p className="text-gray-400 mb-4 text-sm line-clamp-3">{area.description}</p>
                    <div className="space-y-2 text-sm text-gray-500">
                      {area.leader && (
                        <p>
                          <span className="text-electric-blue">负责人:</span> {area.leader}
                        </p>
                      )}
                      <div className="flex gap-4">
                        <span>
                          <span className="text-electric-blue">成员:</span> {area.member_count}人
                        </span>
                        <span>
                          <span className="text-electric-blue">项目:</span> {area.project_count}个
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
          
          {researchAreas.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={springConfig}
            >
              <Card className="p-12 text-center glass-strong">
                <FiBook className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-400 mb-2">暂无研究方向</h3>
                <p className="text-gray-500">点击上方"添加研究方向"按钮来创建新的研究方向</p>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
      
      <Footer />

      {/* 添加/编辑模态框 */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springConfig}
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <Card className="p-6 glass-strong">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white font-orbitron">
                  {editingArea ? '编辑研究方向' : '添加研究方向'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">研究方向名称 *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                      placeholder="例如：人工智能"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">图标</label>
                    <div className="grid grid-cols-6 gap-2">
                      {iconOptions.map((icon) => (
                        <button
                          key={icon.value}
                          type="button"
                          onClick={() => setFormData({...formData, icon: icon.value})}
                          className={`p-3 text-2xl rounded-lg border transition-all ${
                            formData.icon === icon.value
                              ? 'border-electric-blue bg-electric-blue/20'
                              : 'border-white/10 hover:border-white/30'
                          }`}
                          title={icon.label}
                        >
                          {icon.value}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">描述 *</label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                      placeholder="描述该研究方向的主要内容和特点"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">负责人</label>
                    <input
                      type="text"
                      value={formData.leader}
                      onChange={(e) => setFormData({...formData, leader: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue/50"
                      placeholder="负责人姓名"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6 justify-end">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeModal}
                      className="border-white/20"
                    >
                      取消
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-electric-blue to-neon-cyan hover:from-electric-blue/90 hover:to-neon-cyan/90 border-0"
                    >
                      <FiSave className="w-4 h-4 mr-2" />
                      保存
                    </Button>
                  </motion.div>
                </div>
              </form>
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
                    setDeletingAreaId(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              <div className="mb-6">
                <p className="text-gray-400">
                  确定要删除这个研究方向吗？此操作不可恢复。
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeletingAreaId(null);
                    }}
                    className="border-white/20"
                  >
                    取消
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleDelete}
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
};

export default ResearchAreasManagement;
