import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';
import Button from '../../common/Button';
import { useAuth } from '../../../contexts/AuthContext';

interface AboutContent {
  id: string;
  title: string;
  content: string;
  section: string;
  updated_at: string;
}

const AboutManagement: React.FC = () => {
  const [aboutContent, setAboutContent] = useState<AboutContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingContent, setEditingContent] = useState<AboutContent | null>(null);
  const [formData, setFormData] = useState<Partial<AboutContent>>({
    title: '',
    content: '',
    section: 'introduction'
  });
  const { user } = useAuth();

  const mockAboutContent: AboutContent[] = [
    {
      id: '1',
      title: '实验室简介',
      content: '计算机学院实验室成立于2000年，是学校重点建设的科研基地之一...',
      section: 'introduction',
      updated_at: '2024-01-15'
    },
    {
      id: '2',
      title: '研究方向',
      content: '实验室主要研究方向包括人工智能、机器学习、计算机视觉、自然语言处理等...',
      section: 'research',
      updated_at: '2024-01-10'
    },
    {
      id: '3',
      title: '发展历程',
      content: '2000年实验室成立，2005年获得省级重点实验室称号，2010年...',
      section: 'history',
      updated_at: '2024-01-05'
    }
  ];

  const sections = [
    { value: 'introduction', label: '简介' },
    { value: 'research', label: '研究方向' },
    { value: 'history', label: '发展历程' },
    { value: 'vision', label: '愿景' }
  ];

  useEffect(() => {
    setTimeout(() => {
      setAboutContent(mockAboutContent);
      setLoading(false);
    }, 500);
  }, []);

  const getSectionName = (section: string) => {
    const names: Record<string, string> = {
      introduction: '简介',
      research: '研究方向',
      history: '发展历程',
      vision: '愿景'
    };
    return names[section] || section;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingContent) {
      setAboutContent(aboutContent.map(c => c.id === editingContent.id ? { 
        ...c, 
        ...formData, 
        updated_at: new Date().toISOString().split('T')[0] 
      } as AboutContent : c));
    }
    setShowModal(false);
    setEditingContent(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      section: 'introduction'
    });
  };

  const handleEdit = (content: AboutContent) => {
    setEditingContent(content);
    setFormData(content);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header title="关于我们管理" subtitle="管理关于我们页面的内容" />
      
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
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-orbitron font-semibold text-electric-blue">
              关于我们内容
            </h3>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {aboutContent.map((content) => (
                <motion.div
                  key={content.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-dark-gray border border-light-gray/10 rounded-lg p-6"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="px-2 py-1 text-xs rounded-full bg-electric-blue/20 text-electric-blue">
                          {getSectionName(content.section)}
                        </span>
                        <span className="text-light-gray text-sm">
                          更新于: {content.updated_at}
                        </span>
                      </div>
                      <h4 className="text-lg font-semibold text-white mb-3">
                        {content.title}
                      </h4>
                      <div className="text-light-gray whitespace-pre-wrap">
                        {content.content}
                      </div>
                    </div>
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => handleEdit(content)}
                        className="text-electric-blue hover:text-electric-blue/80 p-2 ml-4"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
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
              编辑内容
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                    <label className="block text-light-gray mb-2">板块</label>
                    <select
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue"
                    >
                      {sections.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-light-gray mb-2">内容</label>
                  <textarea
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={8}
                    className="w-full px-4 py-2 bg-dark-gray border border-light-gray/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <Button type="button" variant="outline" onClick={() => {
                  setShowModal(false);
                  setEditingContent(null);
                  resetForm();
                }}>
                  取消
                </Button>
                <Button type="submit">
                  保存
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

export default AboutManagement;
