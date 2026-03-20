import { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../../../utils/api';

interface AIUsageRecord {
  id: string;
  userId: string;
  userRole: string;
  featureType: string;
  agentType: string;
  userQuery: string;
  totalTokens: number;
  responseTimeMs: number;
  modelName: string;
  isSuccess: boolean;
  createdAt: string;
}

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-800',
  mentor: 'bg-blue-100 text-blue-800',
  student: 'bg-green-100 text-green-800',
};

const FEATURE_COLORS: Record<string, string> = {
  chat: 'bg-blue-100 text-blue-800',
  writing: 'bg-green-100 text-green-800',
  analysis: 'bg-yellow-100 text-yellow-800',
  image: 'bg-pink-100 text-pink-800',
  search: 'bg-gray-100 text-gray-800',
};

export default function AIUsageRecordsPage() {
  const [records, setRecords] = useState<AIUsageRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    userRole: '',
    featureType: '',
    keyword: '',
  });
  const [selectedRecord, setSelectedRecord] = useState<AIUsageRecord | null>(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/ai-usage/records', {
        params: {
          page: pagination.page,
          pageSize: pagination.pageSize,
          userRole: filters.userRole || undefined,
          featureType: filters.featureType || undefined,
          keyword: filters.keyword || undefined,
        },
      });
      setRecords(response.data.records);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch records:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [pagination.page, filters.userRole, filters.featureType]);

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchRecords();
  };

  const handleExport = async () => {
    try {
      const response = await api.post(
        '/admin/ai-usage/export',
        { filters, format: 'csv' },
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'ai_usage_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条记录吗？')) return;
    try {
      await api.delete(`/admin/ai-usage/records/${id}`);
      fetchRecords();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">AI使用记录管理</h1>
        <p className="text-gray-500 mt-1">查看和管理所有用户的AI使用记录</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
            <select
              value={filters.userRole}
              onChange={(e) => setFilters({ ...filters, userRole: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部</option>
              <option value="admin">管理员</option>
              <option value="mentor">导师</option>
              <option value="student">学生</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">功能类型</label>
            <select
              value={filters.featureType}
              onChange={(e) => setFilters({ ...filters, featureType: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部</option>
              <option value="chat">AI对话</option>
              <option value="writing">写作辅助</option>
              <option value="analysis">进度分析</option>
              <option value="image">图像生成</option>
              <option value="search">知识检索</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">关键词</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={filters.keyword}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                placeholder="搜索用户输入或AI回复..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSearch}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                搜索
              </button>
            </div>
          </div>
          <button
            onClick={handleExport}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            导出
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                时间
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                用户
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                角色
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                功能类型
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                智能体
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Token数
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                响应时间
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                  加载中...
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                  暂无记录
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(record.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.userId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        ROLE_COLORS[record.userRole] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {record.userRole === 'admin' && '管理员'}
                      {record.userRole === 'mentor' && '导师'}
                      {record.userRole === 'student' && '学生'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        FEATURE_COLORS[record.featureType] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {record.featureType === 'chat' && 'AI对话'}
                      {record.featureType === 'writing' && '写作辅助'}
                      {record.featureType === 'analysis' && '进度分析'}
                      {record.featureType === 'image' && '图像生成'}
                      {record.featureType === 'search' && '知识检索'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.agentType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.totalTokens.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.responseTimeMs}ms
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        record.isSuccess
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {record.isSuccess ? '成功' : '失败'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedRecord(record)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-500">
            共 {pagination.total} 条记录，第 {pagination.page} / {pagination.totalPages} 页
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page <= 1}
              className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">记录详情</h2>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">记录ID</label>
                  <p className="text-sm text-gray-900">{selectedRecord.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">用户ID</label>
                  <p className="text-sm text-gray-900">{selectedRecord.userId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">角色</label>
                  <p className="text-sm text-gray-900">{selectedRecord.userRole}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">功能类型</label>
                  <p className="text-sm text-gray-900">{selectedRecord.featureType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">智能体</label>
                  <p className="text-sm text-gray-900">{selectedRecord.agentType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">模型</label>
                  <p className="text-sm text-gray-900">{selectedRecord.modelName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Token数</label>
                  <p className="text-sm text-gray-900">{selectedRecord.totalTokens}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">响应时间</label>
                  <p className="text-sm text-gray-900">{selectedRecord.responseTimeMs}ms</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">用户输入</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm text-gray-900">
                  {selectedRecord.userQuery}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
