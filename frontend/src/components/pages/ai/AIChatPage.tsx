import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, History, Trash2 } from 'lucide-react';
import { api } from '../../../utils/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agentType?: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  { icon: '📊', text: '分析我的课题进度', agent: 'progress_analyst' },
  { icon: '📝', text: '帮我写进度报告', agent: 'research_assistant' },
  { icon: '🎓', text: '推荐学习资源', agent: 'learning_mentor' },
  { icon: '📅', text: '生成周报模板', agent: 'admin_assistant' },
];

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '你好！我是你的AI科研助手，有什么可以帮助你的吗？\n\n💡 你可以问我：\n• "帮我分析一下课题进度"\n• "推荐一些深度学习论文"\n• "这周有哪些待办事项？"\n• "帮我写一份进度报告"',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(`session_${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

      const aiMessage: Message = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: response.data.output,
        agentType: response.data.intent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI chat error:', error);
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: '抱歉，服务暂时不可用，请稍后再试。',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: { text: string; agent: string }) => {
    setInput(prompt.text);
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

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => setInput('')}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            新对话
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
            快速开始
          </h3>
          <div className="space-y-2">
            {QUICK_PROMPTS.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleQuickPrompt(prompt)}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors text-sm"
              >
                <span className="mr-2">{prompt.icon}</span>
                {prompt.text}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={clearChat}
            className="w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            清空对话
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">AI科研助手</h1>
              <p className="text-sm text-gray-500">智能体协作系统</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">历史记录</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${
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
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>
              <div
                className={`max-w-[70%] rounded-2xl px-5 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 shadow-sm'
                }`}
              >
                {message.agentType && message.role === 'assistant' && (
                  <div className="text-xs text-blue-600 font-medium mb-1">
                    [{message.agentType}]
                  </div>
                )}
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl px-5 py-3 shadow-sm">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="输入消息..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">
            AI助手可能会生成不准确的信息，请核实重要信息。
          </p>
        </div>
      </div>
    </div>
  );
}
