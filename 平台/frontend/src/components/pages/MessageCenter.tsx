import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { myApi, messageApi } from '../../utils/api';
import { 
  FaPaperPlane, FaSearch, FaPlus, FaEllipsisV, FaPhone, FaVideo,
  FaUserCircle, FaUsers, FaBellSlash, FaThumbtack,
  FaTrash, FaReply, FaCopy, FaShare, FaSmile, FaImage, FaFile,
  FaMicrophone, FaCheck, FaCheckDouble, FaTimes, FaArrowLeft
} from 'react-icons/fa';
import Header from '../layout/Header';

// 用户类型定义
interface User {
  id: number;
  name: string;
  role: 'student' | 'mentor' | 'admin';
  status: 'online' | 'offline' | 'busy';
  avatar?: string;
  student_no?: string;
  major?: string;
  title?: string;
  department?: string;
}

// 会话类型定义
interface Conversation {
  id: number;
  type: 'single' | 'group';
  target: {
    id: number;
    name: string;
    role?: string;
    memberCount?: number;
  };
  lastMessage?: {
    content: string;
    time: string;
  };
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
}

// 消息类型定义
interface Message {
  id: number;
  senderId: number | 'me';
  content: string;
  time: string;
  isRead: boolean;
}

const MessageCenter: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'conversations'>('conversations');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, messageId: number} | null>(null);
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'mentor' | 'admin'>('all');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 真实数据状态
  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // 加载用户列表
  useEffect(() => {
    loadUsers();
    loadConversations();
  }, []);

  // 加载消息
  useEffect(() => {
    if (selectedConversation && selectedConversation.type === 'single') {
      loadMessages(selectedConversation.target.id);
      
      // 设置定时器，每3秒刷新一次消息
      const interval = setInterval(() => {
        loadMessages(selectedConversation.target.id);
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 从后端加载用户列表
  const loadUsers = async () => {
    try {
      let userList: User[] = [];
      
      if (user?.role === 'mentor') {
        const students = await myApi.getMyStudents();
        userList = students.map((s: any) => ({
          id: s.user_id,
          name: s.name,
          role: 'student' as const,
          status: 'offline',
          student_no: s.student_no,
          major: s.major,
        }));
      } else if (user?.role === 'student') {
        const mentor = await myApi.getMyMentor();
        if (mentor) {
          userList = [{
            id: mentor.user_id,
            name: mentor.name,
            role: 'mentor' as const,
            status: 'offline',
            title: mentor.title,
            department: mentor.department,
          }];
        }
      }
      
      setUsers(userList);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  // 加载会话列表 - 从所有消息中提取
  const loadConversations = async () => {
    try {
      setLoading(true);
      
      // 获取所有消息
      const allMessages = await messageApi.getMessages();
      
      // 从消息中提取会话
      const conversationMap = new Map<number, Conversation>();
      
      allMessages.forEach((msg: any) => {
        // 确定对话对象ID
        const otherUserId = msg.sender_id === user?.id ? msg.receiver_id : msg.sender_id;
        
        if (!conversationMap.has(otherUserId)) {
          // 查找用户信息
          const otherUser = users.find(u => u.id === otherUserId);
          
          conversationMap.set(otherUserId, {
            id: otherUserId,
            type: 'single',
            target: {
              id: otherUserId,
              name: otherUser?.name || `用户${otherUserId}`,
              role: otherUser?.role,
            },
            lastMessage: {
              content: msg.content,
              time: new Date(msg.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
            },
            unreadCount: msg.receiver_id === user?.id && !msg.is_read ? 1 : 0,
            isPinned: false,
            isMuted: false,
          });
        } else {
          // 更新最后消息和未读数
          const conv = conversationMap.get(otherUserId)!;
          conv.lastMessage = {
            content: msg.content,
            time: new Date(msg.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          };
          if (msg.receiver_id === user?.id && !msg.is_read) {
            conv.unreadCount++;
          }
        }
      });
      
      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error('Failed to load conversations:', error);
      // 如果API失败，使用空列表
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  // 加载消息
  const loadMessages = async (userId: number) => {
    try {
      // 调用后端API获取与特定用户的对话
      const response = await messageApi.getConversation(userId.toString());
      
      // 转换消息格式
      const formattedMessages: Message[] = response.map((msg: any) => ({
        id: msg.id,
        senderId: msg.sender_id === user?.id ? 'me' : msg.sender_id,
        content: msg.content,
        time: new Date(msg.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        isRead: msg.is_read,
      }));
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
      setMessages([]);
    }
  };

  // 创建群聊
  const handleCreateGroup = () => {
    if (!groupName.trim() || selectedMembers.length < 2) {
      alert('请输入群名称并选择至少2个成员');
      return;
    }
    
    const newGroup: Conversation = {
      id: Date.now(),
      type: 'group',
      target: {
        id: Date.now(),
        name: groupName.trim(),
        memberCount: selectedMembers.length + 1,
      },
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
    };
    
    setConversations(prev => [newGroup, ...prev]);
    setSelectedConversation(newGroup);
    setShowCreateGroup(false);
    setGroupName('');
    setSelectedMembers([]);
    setActiveTab('conversations');
  };

  // 切换成员选择
  const toggleMemberSelection = (userId: number) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // 过滤用户
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (u.student_no && u.student_no.includes(searchQuery));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // 过滤会话
  const filteredConversations = conversations.filter(c => 
    c.target.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 过滤消息
  const filteredMessages = messages.filter(m => 
    m.content.toLowerCase().includes(messageSearchQuery.toLowerCase())
  );

  // 获取角色颜色
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'mentor': return 'bg-blue-500';
      case 'student': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // 获取角色标签
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return '管理员';
      case 'mentor': return '导师';
      case 'student': return '学生';
      default: return '用户';
    }
  };

  // 发送消息
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    try {
      // 调用后端API发送消息
      const response = await messageApi.sendMessage({
        receiver_id: selectedConversation.target.id,
        content: newMessage.trim(),
        message_type: 'text'
      });
      
      // 将发送的消息添加到本地列表
      const newMsg: Message = {
        id: response.id,
        senderId: 'me',
        content: response.content,
        time: new Date(response.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        isRead: false,
      };
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      
      // 刷新会话列表
      loadConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('发送消息失败，请重试');
    }
  };

  // 开始与用户聊天
  const startChat = (targetUser: User) => {
    const existingConv = conversations.find(c => 
      c.type === 'single' && c.target.id === targetUser.id
    );
    
    if (existingConv) {
      setSelectedConversation(existingConv);
      setActiveTab('conversations');
    } else {
      const newConv: Conversation = {
        id: Date.now(),
        type: 'single',
        target: {
          id: targetUser.id,
          name: targetUser.name,
          role: targetUser.role,
        },
        unreadCount: 0,
        isPinned: false,
        isMuted: false,
      };
      setConversations(prev => [newConv, ...prev]);
      setSelectedConversation(newConv);
      setActiveTab('conversations');
    }
  };

  // 右键菜单
  const handleContextMenu = (e: React.MouseEvent, messageId: number) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, messageId });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-white/60">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col gradient-bg pt-16">
      <Header />
      
      <div className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
        {/* 左侧边栏 */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-80 flex flex-col border-r border-white/10 bg-black/20"
        >
          {/* 标签切换 */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab('conversations')}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${
                activeTab === 'conversations' 
                  ? 'text-blue-400 border-b-2 border-blue-400' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              会话
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${
                activeTab === 'users' 
                  ? 'text-blue-400 border-b-2 border-blue-400' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              联系人
            </button>
          </div>

          {/* 搜索框 */}
          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm" />
              <input
                type="text"
                placeholder={activeTab === 'users' ? '搜索联系人...' : '搜索会话...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <FaTimes className="text-xs" />
                </button>
              )}
            </div>
          </div>

          {/* 内容区域 */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'users' ? (
              <div className="p-2">
                {/* 角色筛选 */}
                <div className="flex gap-2 px-2 py-3 overflow-x-auto">
                  {[
                    { key: 'all', label: '全部' },
                    { key: 'student', label: '学生' },
                    { key: 'mentor', label: '导师' },
                    { key: 'admin', label: '管理员' },
                  ].map((role) => (
                    <button
                      key={role.key}
                      onClick={() => setRoleFilter(role.key as any)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
                        roleFilter === role.key
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/10 hover:bg-white/20 text-white/80'
                      }`}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>

                {/* 用户列表 */}
                <div className="space-y-1">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-8 text-white/40">
                      <FaUserCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">暂无联系人</p>
                    </div>
                  ) : (
                    filteredUsers.map((u) => (
                      <motion.div
                        key={u.id}
                        whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors"
                        onClick={() => startChat(u)}
                      >
                        <div className="relative">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getRoleColor(u.role)}`}>
                            {u.name.charAt(0)}
                          </div>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-900 ${
                            u.status === 'online' ? 'bg-green-500' : 
                            u.status === 'busy' ? 'bg-red-500' : 'bg-gray-500'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium truncate">{u.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-white/10 text-white/60 rounded">
                              {getRoleLabel(u.role)}
                            </span>
                          </div>
                          <span className="text-white/40 text-xs">
                            {u.status === 'online' ? '在线' : u.status === 'busy' ? '忙碌' : '离线'}
                          </span>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div>
                {/* 置顶会话 */}
                {filteredConversations.filter(c => c.isPinned).length > 0 && (
                  <div className="mb-2">
                    <div className="px-4 py-2 text-xs text-white/40 font-medium">置顶</div>
                    {filteredConversations.filter(c => c.isPinned).map((conv) => (
                      <ConversationItem 
                        key={conv.id} 
                        conversation={conv} 
                        isSelected={selectedConversation?.id === conv.id}
                        onClick={() => setSelectedConversation(conv)}
                      />
                    ))}
                  </div>
                )}

                {/* 普通会话 */}
                <div>
                  <div className="px-4 py-2 text-xs text-white/40 font-medium">消息</div>
                  {filteredConversations.filter(c => !c.isPinned).length === 0 ? (
                    <div className="text-center py-8 text-white/40">
                      <FaUsers className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">暂无会话</p>
                      <p className="text-xs mt-1">从联系人开始聊天</p>
                    </div>
                  ) : (
                    filteredConversations.filter(c => !c.isPinned).map((conv) => (
                      <ConversationItem 
                        key={conv.id} 
                        conversation={conv} 
                        isSelected={selectedConversation?.id === conv.id}
                        onClick={() => setSelectedConversation(conv)}
                      />
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 创建群聊按钮 */}
          {activeTab === 'conversations' && (
            <div className="p-4 border-t border-white/10">
              <button 
                onClick={() => setShowCreateGroup(true)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl transition-colors"
              >
                <FaPlus className="text-sm" />
                <span className="text-sm font-medium">创建群聊</span>
              </button>
            </div>
          )}
        </motion.div>

        {/* 右侧聊天区域 */}
        <div className="flex-1 flex flex-col bg-black/10">
          {!selectedConversation ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaUserCircle className="w-12 h-12 text-white/20" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">选择一个会话</h3>
                <p className="text-white/50">开始与实验室成员交流</p>
              </div>
            </div>
          ) : (
            <>
              {/* 聊天头部 */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-4">
                  {selectedConversation.type === 'group' ? (
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <FaUsers className="text-white" />
                    </div>
                  ) : (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      selectedConversation.target.role === 'admin' ? 'bg-red-500' :
                      selectedConversation.target.role === 'mentor' ? 'bg-blue-500' : 'bg-green-500'
                    }`}>
                      {selectedConversation.target.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-white font-semibold">{selectedConversation.target.name}</h3>
                    <span className="text-white/50 text-sm">
                      {selectedConversation.type === 'group' 
                        ? `${selectedConversation.target.memberCount} 人` 
                        : getRoleLabel(selectedConversation.target.role || '')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative mr-4">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-xs" />
                    <input
                      type="text"
                      placeholder="搜索消息..."
                      value={messageSearchQuery}
                      onChange={(e) => setMessageSearchQuery(e.target.value)}
                      className="pl-8 pr-8 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-48"
                    />
                    {messageSearchQuery && (
                      <button
                        onClick={() => setMessageSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    )}
                  </div>

                  <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                    <FaPhone className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                    <FaVideo className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                    <FaEllipsisV className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* 消息列表 */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {filteredMessages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-white/40">
                      <FaUsers className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>暂无消息</p>
                      <p className="text-sm mt-1">发送第一条消息开始聊天</p>
                    </div>
                  </div>
                ) : (
                  filteredMessages.map((msg, index) => {
                    const isMe = msg.senderId === 'me';
                    const showTime = index === 0 || 
                      new Date(msg.time).getTime() - new Date(filteredMessages[index - 1].time).getTime() > 5 * 60 * 1000;

                    return (
                      <React.Fragment key={msg.id}>
                        {showTime && (
                          <div className="flex justify-center">
                            <span className="text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full">{msg.time}</span>
                          </div>
                        )}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                          onContextMenu={(e) => handleContextMenu(e, msg.id)}
                        >
                          <div className={`flex items-end gap-2 max-w-[70%] ${isMe ? 'flex-row-reverse' : ''}`}>
                            {!isMe && (
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                                selectedConversation.target.role === 'admin' ? 'bg-red-500' :
                                selectedConversation.target.role === 'mentor' ? 'bg-blue-500' : 'bg-green-500'
                              }`}>
                                {selectedConversation.target.name.charAt(0)}
                              </div>
                            )}
                            <div className={`px-4 py-2.5 rounded-2xl ${
                              isMe 
                                ? 'bg-blue-500 text-white rounded-br-md' 
                                : 'bg-white/10 text-white rounded-bl-md'
                            }`}>
                              <p className="text-sm leading-relaxed">{msg.content}</p>
                            </div>
                            {isMe && (
                              <div className="text-white/40 text-xs">
                                {msg.isRead ? <FaCheckDouble className="text-blue-400" /> : <FaCheck />}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </React.Fragment>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* 输入区域 */}
              <div className="p-4 border-t border-white/10 bg-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                    <FaSmile className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                    <FaImage className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                    <FaFile className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                    <FaMicrophone className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-end gap-3">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="输入消息..."
                    rows={1}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none max-h-32"
                    style={{ minHeight: '44px' }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-white/10 disabled:text-white/30 text-white rounded-xl transition-colors flex items-center gap-2"
                  >
                    <FaPaperPlane className="w-4 h-4" />
                    <span className="text-sm font-medium">发送</span>
                  </motion.button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 创建群聊模态框 */}
      <AnimatePresence>
        {showCreateGroup && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-800 border border-white/10 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col"
            >
              {/* 头部 */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      setShowCreateGroup(false);
                      setGroupName('');
                      setSelectedMembers([]);
                    }}
                    className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <FaArrowLeft className="w-5 h-5" />
                  </button>
                  <h3 className="text-lg font-semibold text-white">创建群聊</h3>
                </div>
                <button
                  onClick={handleCreateGroup}
                  disabled={!groupName.trim() || selectedMembers.length < 2}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-white/10 disabled:text-white/30 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  创建
                </button>
              </div>

              {/* 群名称输入 */}
              <div className="p-4 border-b border-white/10">
                <input
                  type="text"
                  placeholder="群名称"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              {/* 成员选择 */}
              <div className="flex-1 overflow-y-auto p-4">
                <p className="text-white/60 text-sm mb-3">选择成员 ({selectedMembers.length} 人已选择)</p>
                <div className="space-y-2">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      onClick={() => toggleMemberSelection(u.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                        selectedMembers.includes(u.id) ? 'bg-blue-500/20 border border-blue-500/30' : 'hover:bg-white/5'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getRoleColor(u.role)}`}>
                        {u.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{u.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-white/10 text-white/60 rounded">
                            {getRoleLabel(u.role)}
                          </span>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedMembers.includes(u.id) 
                          ? 'bg-blue-500 border-blue-500' 
                          : 'border-white/30'
                      }`}>
                        {selectedMembers.includes(u.id) && <FaCheck className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 右键菜单 */}
      <AnimatePresence>
        {contextMenu && (
          <>
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setContextMenu(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed z-50 bg-gray-800 border border-white/10 rounded-lg shadow-xl py-1 min-w-[140px]"
              style={{ left: contextMenu.x, top: contextMenu.y }}
            >
              <button className="w-full px-4 py-2 text-left text-white/80 hover:bg-white/10 flex items-center gap-2 text-sm">
                <FaReply className="w-4 h-4" /> 回复
              </button>
              <button className="w-full px-4 py-2 text-left text-white/80 hover:bg-white/10 flex items-center gap-2 text-sm">
                <FaCopy className="w-4 h-4" /> 复制
              </button>
              <button className="w-full px-4 py-2 text-left text-white/80 hover:bg-white/10 flex items-center gap-2 text-sm">
                <FaShare className="w-4 h-4" /> 转发
              </button>
              <div className="border-t border-white/10 my-1" />
              <button className="w-full px-4 py-2 text-left text-red-400 hover:bg-white/10 flex items-center gap-2 text-sm">
                <FaTrash className="w-4 h-4" /> 删除
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// 会话项组件
const ConversationItem: React.FC<{
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}> = ({ conversation, isSelected, onClick }) => {
  return (
    <motion.div
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
      onClick={onClick}
      className={`flex items-center gap-3 p-3 mx-2 rounded-xl cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-500/20 border border-blue-500/30' : ''
      }`}
    >
      <div className="relative">
        {conversation.type === 'group' ? (
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <FaUsers className="text-white" />
          </div>
        ) : (
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
            conversation.target.role === 'admin' ? 'bg-red-500' :
            conversation.target.role === 'mentor' ? 'bg-blue-500' : 'bg-green-500'
          }`}>
            {conversation.target.name.charAt(0)}
          </div>
        )}
        {conversation.unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-white font-medium truncate">{conversation.target.name}</span>
          <span className="text-white/40 text-xs">{conversation.lastMessage?.time || ''}</span>
        </div>
        <div className="flex items-center gap-1">
          {conversation.isMuted && <FaBellSlash className="w-3 h-3 text-white/40" />}
          <span className="text-white/50 text-sm truncate">{conversation.lastMessage?.content || '暂无消息'}</span>
        </div>
      </div>

      {conversation.isPinned && (
        <FaThumbtack className="w-3 h-3 text-blue-400" />
      )}
    </motion.div>
  );
};

export default MessageCenter;
