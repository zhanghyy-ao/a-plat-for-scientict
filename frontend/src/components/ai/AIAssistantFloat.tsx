import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Minimize2, Maximize2, Sparkles } from 'lucide-react';
import { api } from '../../utils/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agentType?: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  { icon: '📊', text: '分析课题进度' },
  { icon: '📝', text: '帮我写进度报告' },
  { icon: '❓', text: '解答问题' },
  { icon: '💡', text: '获取建议' },
];

export default function AIAssistantFloat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '你好！我是你的AI科研助手，有什么可以帮助你的吗？',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(`float_session_${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen, isMinimized]);

  // 监听快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + A 打开AI助手
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setIsOpen(true);
        setIsMinimized(false);
      }
      // ESC 关闭
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.post('/api/ai/chat', {
        message: input,
        sessionId,
        userId: 'current_user',
        userRole: 'student',
      });

      if (response.ok && response.output) {
        const aiMessage: Message = {
          id: `ai_${Date.now()}`,
          role: 'assistant',
          content: response.output,
          agentType: response.intent,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error(response.error || 'AI服务响应无效');
      }
    } catch (error) {
      console.error('AI chat error:', error);
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: '抱歉，AI助手暂时无法回复，请稍后再试。',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (text: string) => {
    setInput(text);
    inputRef.current?.focus();
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: '对话已清空。我是你的AI科研助手，有什么可以帮助你的吗？',
        timestamp: new Date(),
      },
    ]);
  };

  // 悬浮按钮
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 group"
        title="AI助手 (Ctrl+Shift+A)"
      >
        <Bot className="w-7 h-7 group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
      </button>
    );
  }

  // 最小化状态
  if (isMinimized) {
    return (
      <div
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 bg-white rounded-lg shadow-xl border border-gray-200 p-3 cursor-pointer hover:shadow-2xl transition-shadow z-50 flex items-center gap-3"
      >
        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-medium text-gray-900">AI助手</p>
          <p className="text-xs text-gray-500">点击展开</p>
        </div>
        <Maximize2 className="w-4 h-4 text-gray-400" />
      </div>
    );
  }

  // 完整聊天窗口
  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          <div>
            <h3 className="font-semibold text-sm">AI科研助手</h3>
            <p className="text-xs text-blue-100">随时为你服务</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            title="最小化"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            title="关闭"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {QUICK_PROMPTS.map((prompt, index) => (
            <button
              key={index}
              onClick={() => handleQuickPrompt(prompt.text)}
              className="flex-shrink-0 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs hover:bg-blue-50 hover:border-blue-300 transition-colors flex items-center gap-1 text-gray-700"
            >
              <span>{prompt.icon}</span>
              <span>{prompt.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-2 ${
              message.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'user'
                  ? 'bg-blue-600'
                  : 'bg-gradient-to-br from-purple-500 to-blue-500'
              }`}
            >
              {message.role === 'user' ? (
                <span className="text-white text-xs">我</span>
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>
            <div
              className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 shadow-sm text-gray-900'
              }`}
            >
              {message.agentType && message.role === 'assistant' && (
                <div className="text-xs text-blue-600 font-medium mb-1">
                  [{message.agentType}]
                </div>
              )}
              <div className="whitespace-pre-wrap leading-relaxed">
                {message.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl px-3 py-2 shadow-sm">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="输入消息..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <button
            onClick={clearChat}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            清空对话
          </button>
          <span className="text-xs text-gray-400">按 Enter 发送</span>
        </div>
      </div>
    </div>
  );
}
