import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { myApi, progressApi, studentApi } from '../../../utils/api';
import { FaArrowLeft, FaUserGraduate, FaStar, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const PendingProgressPage: React.FC = () => {
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
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => editable && onChange && onChange(star)}
            className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} ${editable ? 'cursor-pointer hover:text-yellow-500' : ''}`}
          >
            <FaStar />
          </button>
        ))}
      </div>
    );
  };

  if (isLoading && viewMode === 'list') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (viewMode === 'detail' && selectedProgress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="mb-6">
            <button
              onClick={() => navigate('/pending-progress')}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <FaArrowLeft className="mr-2" />
              返回待审列表
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center mb-6 pb-6 border-b border-gray-200">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
                {studentInfo?.name?.charAt(0) || 'S'}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">{studentInfo?.name}</h2>
                <p className="text-gray-500">{studentInfo?.student_no} · {studentInfo?.grade} · {studentInfo?.major}</p>
                <p className="text-blue-600 text-sm mt-1">{studentInfo?.research_topic}</p>
              </div>
            </div>

            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{selectedProgress.title}</h1>
                <p className="text-gray-500 mt-2">{formatDate(selectedProgress.created_at)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">完成度</p>
                <p className="font-bold text-blue-600 text-2xl">{selectedProgress.completion}%</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">进度内容</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{selectedProgress.content}</p>
            </div>

            {selectedProgress.problems && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-2">遇到的问题</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{selectedProgress.problems}</p>
              </div>
            )}

            {selectedProgress.next_plan && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-2">下一步计划</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{selectedProgress.next_plan}</p>
              </div>
            )}

            <div className="w-full bg-gray-200 rounded-full h-3 mt-6">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
                style={{ width: `${selectedProgress.completion}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">撰写反馈</h2>

            <form onSubmit={handleSubmitFeedback} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">评分</label>
                <StarRating
                  rating={feedbackForm.rating}
                  onChange={(rating) => setFeedbackForm({ ...feedbackForm, rating })}
                  editable={true}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">审核结果</label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="is_approved"
                      checked={feedbackForm.is_approved}
                      onChange={() => setFeedbackForm({ ...feedbackForm, is_approved: true })}
                      className="w-4 h-4 text-green-600"
                    />
                    <span className="text-green-700 flex items-center">
                      <FaCheckCircle className="mr-1" />
                      通过
                    </span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="is_approved"
                      checked={!feedbackForm.is_approved}
                      onChange={() => setFeedbackForm({ ...feedbackForm, is_approved: false })}
                      className="w-4 h-4 text-yellow-600"
                    />
                    <span className="text-yellow-700 flex items-center">
                      <FaTimesCircle className="mr-1" />
                      需修改
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">反馈内容</label>
                <textarea
                  required
                  rows={6}
                  value={feedbackForm.content}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, content: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入您的反馈意见..."
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/pending-progress')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? '提交中...' : '提交反馈'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">待审进度</h1>
          <p className="text-gray-600">审阅学生提交的课题进度</p>
        </div>

        {pendingList.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FaCheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无待审进度</h3>
            <p className="text-gray-500">所有进度都已审阅完成！</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingList.map((progress) => (
              <div
                key={progress.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold mr-4">
                        <FaUserGraduate />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">{progress.title}</h3>
                        <p className="text-gray-500 text-sm">{formatDate(progress.created_at)}</p>
                      </div>
                    </div>
                    <p className="text-gray-600 line-clamp-2 mb-3">{progress.content}</p>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                            style={{ width: `${progress.completion}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">完成度：{progress.completion}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-6">
                    <button
                      onClick={() => navigate(`/pending-progress/${progress.id}`)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      审阅
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingProgressPage;
