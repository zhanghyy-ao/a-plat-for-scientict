import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  FileText, 
  Mail, 
  Code, 
  BookOpen,
  Loader2,
  Send,
  Copy,
  Check,
  RefreshCw,
  Download
} from 'lucide-react';
import { api } from '../../utils/api';

type WritingType = 'paper' | 'report' | 'email' | 'code' | 'general';

interface WritingOption {
  type: WritingType;
  label: string;
  icon: React.ReactNode;
  description: string;
  placeholder: string;
}

const writingOptions: WritingOption[] = [
  {
    type: 'paper',
    label: '论文写作',
    icon: <BookOpen className="w-5 h-5" />,
    description: '优化论文结构、润色学术表达',
    placeholder: '请输入你的论文段落或大纲...'
  },
  {
    type: 'report',
    label: '进度报告',
    icon: <FileText className="w-5 h-5" />,
    description: '生成或优化课题进度报告',
    placeholder: '描述你本周的工作内容和进展...'
  },
  {
    type: 'email',
    label: '邮件撰写',
    icon: <Mail className="w-5 h-5" />,
    description: '撰写正式、得体的邮件',
    placeholder: '描述邮件的目的和要点...'
  },
  {
    type: 'code',
    label: '代码辅助',
    icon: <Code className="w-5 h-5" />,
    description: '代码审查、优化建议',
    placeholder: '粘贴你的代码...'
  },
  {
    type: 'general',
    label: '通用润色',
    icon: <Sparkles className="w-5 h-5" />,
    description: '通用的文本润色和优化',
    placeholder: '输入需要润色的文本...'
  }
];

const AIWritingAssistant: React.FC = () => {
  const [selectedType, setSelectedType] = useState<WritingType>('report');
  const [content, setContent] = useState('');
  const [requirements, setRequirements] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  const handleAssist = async () => {
    if (!content.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await api.post('/ai/writing/assist', {
        content: content.trim(),
        writing_type: selectedType,
        requirements: requirements.trim()
      });

      setResult(response.data.content || '');
    } catch (error) {
      console.error('写作辅助失败:', error);
      setResult('抱歉，处理过程中出现了错误，请稍后重试。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const handleClear = () => {
    setContent('');
    setRequirements('');
    setResult('');
  };

  const currentOption = writingOptions.find(opt => opt.type === selectedType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-cyan-400" />
            AI写作助手
          </h1>
          <p className="text-slate-400 mt-2">
            智能辅助你的学术写作，提供专业的润色和建议
          </p>
        </div>

        {/* 写作类型选择 */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {writingOptions.map((option) => (
            <motion.button
              key={option.type}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedType(option.type)}
              className={`p-4 rounded-xl border transition-all ${
                selectedType === option.type
                  ? 'bg-cyan-500/20 border-cyan-500 text-white'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className={`mb-2 ${selectedType === option.type ? 'text-cyan-400' : ''}`}>
                {option.icon}
              </div>
              <div className="font-medium">{option.label}</div>
              <div className="text-xs mt-1 opacity-70">{option.description}</div>
            </motion.button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* 输入区域 */}
          <div className="space-y-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  {currentOption?.icon}
                  输入内容
                </h3>
                <button
                  onClick={handleClear}
                  className="text-sm text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  清空
                </button>
              </div>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={currentOption?.placeholder}
                rows={12}
                className="w-full bg-slate-800/50 rounded-xl border border-white/10 p-4 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-cyan-500/50 transition-colors"
              />

              {/* 特殊要求 */}
              <div className="mt-4">
                <label className="text-sm text-slate-400 mb-2 block">
                  特殊要求（可选）
                </label>
                <input
                  type="text"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="例如：使用更正式的学术语言、增加数据分析部分..."
                  className="w-full bg-slate-800/50 rounded-xl border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>

              {/* 提交按钮 */}
              <button
                onClick={handleAssist}
                disabled={!content.trim() || isLoading}
                className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-cyan-400 hover:to-blue-500 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    AI正在处理...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    开始优化
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 结果区域 */}
          <div className="space-y-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  优化结果
                </h3>
                {result && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="text-sm text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-green-400" />
                          已复制
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          复制
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        const blob = new Blob([result], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `ai-writing-${Date.now()}.txt`;
                        a.click();
                      }}
                      className="text-sm text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      下载
                    </button>
                  </div>
                )}
              </div>

              <div className="relative">
                {result ? (
                  <div className="bg-slate-800/50 rounded-xl border border-white/10 p-4 text-white whitespace-pre-wrap leading-relaxed min-h-[400px]">
                    {result}
                  </div>
                ) : (
                  <div className="bg-slate-800/30 rounded-xl border border-dashed border-white/10 p-4 text-slate-500 flex flex-col items-center justify-center min-h-[400px]">
                    <Sparkles className="w-12 h-12 mb-4 opacity-30" />
                    <p>优化结果将显示在这里</p>
                    <p className="text-sm mt-2 opacity-70">
                      在左侧输入内容，点击"开始优化"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 使用提示 */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h4 className="text-white font-medium mb-2">💡 提示</h4>
            <p className="text-sm text-slate-400">
              输入越详细，AI给出的建议越精准。尽量提供完整的上下文信息。
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h4 className="text-white font-medium mb-2">📝 学术规范</h4>
            <p className="text-sm text-slate-400">
              AI会遵循学术写作规范，但最终的学术准确性需要你自己验证。
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h4 className="text-white font-medium mb-2">🔒 隐私保护</h4>
            <p className="text-sm text-slate-400">
              你的输入内容仅用于生成建议，不会被存储或用于其他目的。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIWritingAssistant;
