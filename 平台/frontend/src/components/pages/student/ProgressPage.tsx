import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { myApi, progressApi } from '../../../utils/api';
import { motion } from 'framer-motion';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';
import Sidebar from '../../layout/Sidebar';
import Button from '../../common/Button';
import Card from '../../common/Card';
import { 
  FiPlus, FiCalendar, FiArrowLeft, FiEye, 
  FiCheck, FiClock, FiEdit, FiTrendingUp,
  FiChevronRight, FiX
} from 'react-icons/fi';

const ProgressPage: React.FC = () => {
  const [progressList, setProgressList] = useState<any[]>([]);
  const [selectedProgress, setSelectedProgress] = useState<any>(null);
  const [feedback, setFeedback] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'submit'>('list');
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { progressId } = useParams<{ progressId?: string }>();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    completion: 0,
    problems: '',
    next_plan: '',
  });

  useEffect(() => {
    if (user?.role === 'student') {
      loadMyProgress();
    }
  }, [user]);

  useEffect(() => {
    if (progressId) {
      loadProgressDetail(progressId);
      setViewMode('detail');
    } else {
      setViewMode('list');
    }
  }, [progressId]);

  const loadMyProgress = async () => {
    try {
      setIsLoading(true);
      const data = await myApi.getMyProgress();
      setProgressList(data);
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProgressDetail = async (id: string) => {
    try {
      setIsLoading(true);
      const data = await progressApi.getProgressDetail(id);
      setSelectedProgress(data.progress);
      setFeedback(data.feedback);
    } catch (error) {
      console.error('Failed to load progress detail:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await progressApi.createProgress(formData);
      setShowSubmitForm(false);
      setFormData({
        title: '',
        content: '',
        completion: 0,
        problems: '',
        next_plan: '',
      });
      loadMyProgress();
    } catch (error) {
      console.error('Failed to submit progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  const getStatusBadge = (status: string) => {
    if (status === 'pending') {
      return (
        <span className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium border border-yellow-500/30 flex items-center gap-2">
          <FiClock className="w-4 h-4" />
          待审阅
        </span>
      );
    } else if (status === 'reviewed') {
      return (
        <span className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium border border-emerald-500/30 flex items-center gap-2">
          <FiCheck className="w-4 h-4" />
          已反馈
        </span>
      );
    }
    return <span className="px-4 py-2 bg-white/10 text-gray-400 rounded-full text-sm border border-white/20">{status}</span>;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={i <= rating ? 'text-yellow-400' : 'text-gray-600'}>
            ★
          </span>
        ))}
      </div>
    );
  };

  if (isLoading && viewMode === 'list') {
    return (
      <div className="min-h-screen flex">
        <Sidebar type="student" />
        <div className="flex-1 ml-64 flex flex-col gradient-bg particle-bg">
          <Header title="课题进度" subtitle="管理您的课题进度" />
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-neon-purple border-t-transparent"></div>
              <p className="text-gray-400 animate-pulse">加载中...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'detail' && selectedProgress) {
    return (
      <div className="min-h-screen flex">
        <Sidebar type="student" />
        <div className="flex-1 ml-64 flex flex-col gradient-bg particle-bg">
          <Header title="进度详情" subtitle="查看课题进度详情" />
          <div className="flex-1 container mx-auto px-6 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-6">
                <Button
                  variant="outline"
                  onClick={() => navigate('/progress')}
                  className="border-white/20"
                >
                  <FiArrowLeft className="w-4 h-4 mr-2" />
                  返回进度列表
                </Button>
              </div>

              <Card className="p-8 glass mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-neon-purple/10 to-neon-cyan/10 rounded-full blur-3xl"></div>
                
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-2 font-orbitron">{selectedProgress.title}</h1>
                      <p className="text-gray-400 flex items-center gap-2">
                        <FiCalendar className="w-4 h-4" />
                        {formatDate(selectedProgress.created_at)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <div className="text-right">
                        <p className="text-sm text-gray-400">完成度</p>
                        <p className="font-bold text-neon-purple text-3xl font-orbitron">{selectedProgress.completion}%</p>
                      </div>
                      {getStatusBadge(selectedProgress.status)}
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <div className="w-2 h-6 bg-gradient-to-b from-neon-purple to-neon-cyan rounded-full"></div>
                      进度内容
                    </h3>
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                      <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{selectedProgress.content}</p>
                    </div>
                  </div>

                  {selectedProgress.problems && (
                    <div className="mb-8">
                      <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                        <div className="w-2 h-6 bg-gradient-to-b from-neon-pink to-yellow-400 rounded-full"></div>
                        遇到的问题
                      </h3>
                      <div className="bg-yellow-500/10 rounded-xl p-6 border border-yellow-500/20">
                        <p className="text-yellow-200 whitespace-pre-wrap leading-relaxed">{selectedProgress.problems}</p>
                      </div>
                    </div>
                  )}

                  {selectedProgress.next_plan && (
                    <div className="mb-8">
                      <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                        <div className="w-2 h-6 bg-gradient-to-b from-teal-glow to-emerald-500 rounded-full"></div>
                        下一步计划
                      </h3>
                      <div className="bg-emerald-500/10 rounded-xl p-6 border border-emerald-500/20">
                        <p className="text-emerald-200 whitespace-pre-wrap leading-relaxed">{selectedProgress.next_plan}</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-8">
                    <div className="flex justify-between text-sm text-gray-400 mb-3">
                      <span>完成进度</span>
                      <span className="font-bold text-neon-cyan">{selectedProgress.completion}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedProgress.completion}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-pink h-full rounded-full"
                      ></motion.div>
                    </div>
                  </div>
                </div>
              </Card>

              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card className="p-8 glass">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 font-orbitron">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-glow flex items-center justify-center">
                        <FiCheck className="w-5 h-5 text-white" />
                      </div>
                      导师反馈
                    </h2>
                    <div className="bg-gradient-to-br from-emerald-500/10 to-teal-glow/10 rounded-2xl p-6 border border-emerald-500/20">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          {renderStars(feedback.rating)}
                        </div>
                        <span className="flex-shrink-0">
                          {feedback.is_approved ? (
                            <span className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium border border-emerald-500/30">通过</span>
                          ) : (
                            <span className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium border border-yellow-500/30">需修改</span>
                          )}
                        </span>
                      </div>
                      <p className="text-gray-300 whitespace-pre-wrap leading-relaxed text-lg">{feedback.content}</p>
                      <p className="text-sm text-gray-500 mt-4 flex items-center gap-2">
                        <FiCalendar className="w-4 h-4" />
                        {formatDate(feedback.created_at)}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  if (viewMode === 'submit' || showSubmitForm) {
    return (
      <div className="min-h-screen flex">
        <Sidebar type="student" />
        <div className="flex-1 ml-64 flex flex-col gradient-bg particle-bg">
          <Header title="提交进度" subtitle="提交新的课题进度汇报" />
          <div className="flex-1 container mx-auto px-6 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSubmitForm(false);
                    setViewMode('list');
                  }}
                  className="border-white/20"
                >
                  <FiArrowLeft className="w-4 h-4 mr-2" />
                  返回
                </Button>
              </div>

              <Card className="p-8 glass relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-neon-purple/10 to-neon-pink/10 rounded-full blur-3xl"></div>
                
                <div className="relative z-10">
                  <h1 className="text-3xl font-bold text-white mb-8 font-orbitron flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center">
                      <FiPlus className="w-5 h-5 text-white" />
                    </div>
                    提交课题进度汇报
                  </h1>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">进度标题</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-neon-purple/50 transition-all"
                        placeholder="例如：第一周研究进展"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">进度内容</label>
                      <textarea
                        required
                        rows={8}
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-neon-purple/50 transition-all resize-none"
                        placeholder="详细描述本周的研究进展..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">完成度：<span className="text-neon-purple font-bold text-xl">{formData.completion}%</span></label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formData.completion}
                        onChange={(e) => setFormData({ ...formData, completion: parseInt(e.target.value) })}
                        className="w-full h-3 bg-white/10 rounded-full appearance-none cursor-pointer accent-neon-purple"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">遇到的问题（可选）</label>
                      <textarea
                        rows={4}
                        value={formData.problems}
                        onChange={(e) => setFormData({ ...formData, problems: e.target.value })}
                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-neon-purple/50 transition-all resize-none"
                        placeholder="描述研究中遇到的问题..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">下一步计划（可选）</label>
                      <textarea
                        rows={4}
                        value={formData.next_plan}
                        onChange={(e) => setFormData({ ...formData, next_plan: e.target.value })}
                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-neon-purple/50 transition-all resize-none"
                        placeholder="下周的研究计划..."
                      />
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => {
                          setShowSubmitForm(false);
                          setViewMode('list');
                        }}
                        className="border-white/20"
                      >
                        取消
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-gradient-to-r from-neon-purple to-neon-cyan hover:from-neon-purple/90 hover:to-neon-cyan/90 border-0"
                      >
                        {isLoading ? '提交中...' : '提交进度'}
                      </Button>
                    </div>
                  </form>
                </div>
              </Card>
            </motion.div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar type="student" />
      <div className="flex-1 ml-64 flex flex-col gradient-bg particle-bg">
        <Header title="课题进度" subtitle="管理您的课题进度" />
        <div className="flex-1 container mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 font-orbitron">课题进度</h1>
                <p className="text-gray-400">提交和查看您的课题进度</p>
              </div>
              <Button
                onClick={() => setShowSubmitForm(true)}
                className="bg-gradient-to-r from-neon-purple to-neon-cyan hover:from-neon-purple/90 hover:to-neon-cyan/90 border-0"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                提交进度
              </Button>
            </div>

            {progressList.length === 0 ? (
              <Card className="p-12 glass text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 flex items-center justify-center mx-auto mb-6">
                    <FiCalendar className="w-12 h-12 text-gray-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 font-orbitron">暂无进度记录</h3>
                  <p className="text-gray-400 mb-8 max-w-md mx-auto">开始提交您的第一个课题进度，记录您的研究之旅！</p>
                  <Button
                    onClick={() => setShowSubmitForm(true)}
                    className="bg-gradient-to-r from-neon-purple to-neon-cyan hover:from-neon-purple/90 hover:to-neon-cyan/90 border-0"
                  >
                    <FiPlus className="w-4 h-4 mr-2" />
                    提交进度
                  </Button>
                </motion.div>
              </Card>
            ) : (
              <div className="space-y-5">
                {progressList.map((progress, index) => (
                  <motion.div
                    key={progress.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ x: 8, scale: 1.01 }}
                  >
                    <Link to={`/progress/${progress.id}`}>
                      <Card className="p-6 glass hover:border-neon-purple/30 transition-all cursor-pointer group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-neon-purple/5 to-neon-cyan/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-6">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                              <h3 className="font-semibold text-white text-xl group-hover:text-neon-purple transition-colors">{progress.title}</h3>
                              {getStatusBadge(progress.status)}
                            </div>
                            <p className="text-gray-500 text-sm mb-3 flex items-center gap-2">
                              <FiCalendar className="w-4 h-4" />
                              {formatDate(progress.created_at)}
                            </p>
                            <p className="text-gray-400 line-clamp-2 leading-relaxed">{progress.content}</p>
                          </div>
                          <div className="flex flex-col items-end gap-4 min-w-[140px]">
                            <div className="text-right">
                              <p className="text-sm text-gray-500 mb-1">完成度</p>
                              <p className="font-bold text-neon-purple text-2xl font-orbitron">{progress.completion}%</p>
                            </div>
                            <div className="flex items-center gap-2 text-neon-cyan group-hover:text-neon-purple transition-colors">
                              <FiEye className="w-4 h-4" />
                              <span className="text-sm font-medium">查看详情</span>
                              <FiChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="relative z-10 mt-6">
                          <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progress.completion}%` }}
                              transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                              className="bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-pink h-full rounded-full"
                            ></motion.div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default ProgressPage;
