import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiHome, FiBook, FiLayout,
  FiFileText, FiEdit3, FiArrowUpRight,
  FiUsers, FiClipboard,
  FiCalendar,
  FiMessageSquare,
  FiImage
} from 'react-icons/fi';

interface SidebarProps {
  type: 'student' | 'mentor';
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ type, className = '' }) => {
  const studentLinks = [
    { name: '个人工作台', path: '/dashboard', icon: <FiLayout /> },
    { name: '学生中心', path: '/student-hub', icon: <FiHome /> },
    { name: '课题进度', path: '/progress', icon: <FiBook /> },
    { name: '预约管理', path: '/appointments', icon: <FiCalendar /> },
    { name: '学习资源', path: '/resources', icon: <FiFileText /> },
    { name: '个人笔记', path: '/notes', icon: <FiEdit3 /> },
    { name: 'AI 助手', path: '/ai-chat', icon: <FiMessageSquare /> },
    { name: 'AI 画图', path: '/ai-image-generation', icon: <FiImage /> },
  ];

  const mentorLinks = [
    { name: '导师工作台', path: '/mentor-dashboard', icon: <FiHome /> },
    { name: '我的学生', path: '/my-students', icon: <FiUsers /> },
    { name: '待审进度', path: '/pending-progress', icon: <FiClipboard /> },
    { name: 'AI 助手', path: '/ai-chat', icon: <FiMessageSquare /> },
    { name: 'AI 画图', path: '/ai-image-generation', icon: <FiImage /> },
  ];

  const links = type === 'student' ? studentLinks : mentorLinks;

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
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.aside
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={`
        w-64 h-[calc(100vh-80px)] sticky top-[80px] z-40
        transition-all duration-300 flex flex-col
        ${className}
      `}
    >
      <div className="relative flex-1 m-4 bg-gradient-to-br from-neon-purple/20 via-neon-cyan/10 to-neon-pink/20 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_8px_32px_rgba(168,85,247,0.15)] overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-neon-purple/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-neon-cyan/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-neon-pink/10 rounded-full blur-xl -translate-x-1/2 -translate-y-1/2"></div>
        
        <nav className="relative px-5 py-6 h-full flex flex-col">
          <motion.div 
            variants={itemVariants}
            className="mb-8"
          >
            <div className="flex items-center gap-4">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-purple via-neon-cyan to-neon-pink flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)] flex-shrink-0"
              >
                <FiHome className="w-7 h-7 text-white" />
              </motion.div>
              <div className="min-w-0">
                <h3 className="text-xl font-bold font-orbitron text-white truncate">
                  {type === 'student' ? '学生空间' : '导师空间'}
                </h3>
                <p className="text-xs text-gray-300 mt-1 truncate">
                  {type === 'student' ? '探索学术之旅' : '指导学生成长'}
                </p>
              </div>
            </div>
          </motion.div>

          <div className="flex-1 space-y-2 overflow-y-auto scrollbar-hide">
            {links.map((link, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                whileHover={{ x: 6, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <NavLink
                  to={link.path}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-500 group relative overflow-hidden
                    ${isActive 
                      ? 'bg-gradient-to-r from-neon-purple/30 to-neon-cyan/30 text-white border border-neon-purple/40 shadow-[0_4px_20px_rgba(168,85,247,0.3)]'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/20'
                    }
                  `}
                >
                  {({ isActive }) => (
                    <>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 flex-shrink-0 ${
                        isActive 
                          ? 'bg-gradient-to-br from-neon-purple to-neon-cyan text-white shadow-[0_0_20px_rgba(168,85,247,0.5)]'
                          : 'bg-white/10 group-hover:bg-white/20'
                      }`}>
                        <span className={isActive ? '' : 'group-hover:scale-110 transition-transform'}>
                          {link.icon}
                        </span>
                      </div>
                      <span className="font-medium text-sm truncate">{link.name}</span>
                      {isActive && (
                        <motion.div
                          layoutId="active-indicator"
                          className="absolute right-3 w-1.5 h-8 bg-gradient-to-b from-neon-purple to-neon-cyan rounded-full shadow-[0_0_15px_rgba(168,85,247,0.6)]"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              </motion.div>
            ))}
          </div>

          <motion.div 
            variants={itemVariants}
            className="mt-6 pt-4 border-t border-white/10"
          >
            <div className="bg-gradient-to-r from-neon-purple/15 to-neon-cyan/15 rounded-2xl p-4 border border-neon-purple/25 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center flex-shrink-0"
                >
                  <FiArrowUpRight className="w-5 h-5 text-white" />
                </motion.div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-300 mb-0.5 font-medium">快捷方式</p>
                  <p className="text-xs text-white truncate">点击上方导航快速访问</p>
                </div>
              </div>
            </div>
          </motion.div>
        </nav>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
