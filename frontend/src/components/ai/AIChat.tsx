import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Loader2, 
  ThumbsUp, 
  ThumbsDown,
  Settings,
  History,
  X,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';
import { api } from '../../utils/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agent_type?: string;
  agent_name?: string;
  timestamp: string;
  isStreaming?: boolean;
}

interface Agent {
  type: string;
  name: string;
  description?: string;
}

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '你好！我是你的AI科研助手，有什么可以帮助你的吗？\n\n💡 你可以问我：\n• "帮我写一份进度报告"\n• "这周有哪些待办事项？"\n• "推荐一些深度学习论文"\n• "分析我的课题进度"',
      agent_name: 'AI助手',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState('research_assistant');
  const [showAgentSelector, setShowAgentSelector] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 获取可用Agent列表
  useEffect(() => {
    fetchAgents();
  }, []);

  // 自动滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchAgents = async () => {
    try {
      const response = await api.get('/ai/agents');
      setAgents(response.data.agents || []);
    } catch (error) {
      console.error('获取Agent列表失败:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await api.post('/ai/chat', {
        message: userMessage.content,
        agent_type: selectedAgent,
        session_id: sessionId,
        stream: false
      });

      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: response.data.content,
        agent_type: response.data.agent_type,
        agent_name: response.data.agent_name,
        timestamp: response.data.timestamp
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI对话失败:', error);
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: '抱歉，我遇到了一些问题，请稍后重试。',
        agent_name: 'AI助手',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFeedback = async (messageId: string, feedback: 'positive' | 'negative') => {
    // 实现反馈功能
    console.log('Feedback:', messageId, feedback);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: '对话已清空。我是你的AI科研助手，有什么可以帮助你的吗？',
        agent_name: 'AI助手',
        timestamp: new Date().toISOString()
      }
    ]);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* 头部 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-slate-900" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              AI科研助手
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </h2>
            <p className="text-sm text-slate-400">
              {agents.find(a => a.type === selectedAgent)?.name || '科研助手'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Agent选择器 */}
          <div className="relative">
            <button
              onClick={() => setShowAgentSelector(!showAgentSelector)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
            >
              <Settings className="w-4 h-4" />
              切换助手
              {showAgentSelector ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            <AnimatePresence>
              {showAgentSelector && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-slate-800 border border-white/10 shadow-2xl overflow-hidden z-50"
                >
                  {agents.map((agent) => (
                    <button
                      key={agent.type}
                      onClick={() => {
                        setSelectedAgent(agent.type);
                        setShowAgentSelector(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors ${
                        selectedAgent === agent.type ? 'bg-cyan-500/20 border-l-2 border-cyan-500' : ''
                      }`}
                    >
                      <div className="text-white font-medium">{agent.name}</div>
                      {agent.description && (
                        <div className="text-xs text-slate-400 mt-1">{agent.description}</div>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 清空对话 */}
          <button
            onClick={clearChat}
            className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="清空对话"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex gap-4 ${
              message.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            {/* 头像 */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
              message.role === 'user'
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                : 'bg-gradient-to-br from-cyan-500 to-blue-600'
            }`}>
              {message.role === 'user' ? (
                <User className="w-5 h-5 text-white" />
              ) : (
                <Bot className="w-5 h-5 text-white" />
              )}
            </div>

            {/* 消息内容 */}
            <div className={`flex-1 max-w-[80%] ${
              message.role === 'user' ? 'items-end' : 'items-start'
            }`}>
              <div className={`rounded-2xl px-5 py-3 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white ml-auto'
                  : 'bg-white/10 text-white border border-white/10'
              }`}>
                {/* 发送者名称 */}
                {message.role === 'assistant' && message.agent_name && (
                  <div className="text-xs text-cyan-400 mb-1 font-medium">
                    {message.agent_name}
                  </div>
                )}

                {/* 消息文本 */}
                <div className="whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </div>

                {/* 流式加载指示器 */}
                {message.isStreaming && (
                  <div className="flex items-center gap-1 mt-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
              </div>

              {/* 时间和操作 */}
              <div className={`flex items-center gap-2 mt-1 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}>
                <span className="text-xs text-slate-500">
                  {formatTime(message.timestamp)}
                </span>

                {/* 反馈按钮（仅AI消息） */}
                {message.role === 'assistant' && !message.isStreaming && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleFeedback(message.id, 'positive')}
                      className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-green-400 transition-colors"
                    >
                      <ThumbsUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleFeedback(message.id, 'negative')}
                      className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <ThumbsDown className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {/* 加载指示器 */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white/10 rounded-2xl px-5 py-3 border border-white/10">
              <div className="flex items-center gap-2 text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">AI正在思考...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="border-t border-white/10 bg-white/5 backdrop-blur-sm p-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative flex items-end gap-2 bg-slate-800/50 rounded-2xl border border-white/10 p-2">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入消息..."
              rows={1}
              className="flex-1 bg-transparent text-white placeholder-slate-500 px-3 py-2 resize-none outline-none max-h-32"
              style={{ minHeight: '44px' }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:from-cyan-400 hover:to-blue-500 transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-slate-500 text-center mt-2">
            AI助手可能会产生不准确的信息，请验证重要信息。
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
