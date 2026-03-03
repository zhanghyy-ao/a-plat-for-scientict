import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { myApi, progressApi, studentApi } from '../../../utils/api';
import { 
  FaArrowLeft, FaUserGraduate, FaStar, FaCheckCircle, FaTimesCircle,
  FaClipboardList, FaEdit
} from 'react-icons/fa';

const GlassPendingProgressPage: React.FC = () => {
  const [pendingList, setPendingList] = useState<any[]>([]);
  const [selectedProgress, setSelectedProgress] = useState<any>(null);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [feedbackForm, setFeedbackForm] = useState({
    content: '',
    rating: 3,
    is_approved: true,
  });
  const { user } = useAuth();
  const navigate = useNavigate();
  const { progressId } = useParams<{ progressId?: string }>();

  useEffect(() => {
    if (user?.role === 'mentor') {
      loadPendingProgress();
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

  const loadPendingProgress = async () => {
    try {
      setIsLoading(true);
      const data = await myApi.getMyPendingProgress();
      setPendingList(data);
    } catch (error) {
      console.error('Failed to load pending progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProgressDetail = async (id: string) => {
    try {
      setIsLoading(true);
      const data = await progressApi.getProgressDetail(id);
      setSelectedProgress(data.progress);

      if (data.progress.student_id) {
        const student = await studentApi.getStudent(data.progress.student_id);
        setStudentInfo(student);
      }
    } catch (error) {
      console.error('Failed to load progress detail:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgress) return;

    try {
      setIsLoading(true);
      await progressApi.submitFeedback(selectedProgress.id, feedbackForm);
      navigate('/pending-progress');
      loadPendingProgress();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  const StarRating = ({ rating, onChange, editable = false }: { rating: number; onChange?: (rating: number) => void; editable?: boolean }) => {
    return (
      <div className="flex items-center space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            type="button"
            onClick={() => editable && onChange && onChange(star)}
            whileHover={editable ? { scale: 1.2 } : {}}
            whileTap={editable ? { scale: 0.9 } : {}}
            className={`text-2xl transition-all ${star <= rating ? 'text-yellow-400' : 'text-white/30'} ${editable ? 'cursor-pointer' : ''}`}
          >
            <FaStar />
          </motion.button>
        ))}
      </div>
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  if (isLoading && viewMode === 'list') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center particle-bg">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-transparent border-t-purple-500 border-r-cyan-500 rounded-full mx-auto mb-6"
          />
          <p className="text-white/80 text-lg font-rajdhani tracking-wider">LOADING</p>
        </div>
      </div>
    );
  }

  if (viewMode === 'detail' && selectedProgress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 particle-bg py-8">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 80 }}
            className="mb-6"
          >
            <button
              onClick={() => navigate('/pending-progress')}
              className="flex items-center text-white/70 hover:text-white transition-colors mb-4 group"
            >
              <FaArrowLeft className="mr-3 group-hover:-translate-x-1 transition-transform" />
              <span className="font-rajdhani tracking-wider">返回待审列表</span>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 80, delay: 0.1 }}
            className="glass-strong rounded-3xl p-8 mb-8"
          >
            <div className="flex items-center mb-8 pb-8 border-b border-white/10">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center text-white text-3xl font-bold mr-6 shadow-lg shadow-blue-500/30"
              >
                {studentInfo?.name?.charAt(0) || 'S'}
              </motion.div>
              <div>
                <h2 className="text-xl font-semibold font-orbitron text-white mb-2">{studentInfo?.name}</h2>
                <p className="text-white/60 font-rajdhani">{studentInfo?.student_no} · {studentInfo?.grade} · {studentInfo?.major}</p>
                <p className="text-purple-400 text-sm mt-1">{studentInfo?.research_topic}</p>
              </div>
            </div>

            <div className="flex justify-between items-start mb-8">
              <div className="flex-1">
                <h1 className="text-3xl font-bold font-orbitron text-white mb-3">{selectedProgress.title}</h1>
                <p className="text-white/50 mt-2 font-rajdhani">{formatDate(selectedProgress.created_at)}</p>
              </div>
              <div className="text-right">
                <p className="text-white/50 text-sm font-rajdhani">完成度</p>
                <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 text-4xl">{selectedProgress.completion}%</p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="font-semibold font-orbitron text-white mb-4 flex items-center gap-2">
                <FaClipboardList className="text-purple-400" />
                进度内容
              </h3>
              <p className="text-white/70 whitespace-pre-wrap leading-relaxed">{selectedProgress.content}</p>
            </div>

            {selectedProgress.problems && (
              <div className="mb-8 p-6 bg-yellow-500/10 rounded-2xl border border-yellow-500/20">
                <h3 className="font-semibold font-orbitron text-yellow-400 mb-3 flex items-center gap-2">
                  <FaEdit className="text-yellow-400" />
                  遇到的问题
                </h3>
                <p className="text-white/70 whitespace-pre-wrap">{selectedProgress.problems}</p>
              </div>
            )}

            {selectedProgress.next_plan && (
              <div className="mb-8 p-6 bg-green-500/10 rounded-2xl border border-green-500/20">
                <h3 className="font-semibold font-orbitron text-green-400 mb-3 flex items-center gap-2">
                  <FaClipboardList className="text-green-400" />
                  下一步计划
                </h3>
                <p className="text-white/70 whitespace-pre-wrap">{selectedProgress.next_plan}</p>
              </div>
            )}

            <div className="w-full bg-white/10 rounded-full h-4 mt-8 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${selectedProgress.completion}%` }}
                transition={{ duration: 1.5 }}
                className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 80, delay: 0.2 }}
            className="glass-strong rounded-3xl p-8"
          >
            <h2 className="text-2xl font-bold font-orbitron text-white mb-8 flex items-center gap-3">
              <FaEdit className="text-purple-400" />
              撰写反馈
            </h2>

            <form onSubmit={handleSubmitFeedback} className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-4 font-rajdhani">评分</label>
                <StarRating
                  rating={feedbackForm.rating}
                  onChange={(rating) => setFeedbackForm({ ...feedbackForm, rating })}
                  editable={true}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-4 font-rajdhani">审核结果</label>
                <div className="flex space-x-6">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="is_approved"
                      checked={feedbackForm.is_approved}
                      onChange={() => setFeedbackForm({ ...feedbackForm, is_approved: true })}
                      className="w-5 h-5 text-green-600"
                    />
                    <span className="text-green-400 flex items-center text-lg font-medium">
                      <FaCheckCircle className="mr-2" />
                      通过
                    </span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="is_approved"
                      checked={!feedbackForm.is_approved}
                      onChange={() => setFeedbackForm({ ...feedbackForm, is_approved: false })}
                      className="w-5 h-5 text-yellow-600"
                    />
                    <span className="text-yellow-400 flex items-center text-lg font-medium">
                      <FaTimesCircle className="mr-2" />
                      需修改
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-3 font-rajdhani">反馈内容</label>
                <textarea
                  required
                  rows={6}
                  value={feedbackForm.content}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, content: e.target.value })}
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                  placeholder="请输入您的反馈意见..."
                />
              </div>

              <div className="flex justify-end space-x-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/pending-progress')}
                  className="px-8 py-4 border border-white/20 text-white rounded-2xl hover:bg-white/10 transition-all"
                >
                  取消
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-2xl hover:shadow-lg hover:shadow-purple-500/40 transition-all disabled:opacity-50"
                >
                  {isLoading ? '提交中...' : '提交反馈'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 particle-bg py-8">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 80 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold font-orbitron text-white mb-3">待审进度</h1>
          <p className="text-white/60 font-rajdhani text-lg">审阅学生提交的课题进度</p>
        </motion.div>

        {pendingList.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 80 }}
            className="glass-strong rounded-3xl p-16 text-center"
          >
            <FaCheckCircle className="w-20 h-20 text-green-400/30 mx-auto mb-6" />
            <h3 className="text-xl font-semibold font-orbitron text-white mb-3">暂无待审进度</h3>
            <p className="text-white/50 font-rajdhani text-lg">所有进度都已审阅完成！</p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {pendingList.map((progress, index) => (
              <motion.div
                key={progress.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="glass-strong rounded-3xl p-8 hover:bg-white/10 transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-4">
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                          className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold mr-6 shadow-lg shadow-blue-500/25"
                        >
                          <FaUserGraduate />
                        </motion.div>
                        <div className="flex-1">
                          <h3 className="font-semibold font-orbitron text-white text-xl mb-2">{progress.title}</h3>
                          <p className="text-white/50 text-sm font-rajdhani">{formatDate(progress.created_at)}</p>
                        </div>
                      </div>
                      <p className="text-white/70 line-clamp-2 mb-6 leading-relaxed">{progress.content}</p>
                      <div className="flex items-center space-x-6">
                        <div className="flex-1">
                          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progress.completion}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                              className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
                            />
                          </div>
                          <p className="text-white/50 text-sm mt-2 font-rajdhani">完成度：{progress.completion}%</p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-8">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate(`/pending-progress/${progress.id}`)}
                        className="px-8 py-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-2xl font-semibold hover:shadow-lg hover:shadow-purple-500/40 transition-all"
                      >
                        审阅
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GlassPendingProgressPage;
