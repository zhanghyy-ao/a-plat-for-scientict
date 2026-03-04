import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { myApi, messageApi } from '../../../utils/api';
import { 
  FaPaperPlane, FaUserCircle, FaSearch, FaInbox, 
  FaPaperclip, FaArrowLeft, FaCheck, FaCheckDouble
} from 'react-icons/fa';

const GlassMessagesPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'mentor') {
      loadStudents();
    }
  }, [user]);

  useEffect(() => {
    if (selectedStudent) {
      loadConversation();
    }
  }, [selectedStudent]);

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

  const loadConversation = async () => {
    if (!selectedStudent || !selectedStudent.user_id) return;
    
    try {
      const data = await messageApi.getConversation(selectedStudent.user_id.toString());
      setMessages(data);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedStudent) return;
    
    try {
      setIsSending(true);
      await messageApi.sendMessage({
        receiver_id: selectedStudent.user_id,
        content: newMessage.trim(),
        message_type: 'text'
      });
      setNewMessage('');
      await loadConversation();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.student_no?.includes(searchQuery)
  );

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const groupMessagesByDate = () => {
    const groups: { [key: string]: any[] } = {};
    messages.forEach(msg => {
      const dateKey = formatDate(msg.created_at);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(msg);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate();

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
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-transparent border-t-blue-500 border-r-cyan-500 rounded-full mx-auto mb-6"
          />
          <p className="text-white/80 text-lg font-rajdhani tracking-wider">LOADING</p>
        </div>
      </div>
    );
  }

  return (
    <div className="particle-bg">
      <div className="flex h-[calc(100vh-200px)]">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 80 }}
          className="w-80 flex flex-col p-4"
        >
          <div className="glass-strong rounded-3xl flex-1 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h1 className="text-2xl font-bold font-orbitron text-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-sky-500 rounded-xl flex items-center justify-center">
                  <FaInbox className="text-lg text-white" />
                </div>
                消息中心
              </h1>
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="搜索学生..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-12">
                  <FaInbox className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/50 font-rajdhani">暂无学生</p>
                </div>
              ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
                  {filteredStudents.map((student) => (
                    <motion.div
                      key={student.id}
                      variants={itemVariants}
                      onClick={() => setSelectedStudent(student)}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      className={`glass-light rounded-2xl p-4 cursor-pointer transition-all duration-300 ${
                        selectedStudent?.id === student.id 
                          ? 'bg-gradient-to-r from-blue-600/20 to-sky-500/20 border border-blue-500/30' 
                          : 'hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                          className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-500 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-blue-500/25"
                        >
                          {student.name?.charAt(0) || 'S'}
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white mb-1">{student.name}</p>
                          <p className="text-white/60 text-sm font-rajdhani truncate">{student.student_no}</p>
                        </div>
                        {selectedStudent?.id === student.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-3 h-3 bg-purple-500 rounded-full"
                          />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        <div className="flex-1 flex flex-col p-4">
          {!selectedStudent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="glass-strong rounded-3xl flex-1 flex items-center justify-center"
            >
              <div className="text-center">
                <motion.div
                  animate={{ float: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-24 h-24 bg-gradient-to-br from-blue-600/20 to-sky-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6"
                >
                  <FaUserCircle className="w-12 h-12 text-white/40" />
                </motion.div>
                <h2 className="text-2xl font-bold font-orbitron text-white mb-3">选择一个学生</h2>
                <p className="text-white/60 font-rajdhani text-lg">开始对话吧！</p>
              </div>
            </motion.div>
          ) : (
            <div className="glass-strong rounded-3xl flex-1 flex flex-col overflow-hidden">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-600/10 to-sky-500/10"
              >
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-500 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-blue-500/25"
                  >
                    {selectedStudent.name?.charAt(0) || 'S'}
                  </motion.div>
                  <div>
                    <h2 className="text-xl font-bold font-orbitron text-white">{selectedStudent.name}</h2>
                    <p className="text-white/60 font-rajdhani">{selectedStudent.major}</p>
                  </div>
                </div>
              </motion.div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {Object.keys(messageGroups).length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex items-center justify-center"
                  >
                    <div className="text-center">
                      <FaInbox className="w-16 h-16 text-white/20 mx-auto mb-4" />
                      <p className="text-white/50 font-rajdhani text-lg">暂无消息，开始对话吧！</p>
                    </div>
                  </motion.div>
                ) : (
                  Object.entries(messageGroups).map(([date, dateMessages], dateIndex) => (
                    <div key={date}>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: dateIndex * 0.1 }}
                        className="flex justify-center mb-6"
                      >
                        <span className="px-4 py-2 bg-white/10 text-white/60 rounded-full text-xs font-rajdhani">
                          {date}
                        </span>
                      </motion.div>
                      <div className="space-y-4">
                        {dateMessages.map((msg, msgIndex) => (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, x: msg.sender_id === user?.id ? 30 : -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ 
                              type: "spring", 
                              stiffness: 100, 
                              delay: dateIndex * 0.1 + msgIndex * 0.05 
                            }}
                            className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-2xl p-4 relative ${
                                msg.sender_id === user?.id
                                  ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-br-sm shadow-lg shadow-blue-500/30'
                                  : 'glass text-white rounded-bl-sm'
                              }`}
                            >
                              <p className="break-words leading-relaxed">{msg.content}</p>
                              <div className="flex items-center justify-end gap-2 mt-2">
                                <p
                                  className={`text-xs ${
                                    msg.sender_id === user?.id ? 'text-white/70' : 'text-white/50'
                                  } font-rajdhani`}
                                >
                                  {formatTime(msg.created_at)}
                                </p>
                                {msg.sender_id === user?.id && (
                                  msg.is_read ? (
                                    <FaCheckDouble className="text-xs text-sky-300" />
                                  ) : (
                                    <FaCheck className="text-xs text-white/50" />
                                  )
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 border-t border-white/10 bg-white/5"
              >
                <div className="flex items-end gap-4">
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-3 text-white/50 hover:text-white transition-colors"
                  >
                    <FaPaperclip className="text-xl" />
                  </motion.button>
                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder="输入消息..."
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all resize-none"
                      rows={1}
                    />
                  </div>
                  <motion.button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || isSending}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`p-4 rounded-2xl transition-all duration-300 ${
                      newMessage.trim() && !isSending
                        ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white hover:shadow-lg hover:shadow-blue-500/40'
                        : 'bg-white/10 text-white/30 cursor-not-allowed'
                    }`}
                  >
                    {isSending ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-transparent border-t-white rounded-full"
                      />
                    ) : (
                      <FaPaperPlane className="text-sm" />
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlassMessagesPage;
