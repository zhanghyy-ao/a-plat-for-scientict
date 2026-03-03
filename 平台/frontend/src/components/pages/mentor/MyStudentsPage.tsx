import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { myApi, studentApi } from '../../../utils/api';
import { FaUserGraduate, FaSearch, FaArrowLeft, FaCalendarAlt } from 'react-icons/fa';

const MyStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [progressHistory, setProgressHistory] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { studentId } = useParams<{ studentId?: string }>();

  useEffect(() => {
    if (user?.role === 'mentor') {
      loadStudents();
    }
  }, [user]);

  useEffect(() => {
    if (studentId) {
      loadStudentDetail(studentId);
      setViewMode('detail');
    } else {
      setViewMode('list');
    }
  }, [studentId]);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      const data = await myApi.getMyStudents();
      setStudents(data);
    } catch (error) {
      console.error('Failed to load students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStudentDetail = async (id: string) => {
    try {
      setIsLoading(true);
      const data = await myApi.getMyStudentDetail(id);
      setSelectedStudent(data.student);
      setProgressHistory(data.progress_history || []);
    } catch (error) {
      console.error('Failed to load student detail:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.student_no?.includes(searchQuery)
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">待审阅</span>,
      reviewed: <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">已反馈</span>,
    };
    return badges[status as keyof typeof badges] || <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">{status}</span>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (viewMode === 'detail' && selectedStudent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-6">
            <button
              onClick={() => navigate('/my-students')}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <FaArrowLeft className="mr-2" />
              返回学生列表
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-6">
                {selectedStudent.name?.charAt(0) || 'S'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{selectedStudent.name}</h1>
                <p className="text-gray-600">{selectedStudent.student_no} · {selectedStudent.grade} · {selectedStudent.major}</p>
                <p className="text-blue-600 mt-1">{selectedStudent.research_topic}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2">基本信息</h3>
                <p className="text-gray-600"><span className="font-medium">性别：</span>{selectedStudent.gender || '未填写'}</p>
                <p className="text-gray-600"><span className="font-medium">入学日期：</span>{selectedStudent.enrollment_date || '未填写'}</p>
                <p className="text-gray-600"><span className="font-medium">类型：</span>{selectedStudent.student_type === 'undergraduate' ? '本科生' : selectedStudent.student_type === 'graduate' ? '研究生' : '博士生'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <FaCalendarAlt className="mr-2" />
              进度历史
            </h2>

            {progressHistory.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">暂无进度记录</p>
              </div>
            ) : (
              <div className="space-y-4">
                {progressHistory.map((progress) => (
                  <div key={progress.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800">{progress.title}</h3>
                        <p className="text-sm text-gray-500">{formatDate(progress.created_at)}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">完成度</p>
                          <p className="font-bold text-blue-600">{progress.completion}%</p>
                        </div>
                        {getStatusBadge(progress.status)}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-3">{progress.content}</p>
                    {progress.problems && (
                      <div className="mb-2">
                        <p className="text-sm font-medium text-gray-700">遇到的问题：</p>
                        <p className="text-sm text-gray-600">{progress.problems}</p>
                      </div>
                    )}
                    {progress.next_plan && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">下一步计划：</p>
                        <p className="text-sm text-gray-600">{progress.next_plan}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">我的学生</h1>
          <p className="text-gray-600">管理您指导的学生</p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索学生姓名或学号..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FaUserGraduate className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无学生</h3>
            <p className="text-gray-500">您还没有指导的学生</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <Link
                key={student.id}
                to={`/my-students/${student.id}`}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4">
                    {student.name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{student.name}</h3>
                    <p className="text-sm text-gray-500">{student.student_no}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">年级：</span>{student.grade}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">专业：</span>{student.major}
                  </p>
                  {student.research_topic && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      <span className="font-medium">课题：</span>{student.research_topic}
                    </p>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    查看详情
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyStudentsPage;
