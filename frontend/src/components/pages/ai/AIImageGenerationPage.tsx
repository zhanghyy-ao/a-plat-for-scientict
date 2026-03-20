import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineSparkles,
  HiOutlinePhoto,
  HiOutlineTrash,
  HiOutlineHeart,
  HiOutlineClock,
  HiOutlineChartBar,
  HiOutlineDocumentChartBar,
  HiOutlineSquares2X2,
  HiOutlineCpuChip,
  HiOutlineArrowDownTray,
} from 'react-icons/hi2';

interface ImageGeneration {
  id: string;
  prompt: string;
  imageType: string;
  imageUrl: string | null;
  status: string;
  createdAt: string;
  isFavorite: boolean;
}

const IMAGE_TYPES = [
  { key: 'chart', label: '数据图表', icon: HiOutlineChartBar, color: 'from-blue-500 to-cyan-400' },
  { key: 'architecture', label: '系统架构', icon: HiOutlineDocumentChartBar, color: 'from-purple-500 to-pink-400' },
  { key: 'flowchart', label: '流程图', icon: HiOutlineSquares2X2, color: 'from-green-500 to-emerald-400' },
  { key: 'model', label: '模型结构', icon: HiOutlineCpuChip, color: 'from-orange-500 to-yellow-400' },
  { key: 'concept', label: '概念图', icon: HiOutlineSparkles, color: 'from-red-500 to-rose-400' },
  { key: 'composite', label: '综合图表', icon: HiOutlinePhoto, color: 'from-indigo-500 to-violet-400' },
];

const QUICK_PROMPTS = [
  '实验室成员结构图',
  '论文发表趋势',
  '研究进度甘特图',
  '系统架构示意图',
  '知识点关系图',
];

const AIImageGenerationPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedType, setSelectedType] = useState('chart');
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<ImageGeneration[]>([]);
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);

    try {
      const response = await fetch('http://localhost:4000/api/ai/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          imageType: selectedType,
          userId: 'current_user',
        }),
      });

      const result = await response.json();
      if (result.ok) {
        setHistory((prev) => [
          {
            id: result.generationId,
            prompt,
            imageType: selectedType,
            imageUrl: result.imageUrl,
            status: 'completed',
            createdAt: new Date().toISOString(),
            isFavorite: false,
          },
          ...prev,
        ]);
      }
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleToggleFavorite = (id: string) => {
    setHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item))
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-700/50 bg-gray-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <HiOutlinePhoto className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  AI 智能画图
                </h1>
                <p className="text-gray-400 text-sm mt-1">用自然语言描述，AI 帮你生成图表和图示</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('generate')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'generate'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                生成图表
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'history'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                生成历史 ({history.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'generate' ? (
            <motion.div key="generate" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {/* 图表类型选择 */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-200">选择图表类型</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {IMAGE_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.key}
                        onClick={() => setSelectedType(type.key)}
                        className={`relative p-4 rounded-xl border transition-all duration-300 group ${
                          selectedType === type.key
                            ? 'border-purple-500/50 bg-purple-500/10 shadow-lg shadow-purple-500/10'
                            : 'border-gray-700/50 bg-gray-800/50 hover:border-gray-600'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${type.color} flex items-center justify-center mb-3 mx-auto transition-transform group-hover:scale-110`}
                        >
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-medium">{type.label}</span>
                        {selectedType === type.key && (
                          <motion.div
                            layoutId="selected-indicator"
                            className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center"
                          >
                            <span className="text-[10px]">✓</span>
                          </motion.div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 输入区域 */}
              <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-200">描述你想要的图表</h3>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="例如：生成一个展示实验室近三年论文发表数量的柱状图，按年份分组，标注具体数值..."
                  className="w-full h-32 bg-gray-900/50 border border-gray-600/50 rounded-xl p-4 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
                />

                {/* 快捷提示 */}
                <div className="flex flex-wrap gap-2 mt-3 mb-4">
                  {QUICK_PROMPTS.map((qp) => (
                    <button
                      key={qp}
                      onClick={() => setPrompt(qp)}
                      className="px-3 py-1.5 text-xs bg-gray-700/50 text-gray-300 rounded-full hover:bg-purple-500/20 hover:text-purple-300 transition-all border border-gray-600/30"
                    >
                      {qp}
                    </button>
                  ))}
                </div>

                {/* 生成按钮 */}
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className={`w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all duration-300 ${
                    prompt.trim() && !isGenerating
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40'
                      : 'bg-gray-700 cursor-not-allowed'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      生成中...
                    </>
                  ) : (
                    <>
                      <HiOutlineSparkles className="w-5 h-5" />
                      开始生成
                    </>
                  )}
                </button>
              </div>

              {/* 最近生成预览 */}
              {history.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-200">最近生成</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {history.slice(0, 6).map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden group"
                      >
                        <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center relative">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.prompt} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center p-4">
                              <HiOutlinePhoto className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">AI 生成的图表将显示在此</p>
                            </div>
                          )}
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleToggleFavorite(item.id)}
                              className={`p-1.5 rounded-lg ${
                                item.isFavorite ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-900/80 text-gray-300'
                              }`}
                            >
                              <HiOutlineHeart className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 rounded-lg bg-gray-900/80 text-gray-300 hover:text-red-400"
                            >
                              <HiOutlineTrash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="text-sm text-gray-300 truncate">{item.prompt}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <HiOutlineClock className="w-3 h-3" />
                              {new Date(item.createdAt).toLocaleString('zh-CN')}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700/50 text-gray-400">
                              {IMAGE_TYPES.find((t) => t.key === item.imageType)?.label || item.imageType}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="history" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {history.length === 0 ? (
                <div className="text-center py-20">
                  <HiOutlinePhoto className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">暂无生成记录</p>
                  <p className="text-gray-500 text-sm mt-2">去「生成图表」页面创建你的第一个 AI 图表吧</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {history.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden group"
                    >
                      <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.prompt} className="w-full h-full object-cover" />
                        ) : (
                          <HiOutlinePhoto className="w-10 h-10 text-gray-500" />
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-gray-300">{item.prompt}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-gray-500">
                            {new Date(item.createdAt).toLocaleString('zh-CN')}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleToggleFavorite(item.id)}
                              className={`text-sm ${item.isFavorite ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-400'}`}
                            >
                              {item.isFavorite ? '★' : '☆'}
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="text-sm text-gray-500 hover:text-red-400">
                              删除
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AIImageGenerationPage;